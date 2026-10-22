// Validation for account data sent from the onboarding and Edit account forms

const MAX_LENGTH = { name: 100, phone: 30, field: 200, gpa: 20, achievements: 1000 };

export class InvalidInput extends Error {}

// Trimmed string, or null when empty; rejects wrong types and overly long values
export function optionalText(value: unknown, label: string, max: number): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== "string") throw new InvalidInput(`${label} must be text.`);
    const trimmed = value.trim();
    if (trimmed.length > max) throw new InvalidInput(`${label} must be under ${max} characters.`);
    return trimmed || null;
}

export function parseName(value: unknown): string {
    const name = optionalText(value, "Name", MAX_LENGTH.name);
    if (!name) throw new InvalidInput("Name is required.");
    return name;
}

export function parsePhone(value: unknown): string | null {
    const phone = optionalText(value, "Phone number", MAX_LENGTH.phone);
    if (phone && !/^[0-9+()\-.\s]+$/.test(phone)) {
        throw new InvalidInput("Phone number can only contain digits, spaces, and + ( ) - .");
    }
    return phone;
}

// Basic shape check; the verification email is the real test.
// Lowercased so the same address can't make two accounts or fail to sign in because of its capitals.
export function parseEmail(value: unknown): string {
    const email = optionalText(value, "Email", 254)?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InvalidInput("Enter a valid email address.");
    return email;
}

export type EducationInput = {
    school: string | null;
    major: string | null;
    minor: string | null;
    graduationDate: Date | null;
    graduated: boolean | null;
    gpa: string | null;
    achievements: string | null;
};

// Accepts the education form's values (graduation date as "YYYY-MM").
// Returns null when nothing worth saving was entered ("graduated" alone doesn't count).
export function parseEducation(input: unknown): EducationInput | null {
    if (input === undefined || input === null) return null;
    if (typeof input !== "object") throw new InvalidInput("Education must be an object.");
    const edu = input as Record<string, unknown>;

    const graduationMonth = optionalText(edu.graduationDate, "Graduation date", 7);
    if (graduationMonth && !/^\d{4}-\d{2}$/.test(graduationMonth)) {
        throw new InvalidInput("Graduation date must be a month, like 2028-05.");
    }

    const parsed = {
        school: optionalText(edu.school, "School", MAX_LENGTH.field),
        major: optionalText(edu.major, "Major", MAX_LENGTH.field),
        minor: optionalText(edu.minor, "Minor", MAX_LENGTH.field),
        graduationDate: graduationMonth ? new Date(`${graduationMonth}-01T00:00:00Z`) : null,
        gpa: optionalText(edu.gpa, "GPA", MAX_LENGTH.gpa),
        achievements: optionalText(edu.achievements, "Achievements", MAX_LENGTH.achievements),
    };
    if (Object.values(parsed).every(v => v === null)) return null;

    return { ...parsed, graduated: typeof edu.graduated === "boolean" ? edu.graduated : null };
}
