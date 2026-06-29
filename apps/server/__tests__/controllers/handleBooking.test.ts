import { HttpStatusCode } from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleBooking } from "../../src/controllers/BookingController/handleBooking.js";
import { BookingService } from "../../src/services/BookingService.js";

vi.mock("../../src/services/BookingService.js", () => ({
    BookingService: {
        createBooking: vi.fn(),
    },
}));

const mockedCreateBooking = vi.mocked(BookingService.createBooking);

function buildRequest(body: Record<string, unknown>) {
    return { body } as any;
}

function buildResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe("handleBooking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 201 with the reservation on success", async () => {
        const fakeReservation = {
            _id: "res-123",
            storeId: "store-1",
            customerId: "cust-1",
            itemCount: 2,
            totalCost: 1000,
            currency: "USD",
            startTime: new Date("2025-01-10T09:00:00Z"),
            endTime: new Date("2025-01-12T17:00:00Z"),
            status: "RESERVED",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockedCreateBooking.mockResolvedValue({
            success: true,
            reservation: fakeReservation as any,
        });

        const req = buildRequest({
            idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
            storeId: "store-1",
            name: "Alice",
            email: "alice@example.com",
            cardNumber: "4111111111111111",
            numItems: 2,
            startTime: new Date("2025-01-10T09:00:00Z"),
            endTime: new Date("2025-01-12T17:00:00Z"),
        });
        const res = buildResponse();

        await handleBooking(req, res);

        expect(mockedCreateBooking).toHaveBeenCalledWith({
            idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
            storeId: "store-1",
            name: "Alice",
            email: "alice@example.com",
            cardNumber: "4111111111111111",
            numItems: 2,
            startTime: new Date("2025-01-10T09:00:00Z"),
            endTime: new Date("2025-01-12T17:00:00Z"),
        });
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created);
        expect(res.json).toHaveBeenCalledWith({
            reservation: fakeReservation,
        });
    });

    it("returns 400 with the error reason on failure", async () => {
        mockedCreateBooking.mockResolvedValue({
            success: false,
            reason: "The store is at capacity.",
        });

        const req = buildRequest({
            idempotencyKey: "660e8400-e29b-41d4-a716-446655440001",
            storeId: "store-1",
            name: "Bob",
            email: "bob@example.com",
            cardNumber: "4111111111111111",
            numItems: 5,
            startTime: new Date("2025-01-10T09:00:00Z"),
            endTime: new Date("2025-01-12T17:00:00Z"),
        });
        const res = buildResponse();

        await handleBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
        expect(res.json).toHaveBeenCalledWith({
            error: "The store is at capacity.",
        });
    });
});
