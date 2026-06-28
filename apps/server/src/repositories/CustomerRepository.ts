import type { FlattenMaps } from "mongoose";

import {
    type CustomerDocumentFields,
    CustomerModel
} from "../models/Customer/model.js";
import type { Customer } from "../models/Customer/types.js";

/**
 * Maps a lean `Customer` document to the domain type.
 */
function toCustomer(doc: FlattenMaps<CustomerDocumentFields>): Customer {
    return {
        ...doc,
        _id: doc._id.toString()
    };
}

/**
 * Handles storage and retrieval of `Customer` data.
 */
export const CustomerRepository = {
    /**
     * Find a customer by their email address.
     *
     * @returns The customer, or `null` if not found.
     */
    getCustomerByEmail,
    /**
     * Create a new customer document.
     */
    createCustomer
};

/**
 * Find a customer by their email address.
 *
 * @returns The customer, or `null` if not found.
 */
async function getCustomerByEmail(email: string): Promise<Customer | null> {
    const doc = await CustomerModel.findOne({ email }).lean().exec();

    return doc ? toCustomer(doc) : null;
}

/**
 * Create a new customer document.
 */
async function createCustomer(
    data: Pick<Customer, "name" | "email">
): Promise<Customer> {
    const doc = await CustomerModel.create(data);

    return toCustomer(doc.toObject());
}
