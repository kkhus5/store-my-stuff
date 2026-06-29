import mongoose from "mongoose";

import { BounceClient } from "../clients/bounce/index.js";
import {
    BouncePaymentProcessingStatus,
    type BounceProcessPaymentResponse,
} from "../clients/bounce/types.js";
import {
    type Reservation,
    ReservationStatus,
} from "../models/Reservation/types.js";
import {
    type ReservationRate,
    ReservationRateCurrency,
} from "../models/ReservationRate/types.js";
import { CustomerRepository } from "../repositories/CustomerRepository.js";
import { ReservationRepository } from "../repositories/ReservationRepository.js";
import { ReservationRateRepository } from "../repositories/ReservationRateRepository.js";
import { StoreRepository } from "../repositories/StoreRepository.js";

type CreateBookingParams = {
    idempotencyKey: string;
    storeId: string;
    name: string;
    email: string;
    cardNumber: string;
    numItems: number;
    startTime: Date;
    endTime: Date;
};

type BookingResult =
    | { success: true; reservation: Reservation }
    | { success: false; reason: string };

/**
 * Handles all booking-related business logic.
 *
 * @example
 * ```ts
 * await BookingService.createBooking({ ... });
 * ```
 */
export const BookingService = {
    /**
     * Creates a new booking for a customer at a store.
     */
    createBooking,
};

/**
 * Creates a new booking for a customer at a store.
 *
 * Approach:
 * 1. Claim - inside a MongoDB transaction, verify capacity and create a
 *    `PENDING` reservation to atomically reserve the spot.
 * 2. Charge — process payment outside the transaction.
 * 3. Confirm / Cancel — update reservation to `RESERVED` on payment
 *    success, or move it to `CANCELED` on failure.
 *
 * An `idempotencyKey` prevents duplicate bookings from retries or
 * double-clicks. If a reservation with the same key already exists the
 * existing reservation is returned without creating a new one.
 */
async function createBooking(
    params: CreateBookingParams,
): Promise<BookingResult> {
    const {
        idempotencyKey,
        storeId,
        name,
        email,
        cardNumber,
        numItems,
        startTime,
        endTime,
    } = params;

    // Ensure a valid time window is provided.
    if (endTime <= startTime) {
        return { success: false, reason: "End time must be after start time." };
    }

    // If a reservation with this idempotency key already exists, return it
    // rather than creating a duplicate.
    const existing =
        await ReservationRepository.getReservationByIdempotencyKey(
            idempotencyKey,
        );
    if (existing) {
        return { success: true, reservation: existing };
    }

    let store;
    try {
        store = await StoreRepository.getStoreById(storeId);
    } catch {
        return { success: false, reason: "Store not found." };
    }

    // Resolve existing customer or create a new one.
    let customer = await CustomerRepository.getCustomerByEmail(email);
    if (!customer) {
        customer = await CustomerRepository.createCustomer({ name, email });
    }

    // Calculate total cost across all days.
    const dates = getCalendarDates(startTime, endTime);
    const rates = await ReservationRateRepository.getRatesForDateRange(
        storeId,
        dates[0],
        dates[dates.length - 1],
    );

    // Group rates by date.
    const ratesByDate = new Map<string, ReservationRate>();
    for (const rate of rates) {
        ratesByDate.set(toDateKey(rate.date), rate);
    }

    let totalCostInCents = 0;
    for (const date of dates) {
        // If no rate is found for a date, use the store's default rate.
        const rate = ratesByDate.get(toDateKey(date));
        const dailyRate = rate ? rate.rate : store.defaultRate.rate;
        totalCostInCents += dailyRate * numItems;
    }

    // Currently, only USD is supported.
    const currency = ReservationRateCurrency.USD;

    // The transaction ensures that the capacity check and the `PENDING`
    // reservation insert are atomic — two concurrent requests cannot both
    // see the same "1 slot left" and both succeed.
    let pendingReservation: Reservation;

    const session = await mongoose.startSession();
    try {
        pendingReservation = await session.withTransaction(async () => {
            const overlapping =
                await ReservationRepository.getOverlappingReservations(
                    storeId,
                    startTime,
                    endTime,
                    session,
                );

            const reservedItemCount = overlapping.reduce(
                (sum, r) => sum + r.itemCount,
                0,
            );

            if (reservedItemCount + numItems > store.capacity) {
                throw new CapacityError();
            }

            return await ReservationRepository.createReservation(
                {
                    idempotencyKey,
                    storeId,
                    customerId: customer._id,
                    itemCount: numItems,
                    totalCost: totalCostInCents,
                    currency,
                    startTime,
                    endTime,
                    status: ReservationStatus.PENDING,
                },
                session,
            );
        });
    } catch (error) {
        if (error instanceof CapacityError) {
            return { success: false, reason: "The store is at capacity." };
        }

        // Duplicate idempotency key — another request won.
        // Return the reservation that was already created.
        if (isDuplicateKeyError(error)) {
            const duplicate =
                await ReservationRepository.getReservationByIdempotencyKey(
                    idempotencyKey,
                );
            if (duplicate) {
                return { success: true, reservation: duplicate };
            }
        }

        throw error;
    } finally {
        await session.endSession();
    }

    // Process payment.
    const paymentResult = await BounceClient.processPayment({
        amount: totalCostInCents,
        currency,
        cardNumber,
        email,
        name,
    });

    // Confirm or cancel reservation.
    if (!isPaymentSuccess(paymentResult)) {
        await ReservationRepository.updateReservationStatus(
            pendingReservation._id,
            ReservationStatus.CANCELED,
        );
        return {
            success: false,
            reason: `Payment failed: ${paymentResult.detail}`,
        };
    }

    const reservation = await ReservationRepository.updateReservationStatus(
        pendingReservation._id,
        ReservationStatus.RESERVED,
    );

    return { success: true, reservation };
}

/**
 * Returns an array of calendar dates (from midnight UTC) that span the given time window.
 *
 * A time window from 1 Jan. 09:00 to 3 Jan. 17:00 will return [1 Jan., 2 Jan., 3 Jan.].
 */
function getCalendarDates(startTime: Date, endTime: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(startTime);
    current.setUTCHours(0, 0, 0, 0);

    const lastDay = new Date(endTime);
    lastDay.setUTCHours(0, 0, 0, 0);

    while (current <= lastDay) {
        dates.push(new Date(current));
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates;
}

function toDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
}

function isPaymentSuccess(
    result:
        BounceProcessPaymentResponse | { responseCode: number; detail: string },
): result is BounceProcessPaymentResponse {
    return (
        "transactionId" in result &&
        result.status === BouncePaymentProcessingStatus.COMPLETED
    );
}

/**
 * Error thrown inside the transaction when the store is full.
 * Caught in the outer try/catch to return a targeted failure
 * message.
 */
class CapacityError extends Error {
    constructor() {
        super("The store is at capacity.");
    }
}

function isDuplicateKeyError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: unknown }).code === 11000
    );
}
