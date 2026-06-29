import type { ClientSession, FlattenMaps } from "mongoose";

import {
    type ReservationDocumentFields,
    ReservationModel,
} from "../models/Reservation/model.js";
import {
    type Reservation,
    ReservationStatus,
} from "../models/Reservation/types.js";

/**
 * Maps a lean `Reservation` document to the domain type.
 */
function toReservation(
    doc: FlattenMaps<ReservationDocumentFields>,
): Reservation {
    return {
        ...doc,
        _id: doc._id.toString(),
        storeId: doc.storeId.toString(),
        customerId: doc.customerId.toString(),
    };
}

/**
 * Statuses that occupy capacity at a store.
 *
 * Both `PENDING` (payment in progress) and `RESERVED` (payment complete)
 * reservations count toward the store's capacity limit.
 */
const ACTIVE_STATUSES = [ReservationStatus.PENDING, ReservationStatus.RESERVED];

/**
 * Handles storage and retrieval of `Reservation` data.
 */
export const ReservationRepository = {
    /**
     * Create a new reservation document.
     *
     * Accepts an optional `session` for use inside a MongoDB transaction.
     */
    createReservation,
    /**
     * Find all active (`PENDING` or `RESERVED`) reservations at a store
     * that overlap the given time window.
     *
     * Accepts an optional `session` for use inside a MongoDB transaction.
     */
    getOverlappingReservations,
    /**
     * Update the status of a reservation by its `_id`.
     */
    updateReservationStatus,
    /**
     * Find an existing reservation by its idempotency key.
     */
    getReservationByIdempotencyKey,
};

/**
 * Create a new reservation document.
 */
async function createReservation(
    data: Omit<Reservation, "_id" | "createdAt" | "updatedAt">,
    session?: ClientSession,
): Promise<Reservation> {
    const [doc] = await ReservationModel.create([data], { session });

    return toReservation(doc.toObject());
}

/**
 * Find all active reservations at a store that overlap the given time window.
 *
 * Checks if `reservation.startTime < endTime` AND `reservation.endTime > startTime`.
 */
async function getOverlappingReservations(
    storeId: string,
    startTime: Date,
    endTime: Date,
    session?: ClientSession,
): Promise<Reservation[]> {
    const docs = await ReservationModel.find({
        storeId,
        status: { $in: ACTIVE_STATUSES },
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    })
        .session(session ?? null)
        .lean()
        .exec();

    return docs.map(toReservation);
}

/**
 * Update the status of a reservation by its `_id`.
 */
async function updateReservationStatus(
    reservationId: string,
    status: ReservationStatus,
): Promise<Reservation> {
    const doc = await ReservationModel.findByIdAndUpdate(
        reservationId,
        { status },
        { new: true },
    )
        .lean()
        .orFail()
        .exec();

    return toReservation(doc);
}

/**
 * Find an existing reservation by its idempotency key.
 */
async function getReservationByIdempotencyKey(
    idempotencyKey: string,
): Promise<Reservation | null> {
    const doc = await ReservationModel.findOne({ idempotencyKey })
        .lean()
        .exec();

    return doc ? toReservation(doc) : null;
}
