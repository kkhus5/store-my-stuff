import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        include: ["__tests__/**/*.test.ts"],
        globalSetup: "__tests__/setup.ts",
        testTimeout: 30_000,
        passWithNoTests: true,

        // All test files share a single in-memory MongoDB
        // instance, which means they can interfere with
        // each other during cleanup.
        fileParallelism: false,
    },
});
