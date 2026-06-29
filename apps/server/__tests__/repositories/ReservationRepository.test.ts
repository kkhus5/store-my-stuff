import { Types } from "mongoose";
import { describe, it, expect } from "vitest";

import { ReservationStatus } from "../../src/models/Reservation/types.js";
import { ReservationRateCurrency } from "../../src/models/ReservationRate/types.js";
import { ReservationRepository } from "../../src/repositories/ReservationRepository.js";
import { useTestDatabase } from "../helpers.js";

describe("ReservationRepository", () => {
    useTestDatabase();

    const storeId = new Types.ObjectId().toString();
    const customerId = new Types.ObjectId().toString();

    let idempotencyCounter = 0;
    function uniqueKey() {
        return `key-${++idempotencyCounter}-${Date.now()}`;
    }

    describe("createReservation", () => {
        it("creates a reservation and returns the domain object", async () => {
            const reservation = await ReservationRepository.createReservation({
                idempotencyKey: uniqueKey(),
                storeId,
                customerId,
                itemCount: 3,
                totalCost: 1500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-01-10T09:00:00Z"),
                endTime: new Date("2025-01-12T17:00:00Z"),
                status: ReservationStatus.RESERVED,
            });

            expect(reservation._id).toBeTypeOf("string");
            expect(reservation.storeId).toBe(storeId);
            expect(reservation.customerId).toBe(customerId);
            expect(reservation.itemCount).toBe(3);
            expect(reservation.totalCost).toBe(1500);
            expect(reservation.currency).toBe(ReservationRateCurrency.USD);
            expect(reservation.status).toBe(ReservationStatus.RESERVED);
        });

        it("rejects duplicate idempotency keys", async () => {
            const key = uniqueKey();

            await ReservationRepository.createReservation({
                idempotencyKey: key,
                storeId,
                customerId,
                itemCount: 1,
                totalCost: 500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-01-10T09:00:00Z"),
                endTime: new Date("2025-01-11T17:00:00Z"),
                status: ReservationStatus.RESERVED,
            });

            await expect(
                ReservationRepository.createReservation({
                    idempotencyKey: key,
                    storeId,
                    customerId,
                    itemCount: 1,
                    totalCost: 500,
                    currency: ReservationRateCurrency.USD,
                    startTime: new Date("2025-01-10T09:00:00Z"),
                    endTime: new Date("2025-01-11T17:00:00Z"),
                    status: ReservationStatus.RESERVED,
                }),
            ).rejects.toThrow();
        });
    });

    describe("getOverlappingReservations", () => {
        it("returns reservations that overlap the given time window", async () => {
            await ReservationRepository.createReservation({
                idempotencyKey: uniqueKey(),
                storeId,
                customerId,
                itemCount: 2,
                totalCost: 1000,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-02-01T09:00:00Z"),
                endTime: new Date("2025-02-05T17:00:00Z"),
                status: ReservationStatus.RESERVED,
            });

            const overlapping =
                await ReservationRepository.getOverlappingReservations(
                    storeId,
                    new Date("2025-02-03T00:00:00Z"),
                    new Date("2025-02-07T00:00:00Z"),
                );

            expect(overlapping).toHaveLength(1);
            expect(overlapping[0].itemCount).toBe(2);
        });

        it("does not return reservations outside the time window", async () => {
            await ReservationRepository.createReservation({
                idempotencyKey: uniqueKey(),
                storeId,
                customerId,
                itemCount: 1,
                totalCost: 500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-03-01T09:00:00Z"),
                endTime: new Date("2025-03-03T17:00:00Z"),
                status: ReservationStatus.RESERVED,
            });

            const overlapping =
                await ReservationRepository.getOverlappingReservations(
                    storeId,
                    new Date("2025-03-10T00:00:00Z"),
                    new Date("2025-03-15T00:00:00Z"),
                );

            expect(overlapping).toHaveLength(0);
        });

        it("does not return canceled reservations", async () => {
            await ReservationRepository.createReservation({
                idempotencyKey: uniqueKey(),
                storeId,
                customerId,
                itemCount: 4,
                totalCost: 2000,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-04-01T09:00:00Z"),
                endTime: new Date("2025-04-05T17:00:00Z"),
                status: ReservationStatus.CANCELED,
            });

            const overlapping =
                await ReservationRepository.getOverlappingReservations(
                    storeId,
                    new Date("2025-04-02T00:00:00Z"),
                    new Date("2025-04-04T00:00:00Z"),
                );

            expect(overlapping).toHaveLength(0);
        });

        it("includes PENDING reservations in overlap results", async () => {
            await ReservationRepository.createReservation({
                idempotencyKey: uniqueKey(),
                storeId,
                customerId,
                itemCount: 5,
                totalCost: 2500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-05-01T09:00:00Z"),
                endTime: new Date("2025-05-05T17:00:00Z"),
                status: ReservationStatus.PENDING,
            });

            const overlapping =
                await ReservationRepository.getOverlappingReservations(
                    storeId,
                    new Date("2025-05-02T00:00:00Z"),
                    new Date("2025-05-04T00:00:00Z"),
                );

            expect(overlapping).toHaveLength(1);
            expect(overlapping[0].itemCount).toBe(5);
            expect(overlapping[0].status).toBe(ReservationStatus.PENDING);
        });
    });

    describe("updateReservationStatus", () => {
        it("updates the status and returns the updated reservation", async () => {
            const reservation = await ReservationRepository.createReservation({
                idempotencyKey: uniqueKey(),
                storeId,
                customerId,
                itemCount: 2,
                totalCost: 1000,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-06-01T09:00:00Z"),
                endTime: new Date("2025-06-03T17:00:00Z"),
                status: ReservationStatus.PENDING,
            });

            const updated = await ReservationRepository.updateReservationStatus(
                reservation._id,
                ReservationStatus.RESERVED,
            );

            expect(updated._id).toBe(reservation._id);
            expect(updated.status).toBe(ReservationStatus.RESERVED);
        });

        it("can cancel a PENDING reservation", async () => {
            const reservation = await ReservationRepository.createReservation({
                idempotencyKey: uniqueKey(),
                storeId,
                customerId,
                itemCount: 1,
                totalCost: 500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-07-01T09:00:00Z"),
                endTime: new Date("2025-07-02T17:00:00Z"),
                status: ReservationStatus.PENDING,
            });

            const canceled =
                await ReservationRepository.updateReservationStatus(
                    reservation._id,
                    ReservationStatus.CANCELED,
                );

            expect(canceled.status).toBe(ReservationStatus.CANCELED);
        });
    });

    describe("getReservationByIdempotencyKey", () => {
        it("returns the reservation matching the idempotency key", async () => {
            const key = uniqueKey();

            const created = await ReservationRepository.createReservation({
                idempotencyKey: key,
                storeId,
                customerId,
                itemCount: 3,
                totalCost: 1500,
                currency: ReservationRateCurrency.USD,
                startTime: new Date("2025-08-01T09:00:00Z"),
                endTime: new Date("2025-08-03T17:00:00Z"),
                status: ReservationStatus.RESERVED,
            });

            const found =
                await ReservationRepository.getReservationByIdempotencyKey(key);

            expect(found).not.toBeNull();
            expect(found!._id).toBe(created._id);
            expect(found!.idempotencyKey).toBe(key);
        });

        it("returns null when no reservation matches", async () => {
            const found =
                await ReservationRepository.getReservationByIdempotencyKey(
                    "nonexistent-key",
                );

            expect(found).toBeNull();
        });
    });
});
