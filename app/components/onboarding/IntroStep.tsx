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
        icon: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 pr-8">
                <div className="flex flex-1 gap-1.5">
                    {STEPS.map((_, i) => (
                        <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-(--oxide)" : "bg-(--charcoal)"}`} />
                    ))}
                </div>
                <span className="text-sm text-(--steel)">
                    Step {step + 1} of {STEPS.length}
                </span>
            </div>

            <div className="flex flex-col gap-4 pt-2">
                <IconTile>{icon}</IconTile>
                <h2 className="text-2xl font-semibold text-(--platinum)">{title}</h2>
                <p className="text-lg leading-relaxed text-(--chrome)">{body}</p>
                {note && (
                    <p className="border-l-2 border-(--oxide) pl-4 text-(--chrome)">
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
                    <button type="button" onClick={onBack} className="text-(--steel) hover:text-(--platinum)">&larr; Back</button>
                    <Button type="button" variant="primary" className={formButtonClass} onClick={onNext}>
                        Next &rarr;
                    </Button>
                </div>
            )}
        </div>
    );
}
