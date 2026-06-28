import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

/**
 * Spins up an in-memory MongoDB instance for testing.
 */
export async function setup() {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_TEST_URI = mongod.getUri();
}

export async function teardown() {
    await mongod.stop();
}
