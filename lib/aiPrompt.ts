import type { DiaryExport } from "@/lib/diaryExport";

// A ready-to-paste prompt for writing a resume in any AI chat, with the user's own template.
// Mirrors the rules our own generation follows (lib/generation.ts).
export function buildAiPrompt(diary: NonNullable<DiaryExport>, jobDescription: string) {
    const job = jobDescription.trim() || "[Paste the job description here]";

    return `Write a one-page resume tailored to the job description below, using only the information in my diary.

Rules:
- Use only facts from my diary. Don't invent employers, titles, dates, skills, numbers, or achievements.
- Choose the experiences and diary entries most relevant to the job. Turn them into short bullet points that start with a strong action verb, and keep any real numbers.
- Projects can come from experiences or from individual diary entries.
- Use the job description's wording for skills and keywords where my diary supports it.
- Keep it to one page.
- Write dates as "Mon YYYY", or "Present" for an experience whose end date is "present".
- If I attach or describe a resume template, follow its layout and sections exactly. Otherwise, use a clean single-column layout that applicant tracking systems can read.

JOB DESCRIPTION:
${job}

MY DIARY (JSON):
${JSON.stringify(diary, null, 2)}
`;
}
