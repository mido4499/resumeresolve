import { randomBytes } from "crypto";
import { siteUrl } from "@/lib/siteUrl";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { hashToken, RESEND_COOLDOWN_MS } from "@/lib/verification";

const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

// Emails a reset link, replacing any earlier one so only the newest link works.
// Does nothing if a link was sent less than a minute ago, to stop the form being used to spam someone.
export async function sendPasswordReset(user: { id: string, name: string, email: string }, origin: string) {
    const latest = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
        return;
    }

    const token = randomBytes(32).toString("hex");
    await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        prisma.passwordResetToken.create({
            data: {
                tokenHash: hashToken(token),
                expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS),
                userId: user.id,
            },
        }),
    ]);

    const link = `${siteUrl(origin)}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, user.name, link);
}

// The stored token for a link, or null if it doesn't exist or has expired
export async function findValidResetToken(token: string) {
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record || record.expiresAt < new Date()) return null;
    return record;
}
