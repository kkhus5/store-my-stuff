import { ReservationRateCurrency } from "../ReservationRate/types.js";

/**
 * Status of a reservation.
 *
 * - `PENDING` — the customer is in the process of booking.
 * - `RESERVED` — the customer successfully paid for the reservation.
 * - `CANCELED` — the customer canceled or backed out of the reservation.
 * - `ENDED` — the reservation period has ended.
 */
export enum ReservationStatus {
    PENDING = "PENDING",
    RESERVED = "RESERVED",
    CANCELED = "CANCELED",
    ENDED = "ENDED",
}

/**
 * Domain type for a reservation.
 *
 * This is the lean, POJO representation of a `Reservation`
 * document (safe to spread).
 *
 * Represents booking data for a customer at a store.
 */
export interface Reservation {
    _id: string;
    /**
     * Client-generated key used to prevent duplicate bookings from
     * retries or double-clicks. Enforced as a unique index in MongoDB.
     */
    idempotencyKey: string;
    /**
     * Foreign key for the `Store` document (the store the reservation is for).
     */
    storeId: string;
    /**
     * Foreign key for the `Customer` document (the customer who owns the reservation).
     */
    customerId: string;
    /**
     * How many items the customer will be storing in this reservation.
     */
    itemCount: number;
    /**
     * Total cost of the reservation, in cents.
     */
    totalCost: number;
    /**
     * Currency code for the total cost.
     */
    currency: ReservationRateCurrency;
    /**
     * When this reservation starts.
     */
    startTime: Date;
    /**
     * When this reservation ends.
     */
    endTime: Date;
    /**
     * Current status of the reservation.
     */
    status: ReservationStatus;
    createdAt: Date;
    updatedAt: Date;
}
