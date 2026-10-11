import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvalidInput, parseName, parsePhone } from "@/lib/accountInput";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Update the profile fields shown on the resume: name and phone number
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const body = await request.json();
    let name, phone;
    try {
        name = parseName(body.name);
        phone = parsePhone(body.phone);
    } catch (error) {
        if (error instanceof InvalidInput) {
            return NextResponse.json({error: error.message}, {status: 400});
        }
        throw error;
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name, phone },
    });

    return NextResponse.json({success: true});
}

// Permanently delete the account. Experiences, diary entries, education and verification tokens
// are removed with it by the schema's onDelete: Cascade relations.
export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    // Password accounts confirm with their password; others (no password set) type DELETE
    const { password, confirmation } = await request.json();
    if (user.password) {
        if (typeof password !== "string" || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({error: "Your password is incorrect."}, {status: 400});
        }
    } else if (confirmation !== "DELETE") {
        return NextResponse.json({error: 'Type DELETE to confirm.'}, {status: 400});
    }

    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({success: true});
}
