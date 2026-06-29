// pnpm exec tsx src/scripts/seed-reservation-rate-data.ts
import "../config/ingestEnvironmentFiles.js";

import { connectMongoose } from "../config/mongoConfig.js";
import {
    ReservationRateModel,
    ReservationRateCurrency,
    ReservationRateType,
} from "../models/ReservationRate/index.js";

const ENV_FILE = process.env.ENV_FILE;
const MONGO_URI = process.env.MONGO_URI;
const SCRIPT_NAME = "seed-reservation-rate-data.ts";

const STORE_ID = "6a418d366a96a0913cbad9c4";
const RATE_CENTS = 700;
const DATE = new Date("2026-07-04");

const execute = async () => {
    DATE.setUTCHours(0, 0, 0, 0);

    const rate = await ReservationRateModel.create({
        storeId: STORE_ID,
        date: DATE,
        rate: RATE_CENTS,
        type: ReservationRateType.DAILY,
        currency: ReservationRateCurrency.USD,
    });

    console.log(
        `Inserted reservation rate for store ${STORE_ID}:`,
        rate.toJSON(),
    );
};

void (async () => {
    console.log("Script to run:", SCRIPT_NAME);
    console.log("Environment file:", ENV_FILE);
    console.log("Mongo uri:", MONGO_URI);
    console.log("Running script:", SCRIPT_NAME);
    await connectMongoose();
})()
    .then(execute)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("error occurred", { error });
        process.exit(1);
    });
