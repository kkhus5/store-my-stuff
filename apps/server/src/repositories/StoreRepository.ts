import type { FlattenMaps } from "mongoose";

import { type StoreDocumentFields, StoreModel } from "../models/Store/model.js";
import type { Store } from "../models/Store/types.js";

/**
 * Maps a lean `Store` document to the domain type.
 */
function toStore(doc: FlattenMaps<StoreDocumentFields>): Store {
    return {
        ...doc,
        _id: doc._id.toString(),
    };
}

/**
 * Handles storage and retrieval of `Store` data.
 */
export const StoreRepository = {
    /**
     * Get all stores.
     */
    getAllStores,
    /**
     * Get a store by its ID.
     *
     * @throws `Error` if store not found.
     */
    getStoreById,
    /**
     * Create a new store document.
     */
    createStore,
};

/**
 * Get all stores.
 */
async function getAllStores(): Promise<Store[]> {
    const docs = await StoreModel.find().lean().exec();

    return docs.map(toStore);
}

/**
 * Get a store by its ID.
 *
 * @throws `Error` if store not found.
 */
async function getStoreById(id: string): Promise<Store> {
    const doc = await StoreModel.findById(id).lean().orFail().exec();

    return toStore(doc);
}

/**
 * Create a new store document.
 */
async function createStore(
    data: Omit<Store, "_id" | "createdAt" | "updatedAt">,
): Promise<Store> {
    const doc = await StoreModel.create(data);

    return toStore(doc.toObject());
}
