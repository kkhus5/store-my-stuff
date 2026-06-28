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
     * Get a store by its ID.
     *
     * @throws `Error` if store not found.
     */
    getStoreById,
};

/**
 * Get a store by its ID.
 *
 * @throws `Error` if store not found.
 */
async function getStoreById(id: string): Promise<Store> {
    const doc = await StoreModel.findById(id).lean().orFail().exec();

    return toStore(doc);
}
