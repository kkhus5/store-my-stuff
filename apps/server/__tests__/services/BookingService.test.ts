import mongoose from "mongoose";
import { Types } from "mongoose";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { BounceClient } from "../../src/clients/bounce/index.js";
import { BouncePaymentProcessingStatus } from "../../src/clients/bounce/types.js";
import { ReservationStatus } from "../../src/models/Reservation/types.js";
import {
    ReservationRateCurrency,
    ReservationRateType,
} from "../../src/models/ReservationRate/types.js";
import { CustomerRepository } from "../../src/repositories/CustomerRepository.js";
import { ReservationRepository } from "../../src/repositories/ReservationRepository.js";
import { ReservationRateRepository } from "../../src/repositories/ReservationRateRepository.js";
import { StoreRepository } from "../../src/repositories/StoreRepository.js";
import { BookingService } from "../../src/services/BookingService.js";

vi.mock("../../src/repositories/StoreRepository.js", () => ({
    StoreRepository: { getStoreById: vi.fn() },
}));
vi.mock("../../src/repositories/CustomerRepository.js", () => ({
    CustomerRepository: {
        getCustomerByEmail: vi.fn(),
        createCustomer: vi.fn(),
    },
}));
vi.mock("../../src/repositories/ReservationRepository.js", () => ({
    ReservationRepository: {
        getOverlappingReservations: vi.fn(),
        createReservation: vi.fn(),
        updateReservationStatus: vi.fn(),
        getReservationByIdempotencyKey: vi.fn(),
    },
}));
vi.mock("../../src/repositories/ReservationRateRepository.js", () => ({
    ReservationRateRepository: {
        getRate: vi.fn(),
        getRatesForDateRange: vi.fn(),
    },
}));
vi.mock("../../src/clients/bounce/index.js", () => ({
    BounceClient: { processPayment: vi.fn() },
}));

const mockedStoreRepo = vi.mocked(StoreRepository);
const mockedCustomerRepo = vi.mocked(CustomerRepository);
const mockedReservationRepo = vi.mocked(ReservationRepository);
const mockedRateRepo = vi.mocked(ReservationRateRepository);
const mockedBounceClient = vi.mocked(BounceClient);

// Fake session that executes the transaction callback immediately.
const fakeSession = {
    withTransaction: vi.fn(async (fn: () => Promise<unknown>) => fn()),
    endSession: vi.fn(),
};

vi.spyOn(mongoose, "startSession").mockResolvedValue(fakeSession as any);

const storeId = new Types.ObjectId().toString();
const customerId = new Types.ObjectId().toString();

const fakeStore = {
    _id: storeId,
    name: "Test Store",
    phone: "555-0000",
    address: {
        street1: "1 Test Rd",
        street2: null,
        city: "Testville",
        state: "TX",
        country: "US",
        postalCode: "75001",
    },
    businessHours: Array(7).fill([{ open: "480", close: "1080" }]),
    timezone: "America/Chicago",
    capacity: 10,
    defaultRate: {
        rate: 500,
        type: ReservationRateType.DAILY,
        currency: ReservationRateCurrency.USD,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
};

const fakeCustomer = {
    _id: customerId,
    name: "Alice",
    email: "alice@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const baseParams = {
    idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
    storeId,
    name: "Alice",
    email: "alice@example.com",
    cardNumber: "4111111111111111",
    numItems: 2,
    startTime: new Date("2025-01-10T09:00:00Z"),
    endTime: new Date("2025-01-12T17:00:00Z"),
};

function makeFakeReservation(
    overrides: Partial<{
        _id: string;
        status: ReservationStatus;
        idempotencyKey: string;
    }> = {},
) {
    return {
        _id: overrides._id ?? "res-new",
        idempotencyKey: overrides.idempotencyKey ?? baseParams.idempotencyKey,
        storeId,
        customerId,
        itemCount: 2,
        totalCost: 3000,
        currency: ReservationRateCurrency.USD,
        startTime: baseParams.startTime,
        endTime: baseParams.endTime,
        status: overrides.status ?? ReservationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

const successfulPayment = {
    amount: 3000,
    currency: "USD",
    lastFourDigits: "1111",
    merchantReference: "ref-123",
    paymentMethod: "card",
    processingFee: 50,
    status: BouncePaymentProcessingStatus.COMPLETED,
    timestamp: new Date(),
    transactionId: "txn-123",
};

/**
 * Sets up the common happy-path mocks for a successful booking.
 * Individual tests can override specific mocks after calling this.
 */
function setupHappyPath() {
    mockedReservationRepo.getReservationByIdempotencyKey.mockResolvedValue(
        null,
    );
    mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
    mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
    mockedReservationRepo.getOverlappingReservations.mockResolvedValue([]);
    mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);

    const pendingReservation = makeFakeReservation({
        status: ReservationStatus.PENDING,
    });
    mockedReservationRepo.createReservation.mockResolvedValue(
        pendingReservation,
    );

    const confirmedReservation = makeFakeReservation({
        status: ReservationStatus.RESERVED,
    });
    mockedReservationRepo.updateReservationStatus.mockResolvedValue(
        confirmedReservation,
    );

    mockedBounceClient.processPayment.mockResolvedValue(successfulPayment);
}

describe("BookingService.createBooking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        fakeSession.withTransaction.mockImplementation(
            async (fn: () => Promise<unknown>) => fn(),
        );
        fakeSession.endSession.mockResolvedValue(undefined as any);
        vi.spyOn(mongoose, "startSession").mockResolvedValue(
            fakeSession as any,
        );
    });

    it("fails when endTime is not after startTime", async () => {
        const result = await BookingService.createBooking({
            ...baseParams,
            startTime: new Date("2025-01-12T09:00:00Z"),
            endTime: new Date("2025-01-10T09:00:00Z"),
        });

        expect(result).toEqual({
            success: false,
            reason: "End time must be after start time.",
        });
    });

    it("fails when the store is not found", async () => {
        mockedReservationRepo.getReservationByIdempotencyKey.mockResolvedValue(
            null,
        );
        mockedStoreRepo.getStoreById.mockRejectedValue(new Error("Not found"));

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: false,
            reason: "Store not found.",
        });
    });

    it("fails when the store is at capacity", async () => {
        mockedReservationRepo.getReservationByIdempotencyKey.mockResolvedValue(
            null,
        );
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([
            {
                _id: "existing-res",
                idempotencyKey: "other-key",
                storeId,
                customerId: "other-customer",
                itemCount: 9,
                totalCost: 4500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-01-09T09:00:00Z"),
                endTime: new Date("2025-01-13T17:00:00Z"),
                status: ReservationStatus.RESERVED,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: false,
            reason: "The store is at capacity.",
        });
    });

    it("creates reservation as PENDING, then updates to RESERVED on payment success", async () => {
        setupHappyPath();

        const result = await BookingService.createBooking(baseParams);

        expect(result.success).toBe(true);

        // Phase 1: reservation created with PENDING status inside the transaction
        expect(mockedReservationRepo.createReservation).toHaveBeenCalledWith(
            expect.objectContaining({
                status: ReservationStatus.PENDING,
                idempotencyKey: baseParams.idempotencyKey,
            }),
            fakeSession,
        );

        // Phase 3: promoted to RESERVED after payment
        expect(
            mockedReservationRepo.updateReservationStatus,
        ).toHaveBeenCalledWith("res-new", ReservationStatus.RESERVED);
    });

    it("cancels the reservation when payment fails", async () => {
        setupHappyPath();
        mockedBounceClient.processPayment.mockResolvedValue({
            responseCode: 400,
            detail: "Card declined",
        });

        const canceledReservation = makeFakeReservation({
            status: ReservationStatus.CANCELED,
        });
        mockedReservationRepo.updateReservationStatus.mockResolvedValue(
            canceledReservation,
        );

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: false,
            reason: "Payment failed: Card declined",
        });
        expect(
            mockedReservationRepo.updateReservationStatus,
        ).toHaveBeenCalledWith("res-new", ReservationStatus.CANCELED);
    });

    it("creates a new customer if one does not exist", async () => {
        setupHappyPath();
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(null);
        mockedCustomerRepo.createCustomer.mockResolvedValue(fakeCustomer);

        await BookingService.createBooking(baseParams);

        expect(mockedCustomerRepo.createCustomer).toHaveBeenCalledWith({
            name: "Alice",
            email: "alice@example.com",
        });
    });

    it("calculates cost using store default rate when no rate overrides exist", async () => {
        setupHappyPath();

        const result = await BookingService.createBooking(baseParams);

        // 3 calendar days (Jan 10, 11, 12) * 500 cents/day * 2 items = 3000
        expect(mockedBounceClient.processPayment).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 3000 }),
        );
        expect(result.success).toBe(true);
    });

    it("uses date-specific rates when available", async () => {
        setupHappyPath();
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([
            {
                _id: "rate-1",
                storeId,
                date: new Date("2025-01-10T00:00:00Z"),
                rate: 800,
                type: ReservationRateType.DAILY,
                currency: ReservationRateCurrency.USD,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        await BookingService.createBooking(baseParams);

        // Jan 10 = 800 * 2 items = 1600, Jan 11 = 500 * 2 = 1000, Jan 12 = 500 * 2 = 1000 => total = 3600
        expect(mockedBounceClient.processPayment).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 3600 }),
        );
    });

    it("returns the confirmed reservation on a successful booking", async () => {
        setupHappyPath();

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: true,
            reservation: expect.objectContaining({
                _id: "res-new",
                status: ReservationStatus.RESERVED,
            }),
        });
    });

    it("returns existing reservation when idempotency key already exists", async () => {
        const existingReservation = makeFakeReservation({
            _id: "res-existing",
            status: ReservationStatus.RESERVED,
        });
        mockedReservationRepo.getReservationByIdempotencyKey.mockResolvedValue(
            existingReservation,
        );

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: true,
            reservation: existingReservation,
        });

        // Should not attempt to create a new reservation or process payment
        expect(mockedStoreRepo.getStoreById).not.toHaveBeenCalled();
        expect(mockedBounceClient.processPayment).not.toHaveBeenCalled();
        expect(mockedReservationRepo.createReservation).not.toHaveBeenCalled();
    });

    it("handles duplicate key error from concurrent insert gracefully", async () => {
        const duplicateReservation = makeFakeReservation({
            _id: "res-dup",
            status: ReservationStatus.PENDING,
        });

        mockedReservationRepo.getReservationByIdempotencyKey
            .mockResolvedValueOnce(null) // first check before transaction
            .mockResolvedValueOnce(duplicateReservation); // lookup after dup key error

        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([]);

        // Simulate the transaction throwing a duplicate key error
        const dupKeyError = new Error("E11000 duplicate key error");
        (dupKeyError as any).code = 11000;
        fakeSession.withTransaction.mockRejectedValue(dupKeyError);

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: true,
            reservation: duplicateReservation,
        });
    });

    it("opens and closes a mongoose session for the transaction", async () => {
        setupHappyPath();

        await BookingService.createBooking(baseParams);

        expect(mongoose.startSession).toHaveBeenCalled();
        expect(fakeSession.withTransaction).toHaveBeenCalled();
        expect(fakeSession.endSession).toHaveBeenCalled();
    });

    it("ends the session even when the transaction fails", async () => {
        mockedReservationRepo.getReservationByIdempotencyKey.mockResolvedValue(
            null,
        );
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([
            {
                _id: "existing-res",
                idempotencyKey: "other-key",
                storeId,
                customerId: "other-customer",
                itemCount: 9,
                totalCost: 4500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-01-09T09:00:00Z"),
                endTime: new Date("2025-01-13T17:00:00Z"),
                status: ReservationStatus.RESERVED,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        await BookingService.createBooking(baseParams);

        expect(fakeSession.endSession).toHaveBeenCalled();
    });
});
