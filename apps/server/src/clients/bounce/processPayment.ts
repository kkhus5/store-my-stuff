import { AxiosResponse, HttpStatusCode, isAxiosError } from "axios";
import { match } from "ts-pattern";

import { bounceAxiosClient } from "./shared.js";
import {
    type BouncePaymentProcessingError,
    BouncePaymentProcessingStatus,
    type BounceProcessPaymentRequest,
    type BounceProcessPaymentResponse,
} from "./types.js";

type RequestBody = {
    amount: number;
    currency: string;
    card_number: string;
    email: string;
    name: string;
};

type ResponseData = {
    amount: number;
    currency: string;
    last_four_digits: string;
    merchant_reference: string;
    payment_method: string;
    processing_fee: number;
    status: string;
    timestamp: string;
    transaction_id: string;
};

/**
 * HTTP 400 — payment declined or processing error.
 */
type PaymentErrorResponseData = {
    detail: string;
    error_code?: string;
};

/**
 * HTTP 422 — request validation error.
 */
type ValidationErrorResponseData = {
    detail: {
        loc: (string | number)[];
        msg: string;
        type: string;
    }[];
};

type ErrorResponseData = PaymentErrorResponseData | ValidationErrorResponseData;

function isValidationError(
    data: ErrorResponseData,
): data is ValidationErrorResponseData {
    return Array.isArray(data.detail);
}

/**
 * Process payments with the provided customer and payment details.
 *
 * @see https://fullstack-challenge-api.usebounce.io/v1/docs#/
 */
export const processPayment = async (
    request: BounceProcessPaymentRequest,
): Promise<BounceProcessPaymentResponse | BouncePaymentProcessingError> => {
    try {
        const response = await bounceAxiosClient.post<
            ResponseData,
            AxiosResponse<ResponseData>,
            RequestBody
        >("/v1/payments", {
            amount: request.amount,
            currency: request.currency,
            card_number: request.cardNumber,
            email: request.email,
            name: request.name,
        });

        const data = response.data;

        return {
            amount: data.amount,
            currency: data.currency,
            lastFourDigits: data.last_four_digits,
            merchantReference: data.merchant_reference,
            paymentMethod: data.payment_method,
            processingFee: data.processing_fee,
            status: match(data.status)
                .with(
                    "completed",
                    () => BouncePaymentProcessingStatus.COMPLETED,
                )
                .otherwise(() => BouncePaymentProcessingStatus.FAILED),
            timestamp: new Date(data.timestamp),
            transactionId: data.transaction_id,
        };
    } catch (error) {
        if (isAxiosError<ErrorResponseData>(error) && error.response) {
            const { status, data } = error.response;

            console.error("Bounce API payment processing error:", {
                status,
                data,
            });

            if (isValidationError(data)) {
                return {
                    responseCode: status,
                    detail: data.detail
                        .map((e) => `${e.loc.join(".")}: ${e.msg}`)
                        .join("; "),
                };
            }

            return {
                responseCode: status,
                detail: data.detail,
            };
        }

        console.error("Unexpected error processing payment.", { error });

        return {
            responseCode: HttpStatusCode.InternalServerError,
            detail: "An unexpected error occurred while processing the payment.",
        };
    }
};
