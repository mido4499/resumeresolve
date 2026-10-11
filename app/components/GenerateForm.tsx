"use client";
import { useState } from "react";
import Link from "next/link";
import Button, { buttonBase, buttonSizes } from "./Button";
import PageHeader, { cardClass } from "./PageHeader";
import { Field, inputClass, Notice } from "./FormFields";

type GenerateFormProps = {
    templates: { id: string, name: string }[];
    hasExperiences: boolean;
    hasEducation: boolean;      // coursework only appears under a complete education entry
};

// Saves the .docx returned by /api/generate, using the server's filename
async function saveFile(res: Response) {
    const fileName = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "Resume.docx";
    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return fileName;
}

export default function GenerateForm({ templates, hasExperiences, hasEducation }: GenerateFormProps){
    const [jDescription, setJDescription] = useState("");
    const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
    const [coursework, setCoursework] = useState("");
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<{ tone: "success" | "error", text: string }>();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setGenerating(true);
        setMessage(undefined);

        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobDescription: jDescription,
                    templateId,
                    coursework: hasEducation && coursework.trim() ? coursework : undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setMessage({ tone: "error", text: data.error ?? "Couldn't generate the resume. Please try again." });
                return;
            }
            const fileName = await saveFile(res);
            setMessage({ tone: "success", text: `Your resume is downloading as "${fileName}". Open it in Word or upload it to Google Docs to make final edits.` });
        } catch {
            setMessage({ tone: "error", text: "Couldn't reach the server. Check your connection and try again." });
        } finally {
            setGenerating(false);
        }
    }

    const header = (
        <PageHeader
            eyebrow="Resume"
            title="Generate a resume"
            description="Paste the job description and we'll tailor a one-page resume from your diary."
        />
    );

    if (!hasExperiences) {
        return (
            <>
                {header}
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-(--slate) px-6 py-14 text-center">
                    <p className="text-lg text-(--platinum)">Your diary is empty</p>
                    <p className="max-w-sm text-(--steel)">Resumes are written from your experiences and diary entries. Add at least one experience first.</p>
                    <Link href="/dashboard/add-experience" className={`${buttonBase} ${buttonSizes.primary}`}>+ Add experience</Link>
                </div>
            </>
        );
    }

    return(
        <>
            {header}

            <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-6`}>
                <Field label="Enter the description for the job you're applying for">
                    <textarea
                        id="jDescription"
                        name="jDescription"
                        onChange={(e) => setJDescription(e.target.value)}
                        value={jDescription}
                        className={`${inputClass} min-h-64 resize-y`}
                        placeholder="Paste the full job posting here..."
                        maxLength={20000}
                        disabled={generating}
                        required
                    />
                </Field>

                <fieldset className="flex flex-col gap-3">
                    <legend className="mb-1.5 text-xs font-semibold tracking-[0.14em] text-(--steel) uppercase">Template</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {templates.map(template => (
                            <label
                                key={template.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${templateId === template.id
                                    ? "border-(--oxide) bg-(--oxide)/10 text-(--platinum)"
                                    : "border-(--slate) text-(--chrome) hover:border-(--steel)"}`}
                            >
                                <input
                                    type="radio"
                                    name="template"
                                    value={template.id}
                                    checked={templateId === template.id}
                                    onChange={() => setTemplateId(template.id)}
                                    disabled={generating}
                                    className="h-4 w-4 accent-(--oxide)"
                                />
                                {template.name}
                            </label>
                        ))}
                    </div>
                </fieldset>

                {hasEducation ? (
                    <Field label="Relevant coursework (optional)" hint="Listed under your education on this resume only. Pick courses that match the job.">
                        <input
                            className={inputClass}
                            value={coursework}
                            onChange={e => setCoursework(e.target.value)}
                            placeholder="Data Structures & Algorithms, Operating Systems, Databases"
                            maxLength={500}
                            disabled={generating}
                        />
                    </Field>
                ) : (
                    <p className="rounded-2xl border border-dashed border-(--slate) px-4 py-3 text-sm text-(--steel)">
                        Your resume won&apos;t have an Education section. To add one (and relevant coursework), fill in your school, major, and graduation date in{" "}
                        <Link href="/dashboard/account" className="text-(--oxide) hover:underline">Account</Link>.
                    </p>
                )}

                {message && <Notice tone={message.tone}>{message.text}</Notice>}

                <p className="flex items-start gap-2 text-sm text-(--steel)">
                    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="mt-0.5 h-4 w-4 shrink-0">
                        <circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />
                    </svg>
                    AI can make mistakes. Please review the resume before using it.
                </p>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                    {generating && (
                        <span className="flex items-center justify-center gap-2 text-sm text-(--steel)" aria-live="polite">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-(--oxide) motion-reduce:animate-none" />
                            Writing your resume. This can take up to a minute.
                        </span>
                    )}
                    <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={generating || !jDescription.trim() || !templateId}>
                        {generating ? "Generating..." : "Generate resume"}
                    </Button>
                </div>
            </form>
        </>
    )
}
