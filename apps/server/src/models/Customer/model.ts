import { HydratedDocument, model, Schema, Types } from "mongoose";

import type { Customer } from "./types.js";

/**
 * Document fields with `_id` as `ObjectId` instead of `string`.
 */
export type CustomerDocumentFields = Omit<Customer, "_id"> & {
    _id: Types.ObjectId;
};

/**
 * Mongoose document type for `Customer` model.
 *
 * Represents the user booking storage space.
 */
export type CustomerDocument = HydratedDocument<CustomerDocumentFields>;

const CustomerSchema = new Schema(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true },
);

/**
 * Mongoose model for the `Customer` collection.
 */
export const CustomerModel = model<CustomerDocumentFields>(
    "Customer",
    CustomerSchema,
);
