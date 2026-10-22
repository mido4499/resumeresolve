"use client";
import { useState } from "react";
import Button from "../Button";
import { Field, formButtonClass, inputClass, Notice } from "../FormFields";
import { IconTile } from "./CardFace";

type ForgotPasswordProps = {
    onBack: () => void;
    notice?: { tone: "success" | "error", text: string };
};

// Asks for the account email and sends a reset link. The confirmation is worded the same
// whether or not the account exists (the server doesn't reveal it either).
export default function ForgotPassword({ onBack, notice }: ForgotPasswordProps) {
    const [email, setEmail] = useState("");
    const [sentTo, setSentTo] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setLoading(false);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Something went wrong. Please try again.");
            return;
        }
        setSentTo(email.trim());
    }

    if (sentTo) {
        return (
            <div className="flex flex-col items-center gap-6 py-2 text-center">
                <IconTile><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></IconTile>
                <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-semibold text-(--platinum)">Check your inbox</h2>
                    <p className="text-lg leading-relaxed text-(--chrome)">
                        If there&apos;s an account for <span className="font-semibold text-(--platinum)">{sentTo}</span>, we&apos;ve sent it a link to reset the password.
                        The link expires in 1 hour.
                    </p>
                </div>
                <div className="flex w-full flex-col gap-3 border-t border-(--charcoal) pt-6 text-sm">
                    <button type="button" onClick={() => setSentTo("")} className="text-(--oxide) hover:underline">Use a different email</button>
                    <button type="button" onClick={onBack} className="text-(--steel) hover:text-(--platinum)">&larr; Back to sign in</button>
                </div>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 pr-8">
                <h2 className="text-2xl font-semibold text-(--platinum)">Reset your password</h2>
                <p className="text-(--chrome)">Enter the email you sign in with and we&apos;ll send you a link to choose a new password.</p>
            </div>

            {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

            <Field label="Email">
                <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required autoFocus />
            </Field>

            {error && <p className="text-sm text-(--rust)">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading} className={`w-full ${formButtonClass}`}>
                {loading ? "Sending..." : "Send reset link"}
            </Button>

            <button type="button" onClick={onBack} className="self-start text-sm text-(--steel) hover:text-(--platinum)">&larr; Back to sign in</button>
        </form>
    );
}
