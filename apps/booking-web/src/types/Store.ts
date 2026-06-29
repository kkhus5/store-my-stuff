/**
 * Per-day availability and pricing for a store, returned by the availability endpoint.
 */
export type StoreAvailabilityDay = {
    /** ISO date string, e.g. "2026-06-28" */
    date: string;
    /** Rate in cents for this day. */
    rate: number;
    /** Currency code, e.g. "USD". */
    currency: string;
    /** How many more items can be stored on this day. */
    remainingCapacity: number;
};

/**
 * Represents a store in our storage network.
 */
export type Store = {
    id: string;
    name: string;
    phone: string;
    address: {
        street1: string;
        street2: string | null;
        city: string;
        state: string | null;
        country: string;
        postalCode: string | null;
    };
    /**
     * The store's business hours stored in a 2D array.
     *
     * Outer array indices represent the day of week (e.g. 0 for Sunday and 6 for Saturday).
     * Inner array is a list of business hours for that day, allowing for split shifts.
     */
    businessHours: {
        /**
         * Start of business hours, as minutes from midnight.
         */
        open: string;
        /**
         * End of business hours, as minutes from midnight.
         */
        close: string;
    }[][];
    timezone: string;
    /**
     * The maximum number of items that can be stored at the store.
     */
    capacity: number;
    defaultRate: {
        rate: number;
        type: string;
        currency: string;
    };
};
