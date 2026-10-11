"use client";
import type { ExperienceDisplay } from "./AddDiary";
import { inputClass } from "./FormFields";

type SelectProps = {
    experiences: ExperienceDisplay[];
    selectedId: string;
    setSelectedId: (id: string)=>void;
}
export default function Select({experiences, selectedId, setSelectedId}: SelectProps){

    return (
        <div className="relative">
            <select
                value={selectedId}
                onChange={(e)=>setSelectedId(e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none pr-10 ${selectedId ? "" : "text-(--steel)"}`}
            >
                <option value="" disabled>
                    Select an experience
                </option>
                {experiences.map((experience) => (
                    <option
                        key={experience.id}
                        value={experience.id}
                    >
                        {`${experience.role} - ${experience.place}`}
                    </option>
                ))}
            </select>
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-(--steel)">
                <path d="m6 9 6 6 6-6" />
            </svg>
        </div>
    )
}
