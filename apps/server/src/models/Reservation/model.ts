import { HydratedDocument, model, Schema, Types } from "mongoose";

import { type Reservation, ReservationStatus } from "./types.js";

/**
 * Document fields with `_id` and foreign keys as `ObjectId` instead of `string`.
 */
export type ReservationDocumentFields = Omit<
    Reservation,
    "_id" | "storeId" | "customerId" | "reservationRateId"
> & {
    _id: Types.ObjectId;
    storeId: Types.ObjectId;
    customerId: Types.ObjectId;
    reservationRateId: Types.ObjectId;
};

/**
 * Mongoose document type for `Reservation` model.
 *
 * Represents booking data for a customer at a store.
 */
export type ReservationDocument = HydratedDocument<ReservationDocumentFields>;

const ReservationSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },
        reservationRateId: {
            type: Schema.Types.ObjectId,
            ref: "ReservationRate",
            required: true 
        },
        itemCount: { type: Number, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        status: {
            type: String,
            enum: Object.values(ReservationStatus),
            required: true
        }
    },
    { timestamps: true }
);

/**
 * Mongoose model for the `Reservation` collection.
 */
export const ReservationModel = model<ReservationDocumentFields>(
    "Reservation",
    ReservationSchema
);
