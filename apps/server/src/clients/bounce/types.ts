export enum BouncePaymentProcessingStatus {
    COMPLETED = "completed",
    FAILED = "failed"
}

export type BounceProcessPaymentRequest = {
    /**
     * The amount to process, in cents.
     */
    amount: number;
    /**
     * The currency to process the payment in.
     */
    currency: string;
    /**
     * The card number to process the payment with.
     */
    cardNumber: string;
    /**
     * The customer email address to process the payment with.
     */
    email: string;
    /**
     * The customer name to process the payment with.
     */
    name: string;
};

export type BounceProcessPaymentResponse = {
    /**
     * The amount processed, in cents.
     */
    amount: number;
    /**
     * The currency the payment was processed in.
     */
    currency: string;
    /**
     * The last four digits of the card used for the payment.
     */
    lastFourDigits: string;
    /**
     * The merchant reference for the payment.
     */
    merchantReference: string;
    /**
     * The method of payment used for the payment.
     */
    paymentMethod: string;
    /**
     * The processing fee for the payment, in cents.
     */
    processingFee: number;
    /**
     * The status of the payment processing.
     */
    status: BouncePaymentProcessingStatus;
    /**
     * The timestamp of the payment processing.
     */
    timestamp: Date;
    /**
     * The transaction ID for the payment.
     */
    transactionId: string;
};

export type BouncePaymentProcessingError = {
    /**
     * e.g. HTTP 400, HTTP 422, etc.
     */
    responseCode: number;
    /**
     * Error message for display.
     */
    detail: string;
};
