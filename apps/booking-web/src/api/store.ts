import { axiosClient } from "./shared";
import type { Store } from "../types/Store";

type GetAllStoresResponse = {
    stores: Store[];
};

export const store = {
    getAllStores: async (): Promise<GetAllStoresResponse> => {
        const { data } = await axiosClient.get<GetAllStoresResponse>("/store");
        return data;
    },
};
