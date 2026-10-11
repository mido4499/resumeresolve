"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button, { buttonBase, buttonSizes } from "./Button";
import PageHeader, { cardClass } from "./PageHeader";
import { Field, inputClass, Notice } from "./FormFields";
import Select from "./Select";
import { useState } from "react";

export type ExperienceDisplay = {
    id: string,
    role: string,
    place: string,
}

export default function AddDiary({experiences}: {experiences: ExperienceDisplay[]}){
    const [contribution, setContribution] = useState("");
    const [selectedId, setSelectedId] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(){
        setError("");

        const res = await fetch(
            `/api/experiences/${selectedId}/contributions`,
            {
                method: 'POST',

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    entry: contribution,
                })
            }
        )


        const newContribution = await res.json();

        if (!res.ok){
            setError(newContribution.error);
            return;
        }

        router.push("/dashboard/experiences");
    }
    return (
        <>
            <PageHeader
                eyebrow="Today's entry"
                title="Diary"
                description="Log what you did today. No win is too small; it all adds up to your next resume."
            />

            {experiences.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-(--slate) px-6 py-14 text-center">
                    <p className="text-lg text-(--platinum)">Add an experience first</p>
                    <p className="max-w-sm text-(--steel)">Diary entries belong to a job or project. Create one, then come back to log what you did.</p>
                    <Link href="/dashboard/add-experience" className={`${buttonBase} ${buttonSizes.primary}`}>+ Add experience</Link>
                </div>
            ) : (
                <section className={`${cardClass} flex flex-col gap-5`}>
                    <Field label="Experience">
                        <Select experiences={experiences} selectedId={selectedId} setSelectedId={setSelectedId}/>
                    </Field>

                    <Field label="What did you contribute?">
                        <textarea
                            id="contribution"
                            name="contribution"
                            onChange={(e) =>{
                                setContribution(e.target.value); 
                            }}
                            value={contribution}
                            className={`${inputClass} min-h-44 resize-y`}
                            placeholder="What did you contribute today?"
                            required
                        />
                    </Field>

                    {error && <Notice tone="error">{error}</Notice>}

                    <div className="flex justify-end">
                        <Button variant="primary" className="w-full sm:w-auto" onClick={()=>handleSubmit()}>
                            Save entry
                        </Button>
                    </div>
                </section>
            )}
        </>
    )
}
