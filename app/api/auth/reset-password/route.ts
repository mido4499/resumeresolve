import { prisma } from "@/lib/prisma";
import { findValidResetToken } from "@/lib/passwordReset";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Set a new password using the token from a reset email. The token works once.
export async function POST(request: Request) {
    const { token, password } = await request.json();

    if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json({error: "Password must be at least 8 characters."}, {status: 400});
    }
    const record = typeof token === "string" ? await findValidResetToken(token) : null;
    const user = record && await prisma.user.findUnique({ where: { id: record.userId } });
    if (!record || !user) {
        return NextResponse.json({error: "This reset link is invalid or has expired. Request a new one."}, {status: 400});
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: {
                password: await bcrypt.hash(password, 10),
                // Opening a link sent to the address proves the user owns it
                emailVerified: user.emailVerified ?? new Date(),
            },
        }),
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({success: true});
}
