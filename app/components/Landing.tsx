"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import OnboardingModal, { type Face, type OnboardingNotice } from "./onboarding/OnboardingModal";

// The onboarding modal opens by itself for new visitors (autoOpen); the buttons open it at sign up / sign in
export default function Landing({ startFace, notice, autoOpen }: { startFace: Face, notice?: OnboardingNotice, autoOpen: boolean }) {
    const [openAt, setOpenAt] = useState<Face | null>(autoOpen ? startFace : null);
    const [currentNotice, setCurrentNotice] = useState(notice);

    function close() {
        setOpenAt(null);
        setCurrentNotice(undefined);
    }

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center bg-(--metal) px-6 py-20 text-center">

            {/* The logo is the page heading; its alt text gives the h1 its name */}
            <h1>
                <Image src="/logo.png" alt="Role Diary" width={1072} height={786} preload sizes="(min-width: 640px) 320px, 224px" className="h-auto w-56 sm:w-80" />
            </h1>

            <p className="mt-8 text-2xl text-balance text-(--steel) sm:text-3xl">
                Make every experience count
            </p>

            <div className="mt-10 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
                <Button variant="primary" className="px-8" onClick={() => setOpenAt("signUp")}>
                    Sign up
                </Button>

                <Button variant="primary" className="bg-transparent px-8 ring-1 ring-(--slate) hover:bg-(--charcoal)" onClick={() => setOpenAt("signIn")}>
                    Sign in
                </Button>
            </div>

            <footer className="absolute inset-x-0 bottom-6 flex justify-center gap-6 text-sm">
                <Link href="/terms" className="text-(--steel) hover:text-(--platinum)">Terms of Service</Link>
                <Link href="/privacy" className="text-(--steel) hover:text-(--platinum)">Privacy Policy</Link>
            </footer>

            <OnboardingModal
                isOpen={openAt !== null}
                onClose={close}
                startFace={openAt ?? "welcome"}
                notice={currentNotice}
            />
        </main>
    )
}
