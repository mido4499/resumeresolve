"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isEducationComplete } from "@/lib/education";
import EducationFields, { EducationWarning, EMPTY_EDUCATION, type EducationFormValues } from "../EducationFields";
import Section, { sendJson, type SaveMessage } from "./Section";

const MAX_ENTRIES = 5;

type Entry = EducationFormValues & { key: string };

function isBlank(entry: EducationFormValues) {
    return !entry.school && !entry.major && !entry.minor && !entry.graduationDate && !entry.gpa && !entry.achievements;
}

export default function EducationSection({ initialEntries }: { initialEntries: EducationFormValues[] }) {
    const router = useRouter();
    const [entries, setEntries] = useState<Entry[]>(() => initialEntries.map(e => ({ ...e, key: crypto.randomUUID() })));
    const [warning, setWarning] = useState<React.ReactNode>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<SaveMessage>();

    function update(key: string, value: EducationFormValues) {
        setEntries(list => list.map(e => (e.key === key ? { ...value, key } : e)));
        setWarning(null);
        setMessage(undefined);
    }

    function add() {
        setEntries(list => [...list, { ...EMPTY_EDUCATION, key: crypto.randomUUID() }]);
        setWarning(null);
    }

    function remove(key: string) {
        setEntries(list => list.filter(e => e.key !== key));
        setWarning(null);
        setMessage(undefined);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const filled = entries.filter(entry => !isBlank(entry));
        const incomplete = entries
            .map((entry, i) => ({ entry, number: i + 1 }))
            .filter(({ entry }) => !isBlank(entry) && !isEducationComplete(entry));

        if (!filled.some(isEducationComplete)) {
            setWarning(<>
                <span className="font-semibold text-(--platinum)">Your resume won&apos;t have an Education section.</span>{" "}
                It needs at least one entry with a school, major, and graduation date. Save anyway?
            </>);
            return;
        }
        if (incomplete.length) {
            const numbers = incomplete.map(i => `#${i.number}`).join(", ");
            setWarning(<>
                <span className="font-semibold text-(--platinum)">Entry {numbers} won&apos;t appear on your resume.</span>{" "}
                Each entry needs a school, major, and graduation date. Save anyway?
            </>);
            return;
        }
        save();
    }

    async function save() {
        setSaving(true);
        setMessage(undefined);
        // The server only reads the education fields, so the React keys can go along
        const error = await sendJson("/api/account/education", "PUT", { entries });
        setSaving(false);
        setWarning(null);
        setMessage(error ? { tone: "error", text: error } : { tone: "success", text: "Education saved." });
        if (!error) router.refresh();
    }

    return (
        <Section
            title="Education"
            description="An entry appears on your resume when it has a school, major, and graduation date."
            onSubmit={handleSubmit}
            saving={saving}
            message={message}
            hideSubmit={Boolean(warning)}
        >
            {entries.length === 0 && (
                <p className="rounded-2xl border border-dashed border-(--slate) px-5 py-6 text-center text-(--steel)">
                    No education yet. Your resume won&apos;t have an Education section.
                </p>
            )}

            {entries.map((entry, i) => (
                <div key={entry.key} role="group" aria-label={`Education entry ${i + 1}`} className="flex flex-col gap-4 rounded-2xl border border-(--charcoal) p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-(--platinum)">
                            #{i + 1}
                            {isEducationComplete(entry)
                                ? <span className="ml-3 font-normal text-(--oxide)">On your resume</span>
                                : <span className="ml-3 font-normal text-(--steel)">Not on your resume yet</span>}
                        </span>
                        <button type="button" onClick={() => remove(entry.key)} className="text-sm text-(--steel) hover:text-(--rust)">
                            Remove
                        </button>
                    </div>
                    <EducationFields value={entry} onChange={value => update(entry.key, value)} />
                </div>
            ))}

            {entries.length < MAX_ENTRIES && (
                <button
                    type="button"
                    onClick={add}
                    className="rounded-2xl border border-dashed border-(--oxide)/60 py-3 text-(--oxide) transition-colors hover:bg-(--oxide)/10"
                >
                    + Add education
                </button>
            )}

            {warning && (
                <EducationWarning continueLabel="Save anyway" saving={saving} onContinue={save} onKeepEditing={() => setWarning(null)}>
                    {warning}
                </EducationWarning>
            )}
        </Section>
    );
}
