import type { Document } from "docx";
import type { Resume } from "@/lib/generation";
import type { Education } from "@/generated/prisma/client";

export type EducationEntry = Omit<Education, "id" | "userId" | "createdAt">;

// Everything a template needs: Claude's output plus data from the user's account
export type ResumeData = Resume & {
    name: string;
    contact: string[];          // e.g. location, phone, email, links, in display order
    education: EducationEntry[];
    coursework?: string;        // entered on every generation, not stored
};

export type Template = {
    id: string;
    name: string;
    // Skill section categories in display order; "Others" is added automatically (see allSkillCategories)
    skillCategories: string[];
    // Rough capacity of one page, used to trim Claude's output before rendering
    budget: {
        maxBullets: number;
        maxBulletChars: number;
    };
    render: (data: ResumeData) => Document;
};
