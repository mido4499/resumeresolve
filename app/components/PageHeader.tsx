type PageHeaderProps = {
    eyebrow?: string;
    title: string;
    description?: React.ReactNode;
    action?: React.ReactNode;
};

// Title block at the top of every dashboard page
export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
    return (
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
                {eyebrow && <span className="text-xs font-semibold tracking-[0.2em] text-(--oxide) uppercase">{eyebrow}</span>}
                <h1 className="text-3xl font-semibold tracking-tight text-(--platinum) sm:text-4xl">{title}</h1>
                {description && <p className="max-w-xl text-(--steel)">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </header>
    );
}

// Surface used for forms and lists on dashboard pages
export const cardClass = "rounded-3xl border border-(--slate)/40 bg-(--metal) p-6 sm:p-8";
