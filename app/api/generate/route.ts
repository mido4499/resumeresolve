import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Packer } from "docx";
import generate from "@/lib/generation";
import { templates } from "@/lib/templates";
import { fitToBudget } from "@/lib/templates/helpers";
import { isEducationComplete } from "@/lib/education";
import type { ResumeData } from "@/lib/templates/types";

// Claude can take a while to write a resume from a long diary
export const maxDuration = 60;

// Caps on user input, so a single request can't run up a large API bill
const MAX_JOB_DESCRIPTION_CHARS = 20000;
const MAX_COURSEWORK_CHARS = 500;

// Generate a resume for a job description and return it as a .docx file
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const { jobDescription, templateId, coursework } = await request.json();

    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
        return NextResponse.json({error: "A job description is required."}, {status: 400});
    }
    if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
        return NextResponse.json({error: `The job description must be under ${MAX_JOB_DESCRIPTION_CHARS} characters.`}, {status: 400});
    }
    if (coursework !== undefined && (typeof coursework !== "string" || coursework.length > MAX_COURSEWORK_CHARS)) {
        return NextResponse.json({error: `Relevant coursework must be under ${MAX_COURSEWORK_CHARS} characters.`}, {status: 400});
    }
    // hasOwn so ids like "toString" don't match inherited object properties
    if (typeof templateId !== "string" || !Object.hasOwn(templates, templateId)) {
        return NextResponse.json({error: "Unknown template."}, {status: 400});
    }
    const template = templates[templateId];

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            experiences: {
                orderBy: { startDate: "desc" },
                include: { contributions: { orderBy: { createdAt: "asc" } } },
            },
            education: { orderBy: { graduationDate: "desc" } },
        },
    });
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    if (!user.emailVerified) {
        return NextResponse.json({error: "Verify your email before generating a resume."}, {status: 403});
    }
    if (user.experiences.length === 0) {
        return NextResponse.json({error: "Add at least one experience before generating a resume."}, {status: 400});
    }

    let resume;
    try {
        resume = await generate(jobDescription, user.experiences, template);
    } catch (error) {
        console.error("Resume generation failed:", error);
        return NextResponse.json({error: "Couldn't generate the resume. Please try again."}, {status: 502});
    }

    const data: ResumeData = {
        ...fitToBudget(resume, template.budget),
        name: user.name,
        contact: [user.phone, user.email].filter((c): c is string => Boolean(c)),
        // Incomplete entries are left out; with none left, the resume has no Education section
        education: user.education.filter(isEducationComplete),
        coursework: coursework?.trim() || undefined,
    };

    const buffer = await Packer.toBuffer(template.render(data));
    // Content-Disposition filenames must be plain ASCII
    const fileName = `${user.name} Resume.docx`.replace(/[^\w .-]/g, "");

    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Disposition": `attachment; filename="${fileName}"`,
        },
    });
}
