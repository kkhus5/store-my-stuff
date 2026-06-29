import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { api } from "../../api";
import type { Store } from "../../types/Store";
import { StoreDetails } from "./StoreDetails";

export const Reservation = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["store", storeId],
        queryFn: () => api.store.getStore(storeId!),
        enabled: !!storeId,
        // If the user navigated here from `StoreSelection`, the store data is
        // already sitting in the React Query cache from the "stores" query.
        // Use it as placeholder data so the page can renders instantly.
        // We'll still fetch fresh data in the background. If the user landed
        // here directly (e.g. page refresh), no cached data will be available
        // and the loading state will be shown.
        placeholderData: () => {
            const cached = queryClient.getQueryData<{ stores: Store[] }>([
                "stores",
            ]);
            const store = cached?.stores.find((s) => s.id === storeId);
            return store ? { store } : undefined;
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading store details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col gap-4">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                    &larr; Back to stores
                </Link>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-700">
                        {error
                            ? `Error loading store: ${error.message}`
                            : "Store not found."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
                &larr; Back to stores
            </Link>

            <StoreDetails store={data.store} />

            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
                <p className="text-center text-sm text-gray-500">
                    Reservation form coming soon.
                </p>
            </div>
        </div>
    );
};
