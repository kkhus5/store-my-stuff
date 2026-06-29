import { HydratedDocument, model, Schema, Types } from "mongoose";

import { ReservationRateCurrency } from "../ReservationRate/types.js";

import { type Reservation, ReservationStatus } from "./types.js";

/**
 * Document fields with `_id` and foreign keys as `ObjectId` instead of `string`.
 */
export type ReservationDocumentFields = Omit<
    Reservation,
    "_id" | "storeId" | "customerId"
> & {
    _id: Types.ObjectId;
    storeId: Types.ObjectId;
    customerId: Types.ObjectId;
};

/**
 * Mongoose document type for `Reservation` model.
 *
 * Represents booking data for a customer at a store.
 */
export type ReservationDocument = HydratedDocument<ReservationDocumentFields>;

const ReservationSchema = new Schema(
    {
        idempotencyKey: { type: String, required: true, unique: true },
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        itemCount: { type: Number, required: true },
        totalCost: { type: Number, required: true },
        currency: {
            type: String,
            enum: Object.values(ReservationRateCurrency),
            required: true,
        },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: {
            type: String,
            enum: Object.values(ReservationStatus),
            required: true,
        },
    },
    { timestamps: true },
);

ReservationSchema.index({ storeId: 1, status: 1, startTime: 1, endTime: 1 });

/**
 * Mongoose model for the `Reservation` collection.
 */
export const ReservationModel = model<ReservationDocumentFields>(
    "Reservation",
    ReservationSchema,
);
