// Form building blocks shared by the onboarding cards and the Edit account page

export function Notice({ tone, children }: { tone: "success" | "error", children: React.ReactNode }) {
    const styles = tone === "success"
        ? "border-(--oxide)/50 bg-(--oxide)/10 text-(--chrome)"
        : "border-(--rust)/60 bg-(--rust)/10 text-(--chrome)";
    return <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function Field({ label, hint, children }: { label: string, hint?: React.ReactNode, children: React.ReactNode }) {
    return (
        // The hint sits outside the <label> so it isn't read as part of the field's name
        <div className="flex flex-col gap-1.5">
            <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-[0.14em] text-(--steel) uppercase">{label}</span>
                {children}
            </label>
            {hint && <span className="text-xs text-(--steel)">{hint}</span>}
        </div>
    );
}

export const inputClass =
    "w-full rounded-xl border border-(--slate) bg-(--charcoal) px-4 py-2.5 text-base text-(--platinum) placeholder:text-(--slate) outline-none transition [color-scheme:dark] focus:border-(--oxide) focus:ring-2 focus:ring-(--oxide)/30";

// Overrides for the shared Button so it fits form and card layouts
export const formButtonClass = "px-7 py-3 text-lg hover:bg-(--oxide)/80 disabled:opacity-60";
