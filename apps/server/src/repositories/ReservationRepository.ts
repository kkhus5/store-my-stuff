import type { FlattenMaps } from "mongoose";

import {
    type ReservationDocumentFields,
    ReservationModel
} from "../models/Reservation/model.js";
import type { Reservation } from "../models/Reservation/types.js";

/**
 * Maps a lean `Reservation` document to the domain type.
 */
function toReservation(
    doc: FlattenMaps<ReservationDocumentFields>
): Reservation {
    return {
        ...doc,
        _id: doc._id.toString(),
        storeId: doc.storeId.toString(),
        customerId: doc.customerId.toString(),
        reservationRateId: doc.reservationRateId.toString()
    };
}

/**
 * Handles storage and retrieval of `Reservation` data.
 */
export const ReservationRepository = {
    createReservation
};

/**
 * Create a new reservation document.
 */
async function createReservation(
    data: Omit<Reservation, "_id" | "createdAt" | "updatedAt">
): Promise<Reservation> {
    const doc = await ReservationModel.create(data);

    return toReservation(doc.toObject());
}
