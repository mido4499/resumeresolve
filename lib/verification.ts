import { createHash, randomBytes } from "crypto";
import { siteUrl } from "@/lib/siteUrl";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;

export function hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

// Replaces any earlier tokens (so only the newest link works) and emails the new link.
// Pass `email` to verify a new address; the account's email only changes once that link is clicked.
export async function sendVerification(user: { id: string, name: string, email: string }, origin: string, email = user.email) {
    const token = randomBytes(32).toString("hex");

    await prisma.$transaction([
        prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
        prisma.verificationToken.create({
            data: {
                tokenHash: hashToken(token),
                email,
                expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS),
                userId: user.id,
            },
        }),
    ]);

    const link = `${siteUrl(origin)}/api/auth/verify?token=${token}`;
    await sendVerificationEmail(email, user.name, link);
}
