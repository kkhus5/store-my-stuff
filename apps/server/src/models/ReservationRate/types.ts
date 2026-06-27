/**
 * Whether a reservation rate is charged per hour or per day.
 */
export enum ReservationRateType {
    HOURLY = "HOURLY",
    DAILY = "DAILY"
}

/**
 * Supported currency codes for reservation rates.
 */
export enum ReservationRateCurrency {
    USD = "USD"
}

/**
 * Domain type for a reservation rate.
 *
 * This is the lean, POJO representation of a `ReservationRate`
 * document (safe to spread).
 *
 * Represents the booking rate for a given date at a store.
 */
export interface ReservationRate {
    _id: string;
    /**
     * Foreign key for the `Store` document (the store charging the rate).
     */
    storeId: string;
    /**
     * Date for which the rate is applicable.
     */
    date: Date;
    /**
     * Cost of reservation for the specified date, in cents.
     */
    rate: number;
    /**
     * Whether the rate is charged per hour or per day.
     */
    type: ReservationRateType;
    /**
     * Currency code for the rate.
     * 
     * Only USD is supported currently.
     */
    currency: ReservationRateCurrency;
    createdAt: Date;
    updatedAt: Date;
}
