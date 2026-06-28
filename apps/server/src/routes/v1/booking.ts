import expressRouter from "express-promise-router";

export const bookingRouter = expressRouter();

bookingRouter.post("/", (_, res) => res.json({ message: "Placed booking." }));
