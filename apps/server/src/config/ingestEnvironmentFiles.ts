/**
 * Importing this file will ingest environment files.
 *
 * By default, any `.env` file in the project root will
 * be ingested. The path can be overridden by setting
 * the `ENV_FILE` environment variable.
 *
 * Separate config from code: https://12factor.net/config
 */

import { config } from "dotenv";

/**
 * Ingests environment files into `process.env`.
 */
export const ingestEnvironmentFiles = (): void => {
    const envFile = process.env.ENV_FILE || ".env";
    config({ path: envFile });
};

ingestEnvironmentFiles();
