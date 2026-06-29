import { useQueries } from "@tanstack/react-query";

import { api } from "../../api";
import type { StoreAvailabilityDay } from "../../types/Store";

type BookingSummaryProps = {
    storeId: string;
    bagCount: number;
    startDate: string | null;
    endDate: string | null;
    onBook: () => void;
    isSubmitting: boolean;
    bookingError: string | null;
};

/**
 * Returns all "YYYY-MM" month strings that the date range spans.
 */
function getMonthsInRange(start: string, end: string): string[] {
    const months: string[] = [];
    const [sy, sm] = start.substring(0, 7).split("-").map(Number);
    const [ey, em] = end.substring(0, 7).split("-").map(Number);

    let y = sy;
    let m = sm;
    while (y < ey || (y === ey && m <= em)) {
        months.push(`${y}-${String(m).padStart(2, "0")}`);
        m++;
        if (m > 12) {
            m = 1;
            y++;
        }
    }

    return months;
}

function formatCurrency(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function formatDateFull(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export const BookingSummary = ({
    storeId,
    bagCount,
    startDate,
    endDate,
    onBook,
    isSubmitting,
    bookingError,
}: BookingSummaryProps) => {
    const months =
        startDate && endDate ? getMonthsInRange(startDate, endDate) : [];

    // Fetch availability for all months the selected range spans.
    // The calendar has likely already fetched these, so React Query will
    // serve them from its cache without a new network request.
    const monthQueries = useQueries({
        queries: months.map((m) => ({
            queryKey: ["storeAvailability", storeId, m],
            queryFn: () => api.store.getStoreAvailability(storeId, m),
            enabled: months.length > 0,
        })),
    });

    if (!startDate || !endDate) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
                <p className="text-center text-sm text-gray-500">
                    {startDate
                        ? "Select an end date to see pricing."
                        : "Select dates to see pricing."}
                </p>
            </div>
        );
    }

    const isLoading = monthQueries.some((q) => q.isLoading);
    if (isLoading) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Calculating pricing...</p>
            </div>
        );
    }

    const allDays = monthQueries.flatMap((q) => q.data?.days ?? []);
    const daysInRange = allDays.filter(
        (d) => d.date >= startDate && d.date <= endDate,
    );

    if (daysInRange.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                    No pricing data available for the selected dates.
                </p>
            </div>
        );
    }

    const rateGroups = groupByRate(daysInRange);
    const totalCents = daysInRange.reduce(
        (sum, d) => sum + d.rate * bagCount,
        0,
    );

    const sameStartEnd =
        formatDateShort(startDate) === formatDateShort(endDate);
    const dateLabel = sameStartEnd
        ? formatDateFull(startDate)
        : `${formatDateShort(startDate)} – ${formatDateFull(endDate)}`;

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">
                Booking Summary
            </h3>

            <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                    <dt className="text-gray-500">Dates</dt>
                    <dd className="font-medium text-gray-900">
                        {dateLabel} ({daysInRange.length}{" "}
                        {daysInRange.length === 1 ? "day" : "days"})
                    </dd>
                </div>

                <div className="flex justify-between">
                    <dt className="text-gray-500">Bags</dt>
                    <dd className="font-medium text-gray-900">{bagCount}</dd>
                </div>

                <div className="border-t border-gray-100 pt-2">
                    <dt className="mb-1 text-gray-500">Rate breakdown</dt>
                    <dd className="space-y-0.5">
                        {rateGroups.map(({ rate, days }) => (
                            <div
                                key={rate}
                                className="flex justify-between text-gray-700"
                            >
                                <span>
                                    {formatCurrency(rate)}/bag &times; {days}{" "}
                                    {days === 1 ? "day" : "days"} &times;{" "}
                                    {bagCount} {bagCount === 1 ? "bag" : "bags"}
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(rate * days * bagCount)}
                                </span>
                            </div>
                        ))}
                    </dd>
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-2">
                    <dt className="font-semibold text-gray-900">Total</dt>
                    <dd className="text-lg font-bold text-gray-900">
                        {formatCurrency(totalCents)}
                    </dd>
                </div>
            </dl>

            {bookingError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-sm text-red-700">{bookingError}</p>
                </div>
            )}

            <button
                type="button"
                disabled={isSubmitting}
                onClick={onBook}
                className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
                    bookingError
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
            >
                {bookingError ? "Retry" : "Book"}
            </button>
        </div>
    );
};

/**
 * Groups days by their rate value, preserving order of first occurrence.
 */
function groupByRate(
    days: StoreAvailabilityDay[],
): { rate: number; days: number }[] {
    const map = new Map<number, number>();

    for (const day of days) {
        map.set(day.rate, (map.get(day.rate) ?? 0) + 1);
    }

    return Array.from(map, ([rate, count]) => ({ rate, days: count }));
}
