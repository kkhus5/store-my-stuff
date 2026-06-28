import type { FlattenMaps } from "mongoose";

import {
    type ReservationRateDocumentFields,
    ReservationRateModel
} from "../models/ReservationRate/model.js";
import type { ReservationRate } from "../models/ReservationRate/types.js";

/**
 * Maps a lean `ReservationRate` document to the domain type.
 */
function toReservationRate(
    doc: FlattenMaps<ReservationRateDocumentFields>
): ReservationRate {
    return {
        ...doc,
        _id: doc._id.toString(),
        storeId: doc.storeId.toString()
    };
}

/**
 * Handles storage and retrieval of `ReservationRate` data.
 */
export const ReservationRateRepository = {
    /**
     * Find a reservation rate for a given store and date.
     *
     * @returns The matching rate, or `null` if none exists.
     */
    getRate
};

/**
 * Find a reservation rate for a given store and date.
 *
 * @returns The matching rate, or `null` if none exists.
 */
async function getRate(
    storeId: string,
    date: Date
): Promise<ReservationRate | null> {
    const doc = await ReservationRateModel.findOne({
        storeId,
        date
    })
        .lean()
        .exec();

    return doc ? toReservationRate(doc) : null;
}
