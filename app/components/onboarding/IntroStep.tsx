import Button from "../Button";
import { IconTile } from "./CardFace";
import { formButtonClass } from "../FormFields";

const STEPS = [
    {
        title: "Log what you've already done",
        body: "Start by adding the professional experiences you already have, and what you contributed in each one.",
        icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
    },
    {
        title: "Capture every win as it happens",
        body: "Whenever you achieve something new, no matter how small, add it to the experience it belongs to. Keep doing it over months and years. Your diary is saved securely on our servers.",
        note: "An experience can be a job or a project.",
        icon: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5" />,
    },
    {
        title: "Turn your diary into a resume",
        body: "When you're finally applying for a job, generate a resume tailored to it with our template, or export your data and pass it to an AI to build a resume in any template you like.",
        icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    },
];

type IntroStepProps = {
    step: number;               // 0-based
    onNext: () => void;
    onBack: () => void;
    onSignUp: () => void;
    onSignIn: () => void;
};

export default function IntroStep({ step, onNext, onBack, onSignUp, onSignIn }: IntroStepProps) {
    const { title, body, note, icon } = STEPS[step];
    const isLast = step === STEPS.length - 1;
    const number = String(step + 1).padStart(2, "0");

    return (
        <div className="flex flex-col gap-6">
            <span aria-hidden className="pointer-events-none absolute top-7 right-0 text-[8.5rem] leading-none font-black text-(--charcoal) select-none">
                {number}
            </span>

            <div className="relative flex items-center gap-3 pr-8">
                <div className="flex flex-1 gap-1.5">
                    {STEPS.map((_, i) => (
                        <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-(--oxide)" : "bg-(--charcoal)"}`} />
                    ))}
                </div>
                <span className="text-xs font-semibold tracking-[0.2em] text-(--steel)">
                    STEP {number} / {String(STEPS.length).padStart(2, "0")}
                </span>
            </div>

            <div className="relative flex flex-col gap-5 pt-4">
                <IconTile>{icon}</IconTile>
                <h2 className="text-3xl font-semibold text-(--platinum)">{title}</h2>
                <p className="text-lg leading-relaxed text-(--chrome)">{body}</p>
                {note && (
                    <p className="rounded-xl border border-(--oxide)/40 bg-(--oxide)/10 px-4 py-3 text-(--chrome)">
                        <span className="font-semibold text-(--platinum)">Good to know: </span>{note}
                    </p>
                )}
            </div>

            {isLast ? (
                <div className="mt-2 flex flex-col gap-4 border-t border-(--charcoal) pt-6">
                    <p className="text-center text-(--chrome)">Ready to start your diary?</p>
                    <Button type="button" variant="primary" className={`w-full ${formButtonClass}`} onClick={onSignUp}>
                        Sign up
                    </Button>
                    <div className="flex items-center justify-between text-sm">
                        <button type="button" onClick={onBack} className="text-(--steel) hover:text-(--platinum)">&larr; Back</button>
                        <button type="button" onClick={onSignIn} className="text-(--oxide) hover:underline">
                            I already have an account
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-2 flex items-center justify-between">
                    {step > 0
                        ? <button type="button" onClick={onBack} className="text-(--steel) hover:text-(--platinum)">&larr; Back</button>
                        : <span />}
                    <Button type="button" variant="primary" className={formButtonClass} onClick={onNext}>
                        Next &rarr;
                    </Button>
                </div>
            )}
        </div>
    );
}
