import expressRouter from "express-promise-router";

import { bookingRouter } from "./booking.js";

export const v1Router = expressRouter();

v1Router.use("/booking", bookingRouter);
