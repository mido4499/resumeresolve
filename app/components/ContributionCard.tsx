import Image from "next/image";

// "2026-10-10" -> "Oct 10, 2026"
function formatDay(day: string) {
    const date = new Date(`${day}T00:00:00Z`);
    return isNaN(date.getTime())
        ? day
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default function ContributionCard({text, createdAt, onRemoveContribution}: {text: string, createdAt: string, onRemoveContribution: ()=>void}) {
    return (
        <div className="flex gap-4 rounded-2xl border border-(--charcoal) bg-(--charcoal)/40 p-4">
            <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-(--oxide)" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-(--steel) uppercase">{formatDay(createdAt)}</span>
                <p className="leading-relaxed whitespace-pre-wrap text-(--chrome)">{text}</p>
            </div>
            <button
                type="button"
                onClick={()=>onRemoveContribution()}
                aria-label="Remove contribution"
                className="self-start rounded-lg p-1.5 opacity-70 transition hover:bg-(--rust)/15 hover:opacity-100"
            >
                <Image src={"/removeicon.svg"} alt="" width={18} height={18}/>
            </button>
        </div>
    )
}
