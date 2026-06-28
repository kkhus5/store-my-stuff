import expressRouter from "express-promise-router";
import { processRequestBody } from "zod-express-middleware";

import { handleBooking, HandleBookingBodySchema } from "../../controllers/BookingController/index.js";

export const bookingRouter = expressRouter();

bookingRouter.post(
    "/",
    processRequestBody(HandleBookingBodySchema),
    handleBooking
);
