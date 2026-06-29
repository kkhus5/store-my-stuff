import { axiosClient } from "./shared";
import type { Store, StoreAvailabilityDay } from "../types/Store";

type GetAllStoresResponse = {
    stores: Store[];
};

type GetStoreResponse = {
    store: Store;
};

type GetStoreAvailabilityResponse = {
    days: StoreAvailabilityDay[];
};

export const store = {
    getAllStores: async (): Promise<GetAllStoresResponse> => {
        const { data } = await axiosClient.get<GetAllStoresResponse>("/store");
        return data;
    },

    getStore: async (storeId: string): Promise<GetStoreResponse> => {
        const { data } = await axiosClient.get<GetStoreResponse>(
            `/store/${storeId}`,
        );
        return data;
    },

    getStoreAvailability: async (
        storeId: string,
        month: string,
    ): Promise<GetStoreAvailabilityResponse> => {
        const { data } = await axiosClient.get<GetStoreAvailabilityResponse>(
            `/store/${storeId}/availability`,
            { params: { month } },
        );
        return data;
    },
};
