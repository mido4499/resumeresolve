"use client";
import { useRef, useState } from "react";
import { isEducationComplete } from "@/lib/education";
import Button from "../Button";
import EducationFields, { EducationWarning, EMPTY_EDUCATION } from "../EducationFields";
import { Field, formButtonClass, inputClass } from "../FormFields";

// Optional step after verification: phone number and education, both shown on the resume
export default function CompleteAccount({ onDone }: { onDone: () => void }) {
    const [phone, setPhone] = useState("");
    const [education, setEducation] = useState(EMPTY_EDUCATION);
    const [warningOpen, setWarningOpen] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const schoolInput = useRef<HTMLInputElement>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!isEducationComplete(education)) {
            setWarningOpen(true);
            return;
        }
        save();
    }

    async function save() {
        setSaving(true);
        setError("");
        const res = await fetch("/api/account/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, education }),
        });
        if (!res.ok) {
            const data = await res.json();
            setError(data.error);
            setSaving(false);
            setWarningOpen(false);
            return;
        }
        onDone();
    }

    function keepFilling() {
        setWarningOpen(false);
        schoolInput.current?.focus();
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 pr-8">
                <h2 className="text-2xl font-semibold text-(--platinum)">Complete your account</h2>
                <p className="text-(--chrome)">
                    Your email is verified. Everything below is optional and appears on your resume. You can change it later from Account.
                </p>
            </div>

            <Field label="Phone number">
                <input className={inputClass} type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="(480) 555-0123" />
            </Field>

            <fieldset className="flex flex-col gap-4 rounded-2xl border border-(--charcoal) p-5">
                <legend className="px-2 text-sm font-semibold text-(--platinum)">Education</legend>
                <EducationFields
                    value={education}
                    onChange={value => { setEducation(value); setWarningOpen(false); }}
                    schoolRef={schoolInput}
                />
            </fieldset>

            {warningOpen && (
                <EducationWarning continueLabel="Continue without education" saving={saving} onContinue={save} onKeepEditing={keepFilling}>
                    <span className="font-semibold text-(--platinum)">Your resume won&apos;t have an Education section.</span>{" "}
                    It needs your school, major, and graduation date. Continue anyway?
                </EducationWarning>
            )}

            {error && <p className="text-sm text-(--rust)">{error}</p>}

            {!warningOpen && (
                <Button type="submit" variant="primary" disabled={saving} className={`w-full ${formButtonClass}`}>
                    {saving ? "Saving..." : "Finish setting up"}
                </Button>
            )}
        </form>
    );
}
