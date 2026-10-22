import { prisma } from "@/lib/prisma";

const day = (date: Date) => date.toISOString().split("T")[0];

export type DiaryExport = Awaited<ReturnType<typeof getDiaryExport>>;

// Everything the user has entered: profile, education, experiences and their diary entries.
// Internal fields (ids, password hash, verification tokens) are left out.
// Returns null if the user doesn't exist.
export async function getDiaryExport(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            education: { orderBy: { id: "asc" } },
            experiences: {
                orderBy: { startDate: "desc" },
                include: { contributions: { orderBy: { createdAt: "asc" } } },
            },
        },
    });
    if (!user) return null;

    return {
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
}
