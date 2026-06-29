type PaymentInformationProps = {
    cardNumber: string;
    onCardNumberChange: (cardNumber: string) => void;
    cardNumberError: string | null;
    onCardNumberBlur: () => void;
};

const inputBase =
    "mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none sm:max-w-xs";
const inputNormal = `${inputBase} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
const inputError = `${inputBase} border-red-400 focus:border-red-500 focus:ring-red-500`;

export const PaymentInformation = ({
    cardNumber,
    onCardNumberChange,
    cardNumberError,
    onCardNumberBlur,
}: PaymentInformationProps) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">
                Payment Information
            </h3>
            <div className="mt-3">
                <label
                    htmlFor="cardNumber"
                    className="block text-sm text-gray-600"
                >
                    Card number
                </label>
                <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cardNumber}
                    onChange={(e) => onCardNumberChange(e.target.value)}
                    onBlur={onCardNumberBlur}
                    placeholder="4111 1111 1111 1111"
                    className={cardNumberError ? inputError : inputNormal}
                />
                {cardNumberError && (
                    <p className="mt-1 text-xs text-red-600">
                        {cardNumberError}
                    </p>
                )}
            </div>
        </div>
    );
};
