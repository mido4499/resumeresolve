"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "./Button";
import { Field, formButtonClass, inputClass, Notice } from "./FormFields";
import CardFace from "./onboarding/CardFace";

export default function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [linkExpired, setLinkExpired] = useState(false);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("The passwords don't match.");
            return;
        }
        setSaving(true);
        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Something went wrong. Please try again.");
            // The link can expire (or be used in another tab) while this page is open
            setLinkExpired(/invalid or has expired/.test(data.error ?? ""));
            setSaving(false);
            return;
        }
        router.push("/?reset=success");
    }

    return (
        <CardFace onClose={() => router.push("/")}>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <h1 className="pr-8 text-2xl font-semibold text-(--platinum)">Choose a new password</h1>

                <Field label="New password" hint="At least 8 characters.">
                    <input className={inputClass} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required autoFocus />
                </Field>
                <Field label="Confirm new password">
                    <input className={inputClass} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
                </Field>

                {error && (
                    <Notice tone="error">
                        {error}{" "}
                        {linkExpired && <Link href="/?reset=invalid" className="font-semibold text-(--platinum) underline">Get a new link</Link>}
                    </Notice>
                )}

                <Button type="submit" variant="primary" disabled={saving} className={`w-full ${formButtonClass}`}>
                    {saving ? "Saving..." : "Save new password"}
                </Button>
            </form>
        </CardFace>
    );
}
