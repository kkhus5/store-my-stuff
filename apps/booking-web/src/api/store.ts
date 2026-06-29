import { axiosClient } from "./shared";
import type { Store } from "../types/Store";

type GetAllStoresResponse = {
    stores: Store[];
};

type GetStoreResponse = {
    store: Store;
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
};
