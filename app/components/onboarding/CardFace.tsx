// Shared frame for every onboarding card: plain surface, thin border, close button
export default function CardFace({ onClose, children }: { onClose: () => void, children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-(--slate)/60 bg-(--metal)">
            <div className="relative max-h-[85vh] overflow-x-hidden overflow-y-auto px-7 py-8 text-left sm:px-10 sm:py-10">
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
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 shrink-0 text-(--oxide)">
            {children}
        </svg>
    );
}
