import { Store } from "../types/Store";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Converts minutes from midnight to a formatted time string (e.g. 540 -> "9:00 AM").
 */
function minutesToTime(minutes: string): string {
    const total = parseInt(minutes, 10);
    const h = Math.floor(total / 60);
    const m = total % 60;
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;

    return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`;
}

/**
 * Formats a single day's business hours into a readable string.
 */
function formatDayHours(blocks: Store["businessHours"][number]): string {
    if (blocks.length === 0) {
        return "Closed";
    }

    return blocks
        .map((b) => `${minutesToTime(b.open)} – ${minutesToTime(b.close)}`)
        .join(", ");
}

/**
 * Returns a short timezone abbreviation for display (e.g. "America/New_York" -> "ET").
 */
function getTimezoneAbbr(timezone: string): string {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            timeZoneName: "short",
        }).formatToParts(new Date());

        return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
    } catch {
        return timezone;
    }
}

/**
 * Returns all business hours for a store as an array of `{ day, hours, isToday }` entries,
 * plus the store's timezone abbreviation.
 */
export function getAllBusinessHours(store: Store) {
    const today = new Date().getDay();

    return {
        timezoneAbbr: getTimezoneAbbr(store.timezone),
        days: store.businessHours.map((blocks, i) => ({
            day: DAY_LABELS[i],
            hours: formatDayHours(blocks),
            isToday: i === today,
        })),
    };
}
