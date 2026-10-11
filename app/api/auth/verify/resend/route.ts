import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RESEND_COOLDOWN_MS, sendVerification } from "@/lib/verification";
import { NextResponse } from "next/server";

// Send a fresh verification link to the signed-in user
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { verificationTokens: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    if (user.emailVerified) {
        return NextResponse.json({error: "Your email is already verified."}, {status: 400});
    }

    const lastSent = user.verificationTokens[0]?.createdAt;
    if (lastSent && Date.now() - lastSent.getTime() < RESEND_COOLDOWN_MS) {
        return NextResponse.json({error: "Please wait a minute before requesting another email."}, {status: 429});
    }

    try {
        await sendVerification(user, new URL(request.url).origin);
    } catch (error) {
        console.error("Failed to send verification email:", error);
        return NextResponse.json({error: "We couldn't send the email. Please try again shortly."}, {status: 502});
    }

    return NextResponse.json({success: true});
}
