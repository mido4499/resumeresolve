import Button from "../Button";
import { formButtonClass, Notice } from "../FormFields";

type SectionProps = {
    title: string;
    description?: React.ReactNode;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    saving: boolean;
    message?: SaveMessage;
    submitLabel?: string;
    hideSubmit?: boolean;
    children: React.ReactNode;
};

export type SaveMessage = { tone: "success" | "error", text: string };

// One card on the Edit account page: its own form, save button, and result message
export default function Section({ title, description, onSubmit, saving, message, submitLabel = "Save changes", hideSubmit, children }: SectionProps) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-3xl border border-(--slate)/40 bg-(--metal) p-7 sm:p-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-semibold text-(--platinum)">{title}</h2>
                {description && <p className="text-(--steel)">{description}</p>}
            </div>
            {children}
            {message && <Notice tone={message.tone}>{message.text}</Notice>}
            {!hideSubmit && (
                <div className="flex justify-end">
                    <Button type="submit" variant="primary" disabled={saving} className={formButtonClass}>
                        {saving ? "Saving..." : submitLabel}
                    </Button>
                </div>
            )}
        </form>
    );
}

// Sends JSON and returns the server's error message, or null on success
export async function sendJson(url: string, method: string, body: unknown): Promise<string | null> {
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return data.error ?? "Something went wrong. Please try again.";
}
