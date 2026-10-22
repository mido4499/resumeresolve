"use client";
import { useState } from "react";
import Button from "./Button";
import { cardClass } from "./PageHeader";
import { Notice } from "./FormFields";
import { buildAiPrompt } from "@/lib/aiPrompt";
import type { DiaryExport } from "@/lib/diaryExport";

type ExportForAIProps = {
    diary: NonNullable<DiaryExport>;
    jobDescription: string;     // from the form above; a placeholder is used when it's empty
};

// The other path promised in onboarding: take the diary to any AI and use your own template
export default function ExportForAI({ diary, jobDescription }: ExportForAIProps) {
    const [message, setMessage] = useState<{ tone: "success" | "error", text: string }>();

    async function copy() {
        try {
            await navigator.clipboard.writeText(buildAiPrompt(diary, jobDescription));
            setMessage({ tone: "success", text: "Copied. Paste it into your AI chat and attach your resume template." });
        } catch {
            setMessage({ tone: "error", text: "Your browser blocked copying. Download the prompt as a file instead." });
        }
    }

    function download() {
        const url = URL.createObjectURL(new Blob([buildAiPrompt(diary, jobDescription)], { type: "text/plain" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "resume-prompt.txt";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage(undefined);
    }

    return (
        <section className={`${cardClass} flex flex-col gap-4`}>
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-(--platinum)">Prefer your own template?</h2>
                <p className="text-(--chrome)">
                    Copy your diary as a ready-made prompt and paste it into any AI chat, along with your resume template.
                    It includes your name, contact details, education, and every diary entry
                    {jobDescription.trim() ? ", plus the job description above." : ". Paste a job description above first to include it too."}
                </p>
            </div>

            {message && <Notice tone={message.tone}>{message.text}</Notice>}

            <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" variant="secondary" onClick={copy}>Copy prompt</Button>
                <Button type="button" variant="secondary" className="bg-transparent ring-1 ring-(--slate) hover:bg-(--charcoal)" onClick={download}>
                    Download as .txt
                </Button>
            </div>
        </section>
    );
}
