"use client";
import { useState } from "react";
import { Field, inputClass } from "../FormFields";
import Section, { sendJson, type SaveMessage } from "./Section";

export default function PasswordSection() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<SaveMessage>();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage(undefined);
        if (newPassword !== confirmPassword) {
            setMessage({ tone: "error", text: "The new passwords don't match." });
            return;
        }
        setSaving(true);
        const error = await sendJson("/api/account/password", "POST", { currentPassword, newPassword });
        setSaving(false);
        if (error) {
            setMessage({ tone: "error", text: error });
            return;
        }
        setMessage({ tone: "success", text: "Password changed." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    }

    return (
        <Section title="Password" onSubmit={handleSubmit} saving={saving} message={message} submitLabel="Change password">
            <Field label="Current password">
                <input className={inputClass} type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password" hint="At least 8 characters.">
                    <input className={inputClass} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
                </Field>
                <Field label="Confirm new password">
                    <input className={inputClass} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
                </Field>
            </div>
        </Section>
    );
}
