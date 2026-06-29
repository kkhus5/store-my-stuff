import type { Store } from "../../types/Store";
import { getAllBusinessHours } from "../../utils/formatBusinessHours";

type StoreDetailsProps = {
    store: Store;
};

export const StoreDetails = ({ store }: StoreDetailsProps) => {
    const { timezoneAbbr, days } = getAllBusinessHours(store);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {store.name}
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">Address</h3>
                    <p className="mt-1 text-sm text-gray-600">
                        {store.address.street1}
                        {store.address.street2 && (
                            <>
                                <br />
                                {store.address.street2}
                            </>
                        )}
                        <br />
                        {store.address.city}
                        {store.address.state && `, ${store.address.state}`}
                        {store.address.postalCode &&
                            ` ${store.address.postalCode}`}
                    </p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-900">Phone</h3>
                    <p className="mt-1 text-sm text-gray-600">{store.phone}</p>
                </div>

                <div className="sm:col-span-2">
                    <h3 className="text-sm font-bold text-gray-900">
                        Business Hours ({timezoneAbbr})
                    </h3>
                    <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm text-gray-600">
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
            </div>
        </div>
    );
};
