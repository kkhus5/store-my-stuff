type BagCountSelectorProps = {
    count: number;
    onChange: (count: number) => void;
};

export const BagCountSelector = ({
    count,
    onChange,
}: BagCountSelectorProps) => {
    return (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <span className="text-sm font-semibold text-gray-900">
                Number of bags
            </span>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={count <= 1}
                    onClick={() => onChange(count - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
                >
                    &minus;
                </button>
                <span className="w-8 text-center text-lg font-semibold tabular-nums text-gray-900">
                    {count}
                </span>
                <button
                    type="button"
                    onClick={() => onChange(count + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-100"
                >
                    +
                </button>
            </div>
        </div>
    );
};
