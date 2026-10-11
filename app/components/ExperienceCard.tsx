"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";

type ExperienceCardProps = {
    role: string;
    place: string;
    start: string;
    end: string;
    experienceId: string;
}

export default function ExperienceCard({
    role,
    place,
    start,
    end,
    experienceId
}: ExperienceCardProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const router = useRouter();

    async function handleRemove() {
        await fetch(
            `/api/experiences/${experienceId}`,
            {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
        router.refresh();
    }

    return (
        <div className="group flex flex-col gap-5 rounded-3xl border border-(--slate)/40 bg-(--metal) p-6 transition-colors hover:border-(--oxide)/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2">
                <h2 className="text-xl font-semibold text-(--platinum)">{role}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-(--steel)">
                    {place && <span>{place}</span>}
                    <span className="rounded-full bg-(--charcoal) px-3 py-1 text-sm text-(--chrome)">{start} – {end}</span>
                </div>
            </div>
            <div className="flex shrink-0 gap-3">
                <Button variant="secondary" onClick={()=>router.push(`/dashboard/experiences/${experienceId}`)}>View</Button>
                <Button variant="secondary" className="bg-transparent text-(--rust) ring-1 ring-(--rust)/60 hover:bg-(--rust)/15" onClick={()=>setConfirmOpen(true)}>Remove</Button>
            </div>
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={()=>setConfirmOpen(false)}
                onConfirm={()=> handleRemove()}
                title={`Remove ${role}?`}
                description="This deletes the experience and all of its diary entries."
            />
        </div>
    )
}
