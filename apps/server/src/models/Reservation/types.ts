/**
 * Status of a reservation.
 *
 * - `PENDING` — the customer is in the process of booking.
 * - `RESERVED` — the customer successfully paid for the reservation.
 * - `CANCELED` — the customer canceled or backed out of the reservation.
 * - `ENDED` — the reservation period has ended.
 */
export enum ReservationStatus {
    PENDING = "PENDING",
    RESERVED = "RESERVED",
    CANCELED = "CANCELED",
    ENDED = "ENDED"
}

/**
 * Domain type for a reservation.
 *
 * This is the lean, POJO representation of a `Reservation`
 * document (safe to spread).
 *
 * Represents booking data for a customer at a store.
 */
export interface Reservation {
    _id: string;
    /**
     * Foreign key for the `Store` document (the store the reservation is for).
     */
    storeId: string;
    /**
     * Foreign key for the `Customer` document (the customer who owns the reservation).
     */
    customerId: string;
    /**
     * Foreign key for the `ReservationRate` document (how much the customer will be charged).
     */
    reservationRateId: string;
    /**
     * How many items the customer will be storing in this reservation.
     */
    itemCount: number;
    /**
     * When this reservation starts.
     */
    startTime: Date;
    /**
     * When this reservation ends.
     */
    endTime: Date;
    /**
     * Current status of the reservation.
     */
    status: ReservationStatus;
    createdAt: Date;
    updatedAt: Date;
}
