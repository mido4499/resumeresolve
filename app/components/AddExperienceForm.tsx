"use client";
import { useState } from "react";
import { Experience } from "@/generated/prisma/client";
import { Contribution } from "@/generated/prisma/client";
import Button from "./Button";
import { useRouter } from "next/navigation";
import ContributionCard from "./ContributionCard";
import PageHeader, { cardClass } from "./PageHeader";
import { Field, inputClass, Notice } from "./FormFields";

type AddExperienceFormProps = {
    experience?: Experience | null,
    contributions?: Contribution[] | null;
}


export default function AddExperienceForm({
    experience,
    contributions
}: AddExperienceFormProps){
    const isEdit = Boolean(experience);
    const [edited, setEdited] = useState(false);
    const [role, setRole] = useState(experience?.role ?? "");
    const [place, setPlace] = useState(experience?.place ?? "");
    const [startDate, setStartDate] = useState(experience?.startDate ?? "");
    const [endDate, setEndDate] = useState(experience?.endDate ?? "");
    // An existing experience without an end date is ongoing
    const [ongoing, setOngoing] = useState(isEdit && !experience?.endDate);
    const [contribution, setContribution] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(){
        setError("");
        if (!ongoing && !endDate) {
            setError("Add an end date, or tick \"I'm still doing this\".");
            return;
        }
        
        if (!isEdit) {
            const res = await fetch(
                `/api/experiences`,
                {
                    method: 'POST',
    
                    headers: {
                        "Content-Type": "application/json"
                    },
    
                    body: JSON.stringify({
                        role: role,
                        place: place,
                        text: contribution,
                        startDate: startDate,
                        endDate: ongoing ? null : endDate,
                    })
                }
            )
            const newExperience = await res.json();
    
            if (!res.ok){
                setError(newExperience.error);
                return;
            }
        }else {
            const res = await fetch(
                `/api/experiences/${experience!.id}`,
                {
                    method: 'PATCH',
    
                    headers: {
                        "Content-Type": "application/json"
                    },
    
                    body: JSON.stringify({
                        role: role,
                        place: place,
                        text: contribution,
                        startDate: startDate,
                        endDate: ongoing ? null : endDate,
                    })
                }
            )
            const newExperience = await res.json();
    
            if (!res.ok){
                setError(newExperience.error);
                return;
            }
        }
        // On create, the contribution was already sent with the new experience
        if (isEdit && contribution !== "") {
            const res = await fetch(
                `/api/experiences/${experience!.id}/contributions`,
                {
                    method: 'POST',

                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        entry: contribution,
                    })
                }
            )

            if (!res.ok) {
                setError("Failed to add contribution");
                return;
            }
        }

        router.push(`/dashboard`)
    }

    function toDateInputValue(date: Date | string | undefined) {
        if (!date) {
            return "";
        }
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    }

    async function handleRemoveContribution(contributionId: string){
        console.log("CONTRIBUTION ID---->", contributionId);
        await fetch(
            `/api/experiences/${experience!.id}/contributions/${contributionId}`,
            {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
        router.refresh();
    }


    return(
        <>
            <PageHeader
                eyebrow={isEdit ? "Experience" : "New experience"}
                title={isEdit ? experience!.role : "Add an experience"}
                description={isEdit
                    ? "Update the details, or log something new you contributed."
                    : "A job or a project. You can keep logging contributions to it from the Diary."}
            />

            <section className={`${cardClass} flex flex-col gap-5`}>
                <h2 className="text-lg font-semibold text-(--platinum)">Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Role">
                        <input
                            id="role"
                            name="role"
                            type="text"
                            className={inputClass}
                            value={role}
                            onChange={(e) => {setRole(e.target.value); setEdited(true);}}
                            placeholder="Software Engineering Intern"
                            required
                        />
                    </Field>
                    <Field label="Place">
                        <input
                            id="place"
                            name="place"
                            type="text"
                            className={inputClass}
                            value={place}
                            onChange={(e) => {setPlace(e.target.value); setEdited(true);}}
                            placeholder="Company, club, or project name"
                            required
                        />
                    </Field>
                    <Field label="Start date">
                        <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            className={inputClass}
                            value={toDateInputValue(startDate)}
                            onChange={(e) => {setStartDate(e.target.value); setEdited(true);}}
                            required
                        />
                    </Field>
                    <div className="flex flex-col gap-2">
                        <Field label="End date">
                            <input
                                id="endDate"
                                name="endDate"
                                type="date"
                                className={`${inputClass} disabled:opacity-40`}
                                value={ongoing ? "" : toDateInputValue(endDate)}
                                onChange={(e) => {setEndDate(e.target.value); setEdited(true);}}
                                disabled={ongoing}
                                required={!ongoing}
                            />
                        </Field>
                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-(--chrome)">
                            <input
                                type="checkbox"
                                checked={ongoing}
                                onChange={(e) => {setOngoing(e.target.checked); setEdited(true);}}
                                className="h-4 w-4 accent-(--oxide)"
                            />
                            I&apos;m still doing this (shows as &quot;Present&quot;)
                        </label>
                    </div>
                </div>
            </section>

            {isEdit && (
                <section className={`${cardClass} flex flex-col gap-4`}>
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-lg font-semibold text-(--platinum)">Contributions</h2>
                        {contributions && contributions.length > 0 && (
                            <span className="text-sm text-(--steel)">{contributions.length} logged</span>
                        )}
                    </div>

                    {contributions && (
                        contributions.map((contribution)=> (
                            <ContributionCard 
                            key={contribution.id}
                            text={contribution.entry} 
                            createdAt={toDateInputValue(contribution.createdAt)}
                            onRemoveContribution={()=>handleRemoveContribution(contribution.id)}
                            />
                        ))
                    )}

                    {
                        (!contributions || contributions.length === 0) &&
                        <p className="rounded-2xl border border-dashed border-(--slate) px-5 py-6 text-center text-(--steel)">
                            No contributions yet
                        </p>
                    }
                </section>
            )}

            <section className={cardClass}>
                <Field label="Add a contribution" hint="What did you do, and what difference did it make? Numbers help.">
                    <textarea
                        id="contribution"
                        name="contribution"
                        onChange={(e) =>{
                            setContribution(e.target.value); 
                            setEdited(true);
                        }}
                        value={contribution}
                        className={`${inputClass} min-h-36 resize-y`}
                        placeholder="Cut the report build time from 20 to 5 minutes by caching..."
                        required
                    />
                </Field>
            </section>

            {error && <Notice tone="error">{error}</Notice>}

            <div className="flex justify-end">
                <Button variant="primary" className="w-full sm:w-auto" onClick={()=>handleSubmit()} disabled={isEdit && !edited}>
                    {isEdit? "Save changes": "Add experience"}
                </Button>
            </div>
        </>
    )
}
