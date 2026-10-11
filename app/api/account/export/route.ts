import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const day = (date: Date) => date.toISOString().split("T")[0];

// Download everything the user has entered as a .json file: profile, education, experiences and their diary entries.
// Internal fields (ids, password hash, verification tokens) are left out.
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            education: { orderBy: { id: "asc" } },
            experiences: {
                orderBy: { startDate: "desc" },
                include: { contributions: { orderBy: { createdAt: "asc" } } },
            },
        },
    });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const data = {
        exportedAt: new Date().toISOString(),
        profile: { name: user.name, email: user.email, phone: user.phone },
        education: user.education.map(e => ({
            school: e.school,
            major: e.major,
            minor: e.minor,
            graduationDate: e.graduationDate && e.graduationDate.toISOString().slice(0, 7),
            graduated: e.graduated,
            gpa: e.gpa,
            achievements: e.achievements,
        })),
        experiences: user.experiences.map(exp => ({
            role: exp.role,
            place: exp.place,
            startDate: day(exp.startDate),
            endDate: exp.endDate ? day(exp.endDate) : "present",
            diaryEntries: exp.contributions.map(c => ({ date: day(c.createdAt), entry: c.entry })),
        })),
    };

    return new Response(JSON.stringify(data, null, 2), {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="resume-diary-export-${day(new Date())}.json"`,
        },
    });
}
