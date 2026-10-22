import { prisma } from "@/lib/prisma";
import { InvalidInput, parseEmail } from "@/lib/accountInput";
import { sendPasswordReset } from "@/lib/passwordReset";
import { clientIp, hit, limits, waitTime } from "@/lib/rateLimit";
import { after, NextResponse } from "next/server";

// Email a password reset link. The response is identical, and equally fast, whether or not
// an account exists: the lookup and the email happen after the response is sent.
// So this can't be used to find out who has signed up.
export async function POST(request: Request) {
    let email;
    try {
        email = parseEmail((await request.json()).email);
    } catch (error) {
        if (error instanceof InvalidInput) {
            return NextResponse.json({error: error.message}, {status: 400});
        }
        throw error;
    }

    // Says nothing about whether the account exists, so it can be reported normally
    const limit = await hit(limits.forgotPasswordPerIp(clientIp(request)));
    if (!limit.allowed) {
        return NextResponse.json({error: `Too many reset requests from this network. Try again in ${waitTime(limit.resetAt)}.`}, {status: 429});
    }

    const origin = new URL(request.url).origin;
    after(async () => {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) await sendPasswordReset(user, origin);
        } catch (error) {
            console.error("Failed to send password reset email:", error);
        }
    });

    return NextResponse.json({success: true});
}
