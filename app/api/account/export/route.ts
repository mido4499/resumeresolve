import { auth } from "@/auth";
import { getDiaryExport } from "@/lib/diaryExport";
import { NextResponse } from "next/server";

// Download everything the user has entered as a .json file (see getDiaryExport)
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const diary = await getDiaryExport(session.user.id);
    if (!diary) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const now = new Date().toISOString();
    return new Response(JSON.stringify({ exportedAt: now, ...diary }, null, 2), {
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="resume-diary-export-${now.split("T")[0]}.json"`,
        },
    });
}
