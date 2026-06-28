import expressRouter from "express-promise-router";

import { bookingRouter } from "./booking.js";
import { storeRouter } from "./store.js";

export const v1Router = expressRouter();

v1Router.use("/booking", bookingRouter);
v1Router.use("/store", storeRouter);
