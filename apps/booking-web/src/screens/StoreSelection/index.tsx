import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { api } from "../../api";
import { getAllBusinessHours } from "../../utils/formatBusinessHours";

export const StoreSelection = () => {
    const location = useLocation();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (location.state?.bookingSuccess) {
            setShowSuccess(true);
            // Clear the state so the popup doesn't reappear on refresh.
            window.history.replaceState({}, "");
        }
    }, [location.state]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["stores"],
        queryFn: api.store.getAllStores,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading stores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-700">
                    Error loading stores: {error.message}
                </p>
            </div>
        );
    }

    const stores = data?.stores ?? [];

    if (stores.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">No stores available.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="mx-4 flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-10 shadow-lg">
                        <p className="text-lg font-semibold text-gray-900">
                            Booking placed. Hop to your next destination!
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowSuccess(false)}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    Book storage space for your stuff
                </h2>
                <p className="mt-1 text-sm text-gray-500 sm:text-base">
                    Choose a store to get started.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                    <Link
                        key={store.id}
                        to={`/stores/${store.id}/reserve`}
                        className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                    >
                        <h3 className="text-lg font-semibold text-gray-900">
                            {store.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {store.address.street1}, {store.address.city},{" "}
                            {store.address.state} {store.address.postalCode}
                        </p>
                        {(() => {
                            const { timezoneAbbr, days } =
                                getAllBusinessHours(store);
                            return (
                                <div className="mt-3">
                                    <p className="mb-1 text-sm font-bold text-gray-900">
                                        Business Hours ({timezoneAbbr})
                                    </p>
                                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm text-gray-600">
                                        {days.map(({ day, hours, isToday }) => (
                                            <div
                                                key={day}
                                                className={`col-span-2 grid grid-cols-subgrid ${isToday ? "font-semibold text-gray-900" : ""}`}
                                            >
                                                <dt>{day}</dt>
                                                <dd>{hours}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            );
                        })()}
                    </Link>
                ))}
            </div>
        </div>
    );
};
