import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Where the signed-in user is in onboarding; polled while waiting for email verification
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, emailVerified: true, onboardedAt: true },
    });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    return NextResponse.json({
        email: user.email,
        verified: Boolean(user.emailVerified),
        onboarded: Boolean(user.onboardedAt),
    });
}
