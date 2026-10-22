import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendVerification } from "@/lib/verification";
import { InvalidInput, parseEmail, parseName } from "@/lib/accountInput";
import { clientIp, hit, limits, waitTime } from "@/lib/rateLimit";

export async function POST(request: Request) {
    const body = await request.json();

    let name, email;
    try {
        name = parseName(body.name);
        email = parseEmail(body.email);
    } catch (error) {
        if (error instanceof InvalidInput) {
            return NextResponse.json({error: error.message}, {status: 400});
        }
        throw error;
    }

    const { password, acceptedTerms } = body;
    if (typeof password !== "string" || !password) {
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

    // One checkbox covers both the Terms of Service and the Privacy Policy
    if (acceptedTerms !== true) {
        return NextResponse.json(
            {error: "Please agree to the Terms of Service and Privacy Policy to create an account."},
            {status: 400}
        );
    }

    // Checked after validation so typos don't use up the limit. Each sign-up sends an email.
    const limit = await hit(limits.signUpPerIp(clientIp(request)));
    if (!limit.allowed) {
        return NextResponse.json(
            {error: `Too many accounts created from this network. Try again in ${waitTime(limit.resetAt)}.`},
            {status: 429}
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
            termsAcceptedAt: new Date(),
            privacyAcceptedAt: new Date(),
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
