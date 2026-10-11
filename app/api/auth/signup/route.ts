import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendVerification } from "@/lib/verification";

export async function POST(request: Request) {
    const { name, email, password} = await request.json();

    if (!name || !email || !password) {
        return NextResponse.json(
            {error: 'Name, email, and password are required.'},
            {status: 400}
        );
    }

    if (password.length < 8) {
        return NextResponse.json(
            {error: "Password must be at least 8 characters."},
            {status: 400}
        );
    }

    // Check if user exists
    const exists = await prisma.user.findUnique({
        where: {
            email: email,
        }
    })
    if (exists){
        return NextResponse.json(
            {error: "Email already exists."},
            {status: 400}
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        }
    });

    // The account exists either way; if the email fails, the user can resend it from the verify step
    try {
        await sendVerification(user, new URL(request.url).origin);
    } catch (error) {
        console.error("Failed to send verification email:", error);
    }

    return NextResponse.json({success: true});
}