import { HttpStatusCode } from "axios";
import type { Response } from "express";
import z from "zod";
import { TypedRequestBody } from "zod-express-middleware";

import { BookingService } from "../../services/BookingService.js";

export const HandleBookingBodySchema = z.object({
    storeId: z.string(),
    name: z.string(),
    email: z.string(),
    cardNumber: z.string(),
    numItems: z.number().min(1), // At least one item must be booked.
    startTime: z.coerce.date(),
    endTime: z.coerce.date()
});

export async function handleBooking(
    req: TypedRequestBody<typeof HandleBookingBodySchema>,
    res: Response
) {
    const {
        storeId,
        name,
        email,
        cardNumber,
        numItems,
        startTime,
        endTime
    } = req.body;

    const result = await BookingService.createBooking({
        storeId,
        name,
        email,
        cardNumber,
        numItems,
        startTime,
        endTime
    });

    if (!result.success) {
        res.status(HttpStatusCode.BadRequest).json({ error: result.reason });
        return;
    }

    res.status(HttpStatusCode.Created).json({ reservation: result.reservation });
}
