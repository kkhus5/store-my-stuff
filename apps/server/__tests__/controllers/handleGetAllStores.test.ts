import { HttpStatusCode } from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { handleGetAllStores } from "../../src/controllers/StoreController/handleGetAllStores.js";
import { StoreRepository } from "../../src/repositories/StoreRepository.js";

vi.mock("../../src/repositories/StoreRepository.js", () => ({
    StoreRepository: {
        getAllStores: vi.fn(),
    },
}));

const mockedGetAllStores = vi.mocked(StoreRepository.getAllStores);

function buildResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe("handleGetAllStores", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 200 with an empty array when no stores exist", async () => {
        mockedGetAllStores.mockResolvedValue([]);

        const res = buildResponse();

        await handleGetAllStores({} as any, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith({ stores: [] });
    });

    it("returns 200 with all stores", async () => {
        const fakeStores = [
            {
                _id: "store-1",
                name: "Store One",
                phone: "555-0001",
                address: {
                    street1: "1 First St",
                    street2: null,
                    city: "LA",
                    state: "CA",
                    country: "US",
                    postalCode: "90001",
                },
                businessHours: [[{ open: "540", close: "1200" }]],
                timezone: "America/Los_Angeles",
                capacity: 50,
                defaultRate: { rate: 500, type: "DAILY", currency: "USD" },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: "store-2",
                name: "Store Two",
                phone: "555-0002",
                address: {
                    street1: "2 Second St",
                    street2: null,
                    city: "Chicago",
                    state: "IL",
                    country: "US",
                    postalCode: "60601",
                },
                businessHours: [[{ open: "480", close: "1080" }]],
                timezone: "America/Chicago",
                capacity: 75,
                defaultRate: { rate: 600, type: "DAILY", currency: "USD" },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        mockedGetAllStores.mockResolvedValue(fakeStores as any);

        const res = buildResponse();

        await handleGetAllStores({} as any, res);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith({
            stores: [
                {
                    id: "store-1",
                    name: "Store One",
                    phone: "555-0001",
                    address: fakeStores[0].address,
                    businessHours: fakeStores[0].businessHours,
                    timezone: "America/Los_Angeles",
                    capacity: 50,
                    defaultRate: fakeStores[0].defaultRate,
                },
                {
                    id: "store-2",
                    name: "Store Two",
                    phone: "555-0002",
                    address: fakeStores[1].address,
                    businessHours: fakeStores[1].businessHours,
                    timezone: "America/Chicago",
                    capacity: 75,
                    defaultRate: fakeStores[1].defaultRate,
                },
            ],
        });
    });
});
