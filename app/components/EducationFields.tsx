"use client";
import Button from "./Button";
import { Field, formButtonClass, inputClass } from "./FormFields";

export type EducationFormValues = {
    school: string;
    major: string;
    minor: string;
    graduationDate: string;     // "YYYY-MM" from <input type="month">
    graduated: boolean;
    gpa: string;
    achievements: string;
};

export const EMPTY_EDUCATION: EducationFormValues = {
    school: "",
    major: "",
    minor: "",
    graduationDate: "",
    graduated: false,
    gpa: "",
    achievements: "",
};

type EducationFieldsProps = {
    value: EducationFormValues;
    onChange: (value: EducationFormValues) => void;
    schoolRef?: React.Ref<HTMLInputElement>;
};

// The education inputs used by onboarding and the Edit account page
export default function EducationFields({ value, onChange, schoolRef }: EducationFieldsProps) {
    function set<K extends keyof EducationFormValues>(key: K, fieldValue: EducationFormValues[K]) {
        onChange({ ...value, [key]: fieldValue });
    }

    return (
        <>
            <Field label="School">
                <input ref={schoolRef} className={inputClass} value={value.school} onChange={e => set("school", e.target.value)} placeholder="Arizona State University" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Major">
                    <input className={inputClass} value={value.major} onChange={e => set("major", e.target.value)} placeholder="B.S. in Computer Science" />
                </Field>
                <Field label="Minor">
                    <input className={inputClass} value={value.minor} onChange={e => set("minor", e.target.value)} placeholder="Data Science" />
                </Field>
            </div>
            <div className="grid items-end gap-4 sm:grid-cols-2">
                <Field label="Graduation date">
                    <input className={inputClass} type="month" value={value.graduationDate} onChange={e => set("graduationDate", e.target.value)} />
                </Field>
                <label className="flex h-11.5 cursor-pointer items-center gap-3 text-(--chrome)">
                    <input
                        type="checkbox"
                        checked={value.graduated}
                        onChange={e => set("graduated", e.target.checked)}
                        className="h-5 w-5 accent-(--oxide)"
                    />
                    I&apos;ve already graduated
                </label>
            </div>
            <Field label="GPA">
                <input className={inputClass} value={value.gpa} onChange={e => set("gpa", e.target.value)} placeholder="3.8 / 4.0" />
            </Field>
            <Field label="Achievements" hint="Honors, scholarships, societies... separate them with |">
                <textarea className={`${inputClass} min-h-20 resize-y`} value={value.achievements} onChange={e => set("achievements", e.target.value)} placeholder="Dean's List (4x) | Honor Society" />
            </Field>
        </>
    );
}

type EducationWarningProps = {
    children: React.ReactNode;
    continueLabel: string;
    saving: boolean;
    onContinue: () => void;
    onKeepEditing: () => void;
};

// Shown before saving education that won't make it onto the resume
export function EducationWarning({ children, continueLabel, saving, onContinue, onKeepEditing }: EducationWarningProps) {
    return (
        <div role="alert" className="flex flex-col gap-4 rounded-2xl border border-(--rust)/60 bg-(--rust)/10 p-5">
            <div className="text-(--chrome)">{children}</div>
            <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" className={`bg-(--rust) ${formButtonClass} hover:bg-(--rust)/80`} onClick={onContinue} disabled={saving}>
                    {saving ? "Saving..." : continueLabel}
                </Button>
                <Button type="button" variant="secondary" className={`bg-transparent ring-1 ring-(--steel) ${formButtonClass} hover:bg-(--charcoal)`} onClick={onKeepEditing}>
                    Keep filling
                </Button>
            </div>
        </div>
    );
}
