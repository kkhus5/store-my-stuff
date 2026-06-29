import { HttpStatusCode } from "axios";
import type { Request, Response } from "express";
import z from "zod";

import { ReservationRateRepository } from "../../repositories/ReservationRateRepository.js";
import { ReservationRepository } from "../../repositories/ReservationRepository.js";
import { StoreRepository } from "../../repositories/StoreRepository.js";

export const GetStoreAvailabilityParamsSchema = z.object({
    storeId: z.string(),
});

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const GetStoreAvailabilityQuerySchema = z.object({
    month: z.string().regex(MONTH_PATTERN),
});

/**
 * Returns per-day rates and remaining capacity for a store in the requested month.
 *
 * `GET /store/:storeId/availability?month=YYYY-MM`
 */
export async function handleGetStoreAvailability(
    req: Request<z.infer<typeof GetStoreAvailabilityParamsSchema>>,
    res: Response,
) {
    const { storeId } = req.params;

    const parsed = GetStoreAvailabilityQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(HttpStatusCode.BadRequest).json({
            error: 'A valid "month" query parameter is required (YYYY-MM).',
        });
        return;
    }

    const { month } = parsed.data;

    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    const monthStart = new Date(Date.UTC(year, monthIndex, 1));
    const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 1));

    let store;
    try {
        store = await StoreRepository.getStoreById(storeId);
    } catch {
        res.status(HttpStatusCode.NotFound).json({ error: "Store not found." });
        return;
    }

    const lastDay = new Date(monthEnd);
    lastDay.setUTCDate(lastDay.getUTCDate() - 1);

    const rates = await ReservationRateRepository.getRatesForDateRange(
        storeId,
        monthStart,
        lastDay,
    );

    const ratesByDate = new Map<string, { rate: number; currency: string }>();
    for (const rate of rates) {
        ratesByDate.set(toDateKey(rate.date), {
            rate: rate.rate,
            currency: rate.currency,
        });
    }

    // Fetch all reservations overlapping any day in the month in a single query,
    // then attribute each reservation's items to the specific days it spans.
    const reservations = await ReservationRepository.getOverlappingReservations(
        storeId,
        monthStart,
        monthEnd,
    );

    const days = [];
    const current = new Date(monthStart);

    while (current < monthEnd) {
        const dateKey = toDateKey(current);
        const dayStart = new Date(current);
        const dayEnd = new Date(current);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

        const reservedItems = reservations
            .filter((r) => r.startTime < dayEnd && r.endTime > dayStart)
            .reduce((sum, r) => sum + r.itemCount, 0);

        const rateInfo = ratesByDate.get(dateKey);

        days.push({
            date: dateKey,
            rate: rateInfo?.rate ?? store.defaultRate.rate,
            currency: rateInfo?.currency ?? store.defaultRate.currency,
            remainingCapacity: Math.max(0, store.capacity - reservedItems),
        });

        current.setUTCDate(current.getUTCDate() + 1);
    }

    res.status(HttpStatusCode.Ok).json({ days });
}

function toDateKey(date: Date): string {
    return date.toISOString().split("T")[0];
}
