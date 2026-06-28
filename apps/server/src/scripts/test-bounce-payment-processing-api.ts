// pnpm exec tsx src/scripts/one-off/test-api.ts
import "../config/ingestEnvironmentFiles.js";

import { BounceClient } from "../clients/bounce/index.js";

const ENV_FILE = process.env.ENV_FILE;
const MONGO_URI = process.env.MONGO_URI;
const SCRIPT_NAME = "test-api.ts";

const execute = async () => {
    const result = await BounceClient.processPayment({
        amount: 100,
        currency: "USD",
        cardNumber: "1234567890123456",
        email: "test@example.com",
        name: "Test User",
    });

    console.log("Result:", result);
};

void (async () => {
    console.log("Script to run:", SCRIPT_NAME);
    console.log("Environment file:", ENV_FILE);
    console.log("Mongo uri:", MONGO_URI);
    console.log("Running script:", SCRIPT_NAME);
})()
    .then(execute)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("error occurred", { error });
        process.exit(1);
    });
