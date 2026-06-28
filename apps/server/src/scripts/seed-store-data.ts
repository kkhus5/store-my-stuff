// pnpm exec tsx src/scripts/seed-store-data.ts
import "../config/ingestEnvironmentFiles.js";

import { connectMongoose } from "../config/mongoConfig.js";
import {
    ReservationRateCurrency,
    ReservationRateType,
} from "../models/ReservationRate/index.js";
import { StoreRepository } from "../repositories/StoreRepository.js";

const ENV_FILE = process.env.ENV_FILE;
const MONGO_URI = process.env.MONGO_URI;
const SCRIPT_NAME = "seed-store-data.ts";

const execute = async () => {
    const store = await StoreRepository.createStore({
        name: "Kyle's Kangaroo Farm",
        phone: "213-613-9300",
        address: {
            street1: "2400 S. Sepulveda Blvd",
            street2: null,
            city: "Los Angeles",
            state: "CA",
            country: "US",
            postalCode: "90001",
        },
        businessHours: [
            [],
            [{ open: "540", close: "1200" }],
            [{ open: "540", close: "1200" }],
            [{ open: "540", close: "1200" }],
            [{ open: "540", close: "1200" }],
            [{ open: "540", close: "1200" }],
            [{ open: "540", close: "1200" }],
        ],
        timezone: "America/Los_Angeles",
        capacity: 100,
        defaultRate: {
            rate: 550,
            type: ReservationRateType.DAILY,
            currency: ReservationRateCurrency.USD,
        },
    });

    console.log("store created:", { store });
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
