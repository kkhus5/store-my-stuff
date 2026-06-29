type PersonalDetailsProps = {
    name: string;
    email: string;
    onNameChange: (name: string) => void;
    onEmailChange: (email: string) => void;
    nameError: string | null;
    emailError: string | null;
    onNameBlur: () => void;
    onEmailBlur: () => void;
};

const inputBase =
    "mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:outline-none";
const inputNormal = `${inputBase} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
const inputError = `${inputBase} border-red-400 focus:border-red-500 focus:ring-red-500`;

export const PersonalDetails = ({
    name,
    email,
    onNameChange,
    onEmailChange,
    nameError,
    emailError,
    onNameBlur,
    onEmailBlur,
}: PersonalDetailsProps) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">
                Personal Details
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                    <label
                        htmlFor="fullName"
                        className="block text-sm text-gray-600"
                    >
                        Full name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        onBlur={onNameBlur}
                        placeholder="Jane Doe"
                        className={nameError ? inputError : inputNormal}
                    />
                    {nameError && (
                        <p className="mt-1 text-xs text-red-600">{nameError}</p>
                    )}
                </div>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm text-gray-600"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        onBlur={onEmailBlur}
                        placeholder="jane@example.com"
                        className={emailError ? inputError : inputNormal}
                    />
                    {emailError && (
                        <p className="mt-1 text-xs text-red-600">
                            {emailError}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
