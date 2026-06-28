import { HttpStatusCode } from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleGetStore } from "../../src/controllers/StoreController/handleGetStore.js";
import { StoreRepository } from "../../src/repositories/StoreRepository.js";

vi.mock("../../src/repositories/StoreRepository.js", () => ({
    StoreRepository: {
        getStoreById: vi.fn(),
    },
}));

const mockedGetStoreById = vi.mocked(StoreRepository.getStoreById);

function buildRequest(params: Record<string, string>) {
    return { params } as any;
}

function buildResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe("handleGetStore", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 200 with the store on success", async () => {
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

        mockedGetStoreById.mockResolvedValue(fakeStore as any);

        const req = buildRequest({ storeId: "store-123" });
        const res = buildResponse();

        await handleGetStore(req, res);

        expect(mockedGetStoreById).toHaveBeenCalledWith("store-123");
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith({
            store: {
                id: "store-123",
                name: "Downtown Storage",
                phone: "555-1234",
                address: fakeStore.address,
                businessHours: fakeStore.businessHours,
                timezone: "America/Chicago",
                capacity: 100,
                defaultRate: fakeStore.defaultRate,
            },
        });
    });

    it("returns 404 when the store is not found", async () => {
        mockedGetStoreById.mockRejectedValue(new Error("Not found"));

        const req = buildRequest({ storeId: "nonexistent" });
        const res = buildResponse();

        await handleGetStore(req, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
        expect(res.json).toHaveBeenCalledWith({ error: "Store not found." });
    });
});
