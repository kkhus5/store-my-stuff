import { Types } from "mongoose";
import { describe, it, expect } from "vitest";

import { StoreRepository } from "../../src/repositories/StoreRepository.js";
import { useTestDatabase } from "../helpers.js";

const storeData = {
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
    businessHours: [
        [{ open: "480", close: "1080" }],
        [{ open: "480", close: "1080" }],
        [{ open: "480", close: "1080" }],
        [{ open: "480", close: "1080" }],
        [{ open: "480", close: "1080" }],
        [{ open: "480", close: "1080" }],
        [],
    ],
    timezone: "America/Chicago",
    capacity: 100,
    defaultRate: {
        rate: 500,
        type: "DAILY" as const,
        currency: "USD" as const,
    },
};

describe("StoreRepository", () => {
    useTestDatabase();

    describe("createStore", () => {
        it("creates a store and returns the domain object", async () => {
            const store = await StoreRepository.createStore(storeData);

            expect(store._id).toBeTypeOf("string");
            expect(store.name).toBe("Downtown Storage");
            expect(store.phone).toBe("555-1234");
            expect(store.address.city).toBe("Springfield");
            expect(store.capacity).toBe(100);
            expect(store.defaultRate.rate).toBe(500);
            expect(store.createdAt).toBeInstanceOf(Date);
            expect(store.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe("getStoreById", () => {
        it("returns the store when it exists", async () => {
            const created = await StoreRepository.createStore(storeData);

            const store = await StoreRepository.getStoreById(created._id);

            expect(store._id).toBe(created._id);
            expect(store.name).toBe("Downtown Storage");
            expect(store.capacity).toBe(100);
            expect(store.defaultRate.rate).toBe(500);
        });

        it("throws when the store does not exist", async () => {
            const fakeId = new Types.ObjectId().toString();

            await expect(
                StoreRepository.getStoreById(fakeId),
            ).rejects.toThrow();
        });
    });
});
