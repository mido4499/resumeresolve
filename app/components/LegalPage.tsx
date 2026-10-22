import Link from "next/link";

// Where people can send privacy and legal questions. Shown on the Privacy Policy and Terms of Service.
export const CONTACT_EMAIL = "hamazaahamaza@gmail.com";

export const legalList = "flex list-disc flex-col gap-2 pl-5 marker:text-(--steel)";
export const legalStrong = "font-semibold text-(--platinum)";
export const legalLink = "text-(--oxide) hover:underline";

export function ContactEmail() {
    return <a href={`mailto:${CONTACT_EMAIL}`} className={legalLink}>{CONTACT_EMAIL}</a>;
}

export function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-(--platinum)">{title}</h2>
            <div className="flex flex-col gap-3 leading-relaxed text-(--chrome)">{children}</div>
        </section>
    );
}

type LegalPageProps = {
    title: string;
    lastUpdated: string;
    intro: React.ReactNode;
    children: React.ReactNode;
};

// Shared layout for the Privacy Policy and Terms of Service
export default function LegalPage({ title, lastUpdated, intro, children }: LegalPageProps) {
    return (
        <main className="min-h-screen bg-(--metal) px-4 py-12 sm:py-20">
            <article className="mx-auto flex max-w-2xl flex-col gap-10">
                <header className="flex flex-col gap-3">
                    <Link href="/" className="self-start text-sm text-(--steel) hover:text-(--platinum)">&larr; Resume Resolve</Link>
                    <h1 className="text-3xl font-semibold tracking-tight text-(--platinum) sm:text-4xl">{title}</h1>
                    <p className="text-(--steel)">Last updated {lastUpdated}</p>
                    <p className="leading-relaxed text-(--chrome)">{intro}</p>
                </header>

                {children}

                <footer className="flex gap-6 border-t border-(--charcoal) pt-6 text-sm">
                    <Link href="/terms" className="text-(--steel) hover:text-(--platinum)">Terms of Service</Link>
                    <Link href="/privacy" className="text-(--steel) hover:text-(--platinum)">Privacy Policy</Link>
                </footer>
            </article>
        </main>
    );
}
