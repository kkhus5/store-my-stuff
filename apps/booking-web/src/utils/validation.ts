const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
    if (!email.trim()) return "Email is required.";

    if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";

    return null;
}

export function validateCardNumber(cardNumber: string): string | null {
    const digits = cardNumber.replace(/[\s-]/g, "");

    if (!digits) return "Card number is required.";

    if (!/^\d+$/.test(digits)) return "Card number must contain only digits.";

    if (digits.length < 13 || digits.length > 19)
        return "Card number must be 13–19 digits.";

    return null;
}
