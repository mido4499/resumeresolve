import { TextRun, type IRunOptions } from "docx";
import type { ResumeData, Template } from "./types";

// Added to every template so relevant skills that fit none of its categories still reach the resume
export const OTHER_SKILLS_CATEGORY = "Others";

export function allSkillCategories(template: Template): string[] {
    return [...template.skillCategories, OTHER_SKILLS_CATEGORY];
}

// Enforces the template's bullet budget in case Claude went over it.
// Trims from the end of the entry with the most bullets (Claude orders bullets most relevant first),
// keeping at least one bullet per entry.
export function fitToBudget<T extends Pick<ResumeData, "experience" | "projects">>(resume: T, budget: Template["budget"]): T {
    const experience = resume.experience.map(e => ({ ...e, bullets: [...e.bullets] }));
    const projects = resume.projects.map(p => ({ ...p, bullets: [...p.bullets] }));
    const entries = [...experience, ...projects];

    let total = entries.reduce((sum, e) => sum + e.bullets.length, 0);
    while (total > budget.maxBullets) {
        // On ties, trim the later (older or project) entry
        const longest = entries.reduce((a, b) => (b.bullets.length >= a.bullets.length ? b : a));
        if (longest.bullets.length <= 1) break;
        longest.bullets.pop();
        total--;
    }

    return { ...resume, experience, projects };
}

// Puts skills in the template's category order, merging repeated categories and dropping empty ones
export function orderSkills(skills: ResumeData["skills"], categories: string[]): ResumeData["skills"] {
    return categories
        .map(category => ({
            category,
            items: skills.filter(s => s.category === category).flatMap(s => s.items),
        }))
        .filter(s => s.items.length > 0);
}

// Turns "Saved **3+ hours** per project" into runs, bolding the parts between double asterisks
export function richText(text: string, options: IRunOptions = {}): TextRun[] {
    // split() with a capture group puts the bold parts at odd indexes
    return text
        .split(/\*\*(.+?)\*\*/)
        .map((part, i) => ({ part, bold: i % 2 === 1 }))
        .filter(({ part }) => part !== "")
        .map(({ part, bold }) => new TextRun({ ...options, text: part, bold }));
}

// "Mon YYYY", e.g. "May 2028"
export function monthYear(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
