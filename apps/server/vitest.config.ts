import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        include: ["__tests__/**/*.test.ts"],
        globalSetup: "__tests__/setup.ts",
        testTimeout: 30_000,
    },
});
