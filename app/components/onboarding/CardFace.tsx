// Shared frame for every onboarding card: gradient edge, soft accent glow, close button
export default function CardFace({ onClose, children }: { onClose: () => void, children: React.ReactNode }) {
    return (
        <div className="rounded-3xl bg-linear-to-br from-(--oxide) via-(--slate)/50 to-(--charcoal) p-px shadow-[0_40px_120px_-40px_rgba(63,124,172,0.6)]">
            <div className="relative max-h-[85vh] overflow-x-hidden overflow-y-auto rounded-[calc(1.5rem-1px)] bg-(--metal) px-7 py-8 text-left sm:px-10 sm:py-10">
                <div aria-hidden className="pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full bg-(--oxide)/20 blur-3xl" />
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-5 z-10 text-3xl leading-none text-(--steel) transition-colors hover:text-(--platinum)"
                >
                    &times;
                </button>
                <div className="relative">{children}</div>
            </div>
        </div>
    );
}

export function IconTile({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--oxide)/15 text-(--oxide) ring-1 ring-(--oxide)/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                {children}
            </svg>
        </div>
    );
}
