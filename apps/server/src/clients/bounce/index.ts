import { processPayment } from "./processPayment.js";

/**
 * Client for the Bounce API.
 * 
* @example
 * ```ts
 * await BounceClient.processPayment({ ... });
 * ```
 */
export const BounceClient = {
    /**
     * Process payments with the provided customer and payment details.
     * 
     * @see https://fullstack-challenge-api.usebounce.io/v1/docs#/
     */
    processPayment
};
