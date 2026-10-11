import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvalidInput, parseEducation, parsePhone } from "@/lib/accountInput";
import { NextResponse } from "next/server";

// Save the optional "complete account" step: phone number and education. Sent once, right after verification.
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    if (!user.emailVerified) {
        return NextResponse.json({error: "Verify your email first."}, {status: 403});
    }
    if (user.onboardedAt) {
        return NextResponse.json({error: "Your account is already set up."}, {status: 409});
    }

    const body = await request.json();
    let phone, education;
    try {
        phone = parsePhone(body.phone);
        education = parseEducation(body.education);
    } catch (error) {
        if (error instanceof InvalidInput) {
            return NextResponse.json({error: error.message}, {status: 400});
        }
        throw error;
    }

    // Partial education is still saved so it can be finished later; the resume only uses complete entries
    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { phone, onboardedAt: new Date() },
        }),
        ...(education ? [prisma.education.create({ data: { ...education, userId: user.id } })] : []),
    ]);

    return NextResponse.json({success: true});
}
