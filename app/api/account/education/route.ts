import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InvalidInput, parseEducation, type EducationInput } from "@/lib/accountInput";
import { NextResponse } from "next/server";

const MAX_ENTRIES = 5;

// Replace the user's education entries with the list from the Edit account form.
// Incomplete entries are kept so they can be finished later; the resume only uses complete ones.
export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const { entries } = await request.json();
    if (!Array.isArray(entries) || entries.length > MAX_ENTRIES) {
        return NextResponse.json({error: `You can add up to ${MAX_ENTRIES} education entries.`}, {status: 400});
    }

    let education: EducationInput[];
    try {
        education = entries.map(parseEducation).filter((e): e is EducationInput => e !== null);
    } catch (error) {
        if (error instanceof InvalidInput) {
            return NextResponse.json({error: error.message}, {status: 400});
        }
        throw error;
    }

    const userId = session.user.id;
    await prisma.$transaction([
        prisma.education.deleteMany({ where: { userId } }),
        prisma.education.createMany({ data: education.map(e => ({ ...e, userId })) }),
    ]);

    return NextResponse.json({success: true});
}
