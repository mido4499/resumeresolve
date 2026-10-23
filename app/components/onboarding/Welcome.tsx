import Button from "../Button";
import { formButtonClass } from "../FormFields";

type WelcomeProps = {
    onStart: () => void;
    onSignIn: () => void;
};

// First card new visitors see, before the three "how it works" steps
export default function Welcome({ onStart, onSignIn }: WelcomeProps) {
    return (
        <div className="flex flex-col gap-8 py-2">
            <div className="flex flex-col gap-4">
                {/* pr-8 keeps the first line clear of the close button */}
                <p className="pr-8 text-lg font-semibold text-(--oxide)">Role Diary</p>
                <h2 className="text-4xl font-semibold tracking-tight text-balance text-(--platinum) sm:text-5xl">
                    Never write a resume again
                </h2>
                <p className="text-lg leading-relaxed text-(--chrome)">
                    Keep a diary of what you achieve in your jobs and projects. When you apply for a role,
                    turn it into a resume tailored to the job.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <Button type="button" variant="primary" className={`w-full ${formButtonClass}`} onClick={onStart}>
                    See how it works
                </Button>
                <button type="button" onClick={onSignIn} className="self-center text-sm text-(--oxide) hover:underline">
                    I already have an account
                </button>
            </div>
        </div>
    );
}
