import { useQuery } from "@tanstack/react-query";

import { api } from "../../api";
import type { StoreAvailabilityDay } from "../../types/Store";

type ReservationCalendarProps = {
    storeId: string;
    bagCount: number;
    month: string;
    onMonthChange: (month: string) => void;
    startDate: string | null;
    endDate: string | null;
    onDateRangeChange: (
        startDate: string | null,
        endDate: string | null,
    ) => void;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getToday(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getAdjacentMonth(month: string, delta: number): string {
    const [year, m] = month.split("-").map(Number);
    const date = new Date(year, m - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string): string {
    const [year, m] = month.split("-").map(Number);
    const date = new Date(year, m - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatRate(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
}

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function isDateInRange(
    date: string,
    start: string | null,
    end: string | null,
): boolean {
    if (!start) return false;
    if (!end) return date === start;
    return date >= start && date <= end;
}

export const ReservationCalendar = ({
    storeId,
    bagCount,
    month,
    onMonthChange,
    startDate,
    endDate,
    onDateRangeChange,
}: ReservationCalendarProps) => {
    const { data, isLoading } = useQuery({
        queryKey: ["storeAvailability", storeId, month],
        queryFn: () => api.store.getStoreAvailability(storeId, month),
    });

    const today = getToday();
    const currentMonth = getCurrentMonth();

    const [year, monthNum] = month.split("-").map(Number);
    const firstDayOfWeek = new Date(year, monthNum - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const availabilityByDate = new Map<string, StoreAvailabilityDay>();
    if (data) {
        for (const day of data.days) {
            availabilityByDate.set(day.date, day);
        }
    }

    function handleDayClick(date: string) {
        if (!startDate || endDate) {
            onDateRangeChange(date, null);
        } else if (date < startDate) {
            onDateRangeChange(date, null);
        } else {
            onDateRangeChange(startDate, date);
        }
    }

    function isDayDisabled(dateStr: string): boolean {
        if (dateStr < today) return true;
        const dayData = availabilityByDate.get(dateStr);
        if (!dayData) return true;
        return dayData.remainingCapacity < bagCount;
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between">
                <button
                    type="button"
                    disabled={month <= currentMonth}
                    onClick={() => onMonthChange(getAdjacentMonth(month, -1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                    &larr;
                </button>
                <h3 className="text-sm font-semibold text-gray-900">
                    {formatMonthLabel(month)}
                </h3>
                <button
                    type="button"
                    onClick={() => onMonthChange(getAdjacentMonth(month, 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
                >
                    &rarr;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-px">
                {DAY_LABELS.map((label) => (
                    <div
                        key={label}
                        className="py-1 text-center text-xs font-medium text-gray-500"
                    >
                        {label}
                    </div>
                ))}

                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {isLoading
                    ? Array.from({ length: daysInMonth }).map((_, i) => (
                          <div
                              key={i}
                              className="flex h-16 animate-pulse flex-col items-center justify-center rounded bg-gray-50 sm:h-18"
                          />
                      ))
                    : Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const dateStr = `${month}-${String(day).padStart(2, "0")}`;
                          const dayData = availabilityByDate.get(dateStr);
                          const disabled = isDayDisabled(dateStr);
                          const selected = isDateInRange(
                              dateStr,
                              startDate,
                              endDate,
                          );
                          const isRangeStart = dateStr === startDate;
                          const isRangeEnd = dateStr === endDate;

                          return (
                              <button
                                  key={day}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => handleDayClick(dateStr)}
                                  className={`flex h-16 flex-col items-center justify-center rounded text-xs transition-colors sm:h-18 ${
                                      disabled
                                          ? "cursor-not-allowed bg-gray-50 text-gray-300"
                                          : selected
                                            ? isRangeStart || isRangeEnd
                                                ? "bg-blue-600 text-white"
                                                : "bg-blue-100 text-blue-900"
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                  }`}
                              >
                                  <span className="text-sm font-medium">
                                      {day}
                                  </span>
                                  {dayData && (
                                      <span
                                          className={`mt-0.5 text-[10px] leading-tight ${
                                              disabled
                                                  ? "text-gray-300"
                                                  : selected &&
                                                      (isRangeStart ||
                                                          isRangeEnd)
                                                    ? "text-blue-200"
                                                    : "text-gray-400"
                                          }`}
                                      >
                                          {formatRate(dayData.rate)}/bag
                                      </span>
                                  )}
                              </button>
                          );
                      })}
            </div>

            {startDate && (
                <p className="mt-3 text-xs text-gray-500">
                    {endDate
                        ? `Selected: ${startDate} to ${endDate}`
                        : `Start: ${startDate} — click another date to set the end`}
                </p>
            )}
        </div>
    );
};
