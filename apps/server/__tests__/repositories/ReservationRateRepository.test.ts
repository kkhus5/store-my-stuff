import { Types } from "mongoose";
import { describe, it, expect } from "vitest";

import { ReservationRateModel } from "../../src/models/ReservationRate/model.js";
import {
    ReservationRateCurrency,
    ReservationRateType,
} from "../../src/models/ReservationRate/types.js";
import { ReservationRateRepository } from "../../src/repositories/ReservationRateRepository.js";
import { useTestDatabase } from "../helpers.js";

describe("ReservationRateRepository", () => {
    useTestDatabase();

    const storeId = new Types.ObjectId().toString();

    describe("getRate", () => {
        it("returns the rate for a given store and date", async () => {
            const date = new Date("2025-06-15T00:00:00Z");

            await ReservationRateModel.create({
                storeId: new Types.ObjectId(storeId),
                date,
                rate: 750,
                type: ReservationRateType.DAILY,
                currency: ReservationRateCurrency.USD,
            });

            const result = await ReservationRateRepository.getRate(
                storeId,
                date,
            );

            expect(result).not.toBeNull();
            expect(result!.rate).toBe(750);
            expect(result!.storeId).toBe(storeId);
            expect(result!.type).toBe(ReservationRateType.DAILY);
        });

        it("returns null when no rate exists for the given date", async () => {
            const result = await ReservationRateRepository.getRate(
                storeId,
                new Date("2099-01-01T00:00:00Z"),
            );

            expect(result).toBeNull();
        });
    });

    describe("getRatesForDateRange", () => {
        it("returns all rates within the date range", async () => {
            const dates = [
                new Date("2025-07-01T00:00:00Z"),
                new Date("2025-07-02T00:00:00Z"),
                new Date("2025-07-03T00:00:00Z"),
            ];

            await ReservationRateModel.insertMany(
                dates.map((date, i) => ({
                    storeId: new Types.ObjectId(storeId),
                    date,
                    rate: 500 + i * 100,
                    type: ReservationRateType.DAILY,
                    currency: ReservationRateCurrency.USD,
                })),
            );

            const rates = await ReservationRateRepository.getRatesForDateRange(
                storeId,
                new Date("2025-07-01T00:00:00Z"),
                new Date("2025-07-03T00:00:00Z"),
            );

            expect(rates).toHaveLength(3);
            expect(rates.map((r) => r.rate).sort()).toEqual([500, 600, 700]);
        });

        it("returns an empty array when no rates exist in the range", async () => {
            const rates = await ReservationRateRepository.getRatesForDateRange(
                storeId,
                new Date("2099-01-01T00:00:00Z"),
                new Date("2099-01-05T00:00:00Z"),
            );

            expect(rates).toHaveLength(0);
        });
    });
});
