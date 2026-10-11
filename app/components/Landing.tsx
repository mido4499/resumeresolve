"use client";
import { useState } from "react";
import Button from "./Button";
import OnboardingModal, { type Face, type OnboardingNotice } from "./onboarding/OnboardingModal";

// The onboarding modal opens by itself on arrival; the buttons reopen it at sign up / sign in
export default function Landing({ startFace, notice }: { startFace: Face, notice?: OnboardingNotice }) {
    const [openAt, setOpenAt] = useState<Face | null>(startFace);
    const [currentNotice, setCurrentNotice] = useState(notice);

    function close() {
        setOpenAt(null);
        setCurrentNotice(undefined);
    }

    return (
        <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-(--metal) px-6 py-20 text-center">
            {/* Decorative accent glow and a faint grid that fades out toward the edges */}
            <div aria-hidden className="absolute -top-48 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-(--oxide)/25 blur-[120px]" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(75_86_92/0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgb(75_86_92/0.18)_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_center,black_25%,transparent_70%)]" />

            <h1 className="bg-linear-to-b from-(--platinum) to-(--steel) bg-clip-text pb-2 text-6xl font-semibold tracking-tight text-transparent sm:text-8xl md:text-9xl">
                SiteName
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-(--chrome) sm:text-xl">
                This website helps you achieve all your dreams. With SiteName, you will have an advantage in all of your fields, and your employees will thank you greatly. They might even bow to you.. yeah, that’s how cool we are!
            </p>

            <div className="mt-12 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
                <Button variant="primary" className="px-9 py-3.5 text-lg shadow-[0_10px_40px_-10px_rgba(63,124,172,0.8)]" onClick={() => setOpenAt("signUp")}>
                    Sign up
                </Button>

                <Button variant="primary" className="bg-transparent px-9 py-3.5 text-lg ring-1 ring-(--slate) hover:bg-(--charcoal)" onClick={() => setOpenAt("signIn")}>
                    Sign in
                </Button>
            </div>

            <OnboardingModal
                isOpen={openAt !== null}
                onClose={close}
                startFace={openAt ?? "step1"}
                notice={currentNotice}
            />
        </main>
    )
}
