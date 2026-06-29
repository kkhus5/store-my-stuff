import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../../api";
import type { Store } from "../../types/Store";
import { validateCardNumber, validateEmail } from "../../utils/validation";
import { BagCountSelector } from "./BagCountSelector";
import { BookingSummary } from "./BookingSummary";
import { PaymentInformation } from "./PaymentInformation";
import { PersonalDetails } from "./PersonalDetails";
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
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [cardNumberError, setCardNumberError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const navigate = useNavigate();

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

    function handleNameChange(value: string) {
        setName(value);
        if (nameError) setNameError(null);
    }

    function handleEmailChange(value: string) {
        setEmail(value);
        if (emailError) setEmailError(null);
    }

    function handleCardNumberChange(value: string) {
        setCardNumber(value);
        if (cardNumberError) setCardNumberError(null);
    }

    function handleDateRangeChange(
        newStart: string | null,
        newEnd: string | null,
    ) {
        setStartDate(newStart);
        setEndDate(newEnd);
    }

    async function handleBook() {
        const nameErr = name.trim() ? null : "Full name is required.";
        const emailErr = validateEmail(email);
        const cardErr = validateCardNumber(cardNumber);

        setNameError(nameErr);
        setEmailError(emailErr);
        setCardNumberError(cardErr);

        if (nameErr || emailErr || cardErr || !startDate || !endDate) return;

        setIsSubmitting(true);
        setBookingError(null);

        try {
            await api.booking.createBooking({
                storeId: storeId!,
                name: name.trim(),
                email: email.trim(),
                cardNumber: cardNumber.replace(/[\s-]/g, ""),
                numItems: bagCount,
                startTime: `${startDate}T00:00:00.000Z`,
                endTime: `${endDate}T23:59:59.999Z`,
            });

            navigate("/", { state: { bookingSuccess: true } });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Something went wrong.";
            setBookingError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="relative flex flex-col gap-6">
            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        <p className="text-sm font-medium text-gray-700">
                            Placing booking...
                        </p>
                    </div>
                </div>
            )}

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

            <PersonalDetails
                name={name}
                email={email}
                onNameChange={handleNameChange}
                onEmailChange={handleEmailChange}
                nameError={nameError}
                emailError={emailError}
                onNameBlur={() =>
                    setNameError(name.trim() ? null : "Full name is required.")
                }
                onEmailBlur={() => setEmailError(validateEmail(email))}
            />

            <PaymentInformation
                cardNumber={cardNumber}
                onCardNumberChange={handleCardNumberChange}
                cardNumberError={cardNumberError}
                onCardNumberBlur={() =>
                    setCardNumberError(validateCardNumber(cardNumber))
                }
            />

            <BookingSummary
                storeId={storeId!}
                bagCount={bagCount}
                startDate={startDate}
                endDate={endDate}
                onBook={handleBook}
                isSubmitting={isSubmitting}
                bookingError={bookingError}
            />
        </div>
    );
};
