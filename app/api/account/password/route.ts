import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// Change the password; requires the current one
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const { currentPassword, newPassword } = await request.json();
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
        return NextResponse.json({error: "Current and new password are required."}, {status: 400});
    }
    if (newPassword.length < 8) {
        return NextResponse.json({error: "New password must be at least 8 characters."}, {status: 400});
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    if (!user.password) {
        return NextResponse.json({error: "This account doesn't use a password."}, {status: 400});
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
        return NextResponse.json({error: "Your current password is incorrect."}, {status: 400});
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return NextResponse.json({success: true});
}
