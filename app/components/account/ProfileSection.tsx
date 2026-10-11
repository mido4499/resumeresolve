"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "../FormFields";
import Section, { sendJson, type SaveMessage } from "./Section";

export default function ProfileSection({ initialName, initialPhone }: { initialName: string, initialPhone: string }) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [phone, setPhone] = useState(initialPhone);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<SaveMessage>();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setMessage(undefined);
        const error = await sendJson("/api/account", "PATCH", { name, phone });
        setSaving(false);
        setMessage(error ? { tone: "error", text: error } : { tone: "success", text: "Profile saved." });
        if (!error) router.refresh();
    }

    return (
        <Section title="Profile" description="Your name and phone number appear at the top of your resume." onSubmit={handleSubmit} saving={saving} message={message}>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name">
                    <input className={inputClass} value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />
                </Field>
                <Field label="Phone number" hint="Optional">
                    <input className={inputClass} type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="(480) 555-0123" />
                </Field>
            </div>
        </Section>
    );
}
