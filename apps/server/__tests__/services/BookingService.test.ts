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
    storeId,
    name: "Alice",
    email: "alice@example.com",
    cardNumber: "4111111111111111",
    numItems: 2,
    startTime: new Date("2025-01-10T09:00:00Z"),
    endTime: new Date("2025-01-12T17:00:00Z"),
};

describe("BookingService.createBooking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        mockedStoreRepo.getStoreById.mockRejectedValue(new Error("Not found"));

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: false,
            reason: "Store not found.",
        });
    });

    it("fails when the store is at capacity", async () => {
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([
            {
                _id: "existing-res",
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

    it("fails when payment processing fails", async () => {
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([]);
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);
        mockedBounceClient.processPayment.mockResolvedValue({
            responseCode: 400,
            detail: "Card declined",
        });

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({
            success: false,
            reason: "Payment failed: Card declined",
        });
    });

    it("creates a new customer if one does not exist", async () => {
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(null);
        mockedCustomerRepo.createCustomer.mockResolvedValue(fakeCustomer);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([]);
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);
        mockedBounceClient.processPayment.mockResolvedValue({
            amount: 1500,
            currency: "USD",
            lastFourDigits: "1111",
            merchantReference: "ref-123",
            paymentMethod: "card",
            processingFee: 50,
            status: BouncePaymentProcessingStatus.COMPLETED,
            timestamp: new Date(),
            transactionId: "txn-123",
        });

        const fakeReservation = {
            _id: "res-new",
            storeId,
            customerId,
            itemCount: 2,
            totalCost: 1500,
            currency: ReservationRateCurrency.USD,
            startTime: baseParams.startTime,
            endTime: baseParams.endTime,
            status: ReservationStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockedReservationRepo.createReservation.mockResolvedValue(
            fakeReservation,
        );

        await BookingService.createBooking(baseParams);

        expect(mockedCustomerRepo.createCustomer).toHaveBeenCalledWith({
            name: "Alice",
            email: "alice@example.com",
        });
    });

    it("calculates cost using store default rate when no rate overrides exist", async () => {
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([]);
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);
        mockedBounceClient.processPayment.mockResolvedValue({
            amount: 3000,
            currency: "USD",
            lastFourDigits: "1111",
            merchantReference: "ref-456",
            paymentMethod: "card",
            processingFee: 50,
            status: BouncePaymentProcessingStatus.COMPLETED,
            timestamp: new Date(),
            transactionId: "txn-456",
        });

        const fakeReservation = {
            _id: "res-calc",
            storeId,
            customerId,
            itemCount: 2,
            totalCost: 3000,
            currency: ReservationRateCurrency.USD,
            startTime: baseParams.startTime,
            endTime: baseParams.endTime,
            status: ReservationStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockedReservationRepo.createReservation.mockResolvedValue(
            fakeReservation,
        );

        const result = await BookingService.createBooking(baseParams);

        // 3 calendar days (Jan 10, 11, 12) * 500 cents/day * 2 items = 3000
        expect(mockedBounceClient.processPayment).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 3000 }),
        );
        expect(result).toEqual({ success: true, reservation: fakeReservation });
    });

    it("uses date-specific rates when available", async () => {
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([]);

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

        mockedBounceClient.processPayment.mockResolvedValue({
            amount: 3600,
            currency: "USD",
            lastFourDigits: "1111",
            merchantReference: "ref-789",
            paymentMethod: "card",
            processingFee: 50,
            status: BouncePaymentProcessingStatus.COMPLETED,
            timestamp: new Date(),
            transactionId: "txn-789",
        });

        const fakeReservation = {
            _id: "res-rates",
            storeId,
            customerId,
            itemCount: 2,
            totalCost: 3600,
            currency: ReservationRateCurrency.USD,
            startTime: baseParams.startTime,
            endTime: baseParams.endTime,
            status: ReservationStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockedReservationRepo.createReservation.mockResolvedValue(
            fakeReservation,
        );

        await BookingService.createBooking(baseParams);

        // Jan 10 = 800 * 2 items = 1600, Jan 11 = 500 * 2 = 1000, Jan 12 = 500 * 2 = 1000 => total = 3600
        expect(mockedBounceClient.processPayment).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 3600 }),
        );
    });

    it("returns the reservation on a successful booking", async () => {
        mockedStoreRepo.getStoreById.mockResolvedValue(fakeStore);
        mockedCustomerRepo.getCustomerByEmail.mockResolvedValue(fakeCustomer);
        mockedReservationRepo.getOverlappingReservations.mockResolvedValue([]);
        mockedRateRepo.getRatesForDateRange.mockResolvedValue([]);
        mockedBounceClient.processPayment.mockResolvedValue({
            amount: 3000,
            currency: "USD",
            lastFourDigits: "1111",
            merchantReference: "ref-final",
            paymentMethod: "card",
            processingFee: 50,
            status: BouncePaymentProcessingStatus.COMPLETED,
            timestamp: new Date(),
            transactionId: "txn-final",
        });

        const fakeReservation = {
            _id: "res-final",
            storeId,
            customerId,
            itemCount: 2,
            totalCost: 3000,
            currency: ReservationRateCurrency.USD,
            startTime: baseParams.startTime,
            endTime: baseParams.endTime,
            status: ReservationStatus.RESERVED,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockedReservationRepo.createReservation.mockResolvedValue(
            fakeReservation,
        );

        const result = await BookingService.createBooking(baseParams);

        expect(result).toEqual({ success: true, reservation: fakeReservation });
        expect(mockedReservationRepo.createReservation).toHaveBeenCalledWith({
            storeId,
            customerId,
            itemCount: 2,
            totalCost: 3000,
            currency: ReservationRateCurrency.USD,
            startTime: baseParams.startTime,
            endTime: baseParams.endTime,
            status: ReservationStatus.RESERVED,
        });
    });
});
