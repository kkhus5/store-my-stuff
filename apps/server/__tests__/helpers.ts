import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach } from "vitest";

/**
 * Connect to the in-memory MongoDB instance before all tests in a file.
 *
 * Call this at the top of any test file that needs database access.
 */
export function useTestDatabase() {
    beforeAll(async () => {
        const uri = process.env.MONGODB_TEST_URI;
        if (!uri) {
            throw new Error("MONGODB_TEST_URI is not set.");
        }

        await mongoose.connect(uri);
    });

    afterEach(async () => {
        const collections = await mongoose.connection.db?.collections();
        if (!collections) {
            throw new Error("No collections found.");
        }

        for (const collection of collections) {
            await collection.deleteMany({});
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });
}
