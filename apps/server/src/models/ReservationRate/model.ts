import { HydratedDocument, model, Schema, Types } from "mongoose";

import {
    type ReservationRate,
    ReservationRateCurrency,
    ReservationRateType,
} from "./types.js";

/**
 * Document fields with `_id` and foreign keys as `ObjectId` instead of `string`.
 */
export type ReservationRateDocumentFields = Omit<ReservationRate, "_id" | "storeId"> & {
    _id: Types.ObjectId;
    storeId: Types.ObjectId;
};

/**
 * Mongoose document type for `ReservationRate` model.
 *
 * Represents the booking rate for a given date at a store.
 */
export type ReservationRateDocument = HydratedDocument<ReservationRateDocumentFields>;

const ReservationRateSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },
        date: { type: Date, required: true },
        rate: { type: Number, required: true },
        type: {
            type: String,
            enum: Object.values(ReservationRateType),
            required: true
        },
        currency: {
            type: String,
            enum: Object.values(ReservationRateCurrency),
            required: true
        }
    },
    { timestamps: true }
);

/**
 * Mongoose model for the `ReservationRate` collection.
 */
export const ReservationRateModel = model<ReservationRateDocumentFields>(
    "ReservationRate",
    ReservationRateSchema
);
