import type { FlattenMaps } from "mongoose";

import {
    type ReservationDocumentFields,
    ReservationModel
} from "../models/Reservation/model.js";
import { type Reservation, ReservationStatus } from "../models/Reservation/types.js";

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
        customerId: doc.customerId.toString()
    };
}

/**
 * Handles storage and retrieval of `Reservation` data.
 */
export const ReservationRepository = {
    /**
     * Create a new reservation document.
     */
    createReservation,
    /**
     * Find all `RESERVED` reservations at a store that overlap the given time window.
     * 
     * Checks if `reservation.startTime < endTime` AND `reservation.endTime > startTime`.
     */
    getOverlappingReservations
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

/**
 * Find all `RESERVED` reservations at a store that overlap the given time window.
 * 
 * Checks if `reservation.startTime < endTime` AND `reservation.endTime > startTime`.
 */
async function getOverlappingReservations(
    storeId: string,
    startTime: Date,
    endTime: Date
): Promise<Reservation[]> {
    const docs = await ReservationModel.find({
        storeId,
        status: ReservationStatus.RESERVED,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
    })
        .lean()
        .exec();

    return docs.map(toReservation);
}
