import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvalidInput, parseEmail } from "@/lib/accountInput";
import { RESEND_COOLDOWN_MS, sendVerification } from "@/lib/verification";
import { NextResponse } from "next/server";

// Start an email change: the new address gets a verification link, and the account's email
// only changes once it's clicked (see app/api/auth/verify), so a typo can't lock anyone out
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    let email;
    try {
        email = parseEmail((await request.json()).email);
    } catch (error) {
        if (error instanceof InvalidInput) {
            return NextResponse.json({error: error.message}, {status: 400});
        }
        throw error;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { verificationTokens: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    if (email === user.email) {
        return NextResponse.json({error: "That's already your email."}, {status: 400});
    }
    if (await prisma.user.findUnique({ where: { email } })) {
        return NextResponse.json({error: "Another account already uses that email."}, {status: 400});
    }

    const lastSent = user.verificationTokens[0]?.createdAt;
    if (lastSent && Date.now() - lastSent.getTime() < RESEND_COOLDOWN_MS) {
        return NextResponse.json({error: "Please wait a minute before requesting another email."}, {status: 429});
    }

    try {
        await sendVerification(user, new URL(request.url).origin, email);
    } catch (error) {
        console.error("Failed to send verification email:", error);
        return NextResponse.json({error: "We couldn't send the email. Please try again shortly."}, {status: 502});
    }

    return NextResponse.json({success: true});
}
