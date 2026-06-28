import { Types } from "mongoose";
import { describe, it, expect } from "vitest";

import { StoreModel } from "../../src/models/Store/model.js";
import { StoreRepository } from "../../src/repositories/StoreRepository.js";
import { useTestDatabase } from "../helpers.js";

describe("StoreRepository", () => {
    useTestDatabase();

    describe("getStoreById", () => {
        it("returns the store when it exists", async () => {
            const doc = await StoreModel.create({
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
                defaultRate: { rate: 500, type: "DAILY", currency: "USD" },
            });

            const store = await StoreRepository.getStoreById(
                doc._id.toString(),
            );

            expect(store._id).toBe(doc._id.toString());
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
