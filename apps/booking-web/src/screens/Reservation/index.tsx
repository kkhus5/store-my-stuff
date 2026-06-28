import { Link, useParams } from "react-router-dom";

export const Reservation = () => {
    const { storeId } = useParams<{ storeId: string }>();

    return (
        <div className="flex flex-col gap-6">
            <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
                &larr; Back to stores
            </Link>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    Make a Reservation
                </h2>
                <p className="mt-2 text-gray-500">
                    Reservation form for store {storeId} coming soon.
                </p>
            </div>
        </div>
    );
};
