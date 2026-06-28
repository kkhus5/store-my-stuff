import { HydratedDocument, model, Schema, Types } from "mongoose";

import type { Store } from "./types.js";

/**
 * Document fields with `_id` as `ObjectId` instead of `string`.
 */
export type StoreDocumentFields = Omit<Store, "_id"> & { _id: Types.ObjectId };

/**
 * Mongoose document type for `Store` model.
 * 
 * Represents the business info for a store in our storage network.
 */
export type StoreDocument = HydratedDocument<StoreDocumentFields>;

const AddressSchema = new Schema(
    {
        street1: { type: String, required: true },
        street2: { type: String, default: null },
        city: { type: String, required: true },
        state: { type: String, default: null },
        country: { type: String, required: true },
        postalCode: { type: String, default: null }
    },
    { _id: false, timestamps: false }
);

const BusinessHoursSchema = new Schema(
    {
        open: { type: String, required: true },
        close: { type: String, required: true }
    },
    { _id: false, timestamps: false }
);

const StoreSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: AddressSchema, required: true },
        businessHours: {
            type: [[BusinessHoursSchema]],
            required: true
        },
        timezone: { type: String, required: true },
        capacity: { type: Number, required: true }
    },
    { timestamps: true }
);

/**
 * Mongoose model for the `Store` collection.
 */
export const StoreModel = model<StoreDocumentFields>("Store", StoreSchema);
