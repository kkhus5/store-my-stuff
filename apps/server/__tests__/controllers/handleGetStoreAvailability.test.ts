import { HttpStatusCode } from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleGetStoreAvailability } from "../../src/controllers/StoreController/handleGetStoreAvailability.js";
import { ReservationRateRepository } from "../../src/repositories/ReservationRateRepository.js";
import { ReservationRepository } from "../../src/repositories/ReservationRepository.js";
import { StoreRepository } from "../../src/repositories/StoreRepository.js";

vi.mock("../../src/repositories/StoreRepository.js", () => ({
    StoreRepository: {
        getStoreById: vi.fn(),
    },
}));

vi.mock("../../src/repositories/ReservationRateRepository.js", () => ({
    ReservationRateRepository: {
        getRatesForDateRange: vi.fn(),
    },
}));

vi.mock("../../src/repositories/ReservationRepository.js", () => ({
    ReservationRepository: {
        getOverlappingReservations: vi.fn(),
    },
}));

const mockedGetStoreById = vi.mocked(StoreRepository.getStoreById);
const mockedGetRatesForDateRange = vi.mocked(
    ReservationRateRepository.getRatesForDateRange,
);
const mockedGetOverlapping = vi.mocked(
    ReservationRepository.getOverlappingReservations,
);

function buildRequest(
    params: Record<string, string>,
    query: Record<string, string> = {},
) {
    return { params, query } as any;
}

function buildResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

const fakeStore = {
    _id: "store-123",
    name: "Downtown Storage",
    phone: "555-1234",
    address: {
        street1: "123 Main St",
        street2: null,
        city: "Springfield",
        state: "IL",
        country: "US",
        postalCode: "62701",
    },
    businessHours: [[{ open: "480", close: "1080" }]],
    timezone: "America/Chicago",
    capacity: 100,
    defaultRate: { rate: 500, type: "DAILY", currency: "USD" },
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("handleGetStoreAvailability", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns all days of the month with rates and remaining capacity", async () => {
        mockedGetStoreById.mockResolvedValue(fakeStore as any);
        mockedGetRatesForDateRange.mockResolvedValue([
            {
                _id: "rate-1",
                storeId: "store-123",
                date: new Date("2026-02-01T00:00:00.000Z"),
                rate: 750,
                type: "DAILY" as any,
                currency: "USD" as any,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        mockedGetOverlapping.mockResolvedValue([]);

        const req = buildRequest(
            { storeId: "store-123" },
            { month: "2026-02" },
        );
        const res = buildResponse();

        await handleGetStoreAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);

        const { days } = res.json.mock.calls[0][0];
        expect(days).toHaveLength(28);
        expect(days[0]).toEqual({
            date: "2026-02-01",
            rate: 750,
            currency: "USD",
            remainingCapacity: 100,
        });
    });

    it("falls back to store defaultRate when no explicit rate exists", async () => {
        mockedGetStoreById.mockResolvedValue(fakeStore as any);
        mockedGetRatesForDateRange.mockResolvedValue([]);
        mockedGetOverlapping.mockResolvedValue([]);

        const req = buildRequest(
            { storeId: "store-123" },
            { month: "2026-03" },
        );
        const res = buildResponse();

        await handleGetStoreAvailability(req, res);

        const { days } = res.json.mock.calls[0][0];
        expect(days).toHaveLength(31);

        for (const day of days) {
            expect(day.rate).toBe(500);
            expect(day.currency).toBe("USD");
        }
    });

    it("computes remaining capacity by subtracting reserved items per day", async () => {
        mockedGetStoreById.mockResolvedValue(fakeStore as any);
        mockedGetRatesForDateRange.mockResolvedValue([]);
        mockedGetOverlapping.mockResolvedValue([
            {
                _id: "res-1",
                storeId: "store-123",
                customerId: "cust-1",
                itemCount: 30,
                totalCost: 1500,
                currency: "USD" as any,
                startTime: new Date("2026-03-01T00:00:00.000Z"),
                endTime: new Date("2026-03-03T00:00:00.000Z"),
                status: "RESERVED" as any,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: "res-2",
                storeId: "store-123",
                customerId: "cust-2",
                itemCount: 20,
                totalCost: 1000,
                currency: "USD" as any,
                startTime: new Date("2026-03-02T00:00:00.000Z"),
                endTime: new Date("2026-03-04T00:00:00.000Z"),
                status: "RESERVED" as any,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const req = buildRequest(
            { storeId: "store-123" },
            { month: "2026-03" },
        );
        const res = buildResponse();

        await handleGetStoreAvailability(req, res);

        const { days } = res.json.mock.calls[0][0];

        const march1 = days.find((d: any) => d.date === "2026-03-01");
        expect(march1.remainingCapacity).toBe(70);

        const march2 = days.find((d: any) => d.date === "2026-03-02");
        expect(march2.remainingCapacity).toBe(50);

        const march3 = days.find((d: any) => d.date === "2026-03-03");
        expect(march3.remainingCapacity).toBe(80);

        const march5 = days.find((d: any) => d.date === "2026-03-05");
        expect(march5.remainingCapacity).toBe(100);
    });

    it("clamps remaining capacity to zero when reservations exceed store capacity", async () => {
        const smallStore = { ...fakeStore, capacity: 10 };
        mockedGetStoreById.mockResolvedValue(smallStore as any);
        mockedGetRatesForDateRange.mockResolvedValue([]);
        mockedGetOverlapping.mockResolvedValue([
            {
                _id: "res-1",
                storeId: "store-123",
                customerId: "cust-1",
                itemCount: 15,
                totalCost: 7500,
                currency: "USD" as any,
                startTime: new Date("2026-04-10T00:00:00.000Z"),
                endTime: new Date("2026-04-11T00:00:00.000Z"),
                status: "RESERVED" as any,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const req = buildRequest(
            { storeId: "store-123" },
            { month: "2026-04" },
        );
        const res = buildResponse();

        await handleGetStoreAvailability(req, res);

        const { days } = res.json.mock.calls[0][0];
        const april10 = days.find((d: any) => d.date === "2026-04-10");
        expect(april10.remainingCapacity).toBe(0);
    });

    it("returns 404 when the store does not exist", async () => {
        mockedGetStoreById.mockRejectedValue(new Error("Not found"));

        const req = buildRequest(
            { storeId: "nonexistent" },
            { month: "2026-06" },
        );
        const res = buildResponse();

        await handleGetStoreAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
        expect(res.json).toHaveBeenCalledWith({ error: "Store not found." });
    });

    it("returns 400 when month query param is missing", async () => {
        const req = buildRequest({ storeId: "store-123" });
        const res = buildResponse();

        await handleGetStoreAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
        expect(res.json).toHaveBeenCalledWith({
            error: 'A valid "month" query parameter is required (YYYY-MM).',
        });
    });

    it("returns 400 when month query param is malformed", async () => {
        const req = buildRequest(
            { storeId: "store-123" },
            { month: "not-a-month" },
        );
        const res = buildResponse();

        await handleGetStoreAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
        expect(res.json).toHaveBeenCalledWith({
            error: 'A valid "month" query parameter is required (YYYY-MM).',
        });
    });
});
