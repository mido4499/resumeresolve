"use client";
import { useState } from "react";
import { Field, inputClass, Notice } from "../FormFields";
import Section, { sendJson, type SaveMessage } from "./Section";

type EmailSectionProps = {
    currentEmail: string;
    initialPendingEmail: string | null;     // a change waiting for its verification link to be opened
    initialMessage?: SaveMessage;           // result of following a verification link
};

export default function EmailSection({ currentEmail, initialPendingEmail, initialMessage }: EmailSectionProps) {
    const [email, setEmail] = useState("");
    const [pendingEmail, setPendingEmail] = useState(initialPendingEmail);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(initialMessage);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setMessage(undefined);
        const error = await sendJson("/api/account/email", "POST", { email });
        setSaving(false);
        if (error) {
            setMessage({ tone: "error", text: error });
            return;
        }
        setPendingEmail(email.trim());
        setEmail("");
    }

    return (
        <Section
            title="Email"
            description="This email appears on your resume and is the one you sign in with."
            onSubmit={handleSubmit}
            saving={saving}
            message={message}
            submitLabel="Send verification link"
        >
            <p className="text-(--chrome)">
                Current email: <span className="font-semibold text-(--platinum)">{currentEmail}</span>
            </p>
            {pendingEmail && (
                <Notice tone="success">
                    We sent a verification link to <span className="font-semibold">{pendingEmail}</span>.
                    Your email changes once you open it.
                </Notice>
            )}
            <Field label="New email" hint="We'll send a link to the new address. Nothing changes until you open it.">
                <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </Field>
        </Section>
    );
}
