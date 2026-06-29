import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../../api";
import type { Store } from "../../types/Store";
import { BagCountSelector } from "./BagCountSelector";
import { BookingSummary } from "./BookingSummary";
import { ReservationCalendar } from "./ReservationCalendar";
import { StoreDetails } from "./StoreDetails";

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const Reservation = () => {
    const { storeId } = useParams<{ storeId: string }>();
    const queryClient = useQueryClient();

    const [bagCount, setBagCount] = useState(1);
    const [month, setMonth] = useState(getCurrentMonth);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["store", storeId],
        queryFn: () => api.store.getStore(storeId!),
        enabled: !!storeId,
        // If the user navigated here from StoreSelection, the store data is
        // already sitting in the React Query cache from the "stores" query.
        // Use it as placeholder data so the page renders instantly without a
        // loading spinner, while still fetching fresh data in the background.
        // If the user landed here directly (e.g. bookmark/refresh), no cached
        // data will be available and the normal loading state kicks in.
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

    function handleDateRangeChange(
        newStart: string | null,
        newEnd: string | null,
    ) {
        setStartDate(newStart);
        setEndDate(newEnd);
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

            <BagCountSelector count={bagCount} onChange={setBagCount} />

            <ReservationCalendar
                storeId={storeId!}
                bagCount={bagCount}
                month={month}
                onMonthChange={setMonth}
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={handleDateRangeChange}
            />

            <BookingSummary
                storeId={storeId!}
                bagCount={bagCount}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
};
