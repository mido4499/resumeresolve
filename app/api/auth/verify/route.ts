import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/verification";
import { NextResponse } from "next/server";

// The link in the verification email points here; the landing page reads the ?verify= result
export async function GET(request: Request) {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const redirectTo = (result: "success" | "expired" | "invalid") =>
        NextResponse.redirect(new URL(`/?verify=${result}`, url.origin));

    if (!token) {
        return redirectTo("invalid");
    }

    const record = await prisma.verificationToken.findUnique({
        where: { tokenHash: hashToken(token) },
    });
    if (!record) {
        return redirectTo("invalid");
    }
    if (record.expiresAt < new Date()) {
        await prisma.verificationToken.delete({ where: { id: record.id } });
        return redirectTo("expired");
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) {
        return redirectTo("invalid");
    }

    // A link for an address other than the account's current one is an email change from the Edit account page
    const isEmailChange = record.email !== user.email;
    if (isEmailChange) {
        const taken = await prisma.user.findUnique({ where: { email: record.email } });
        if (taken) {
            await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
            return NextResponse.redirect(new URL("/dashboard/account?email=taken", url.origin));
        }
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { email: record.email, emailVerified: new Date() },
        }),
        prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return isEmailChange
        ? NextResponse.redirect(new URL("/dashboard/account?email=changed", url.origin))
        : redirectTo("success");
}
