// The resume only gets an Education section when these fields are filled in.
// Kept dependency-free so both the server and the onboarding form can use it.
export function isEducationComplete(edu: { school?: string | null, major?: string | null, graduationDate?: Date | string | null }): boolean {
    return Boolean(edu.school?.trim() && edu.major?.trim() && edu.graduationDate);
}
