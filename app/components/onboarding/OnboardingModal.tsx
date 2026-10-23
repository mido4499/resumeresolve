"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../Modal";
import { rememberThisDevice } from "@/lib/returningUser";
import AuthForm from "./AuthForm";
import CardFace from "./CardFace";
import CompleteAccount from "./CompleteAccount";
import FlipCard, { FLIP_MS, isBackVisible } from "./FlipCard";
import IntroStep from "./IntroStep";
import VerifyEmail from "./VerifyEmail";
import ForgotPassword from "./ForgotPassword";
import Welcome from "./Welcome";

export type Face = "welcome" | "step1" | "step2" | "step3" | "signUp" | "signIn" | "forgotPassword" | "verify" | "complete";
export type OnboardingNotice = { tone: "success" | "error", text: string };

type OnboardingModalProps = {
    isOpen: boolean;
    onClose: () => void;
    startFace: Face;
    notice?: OnboardingNotice;  // shown on the starting card, e.g. after following a verification link
};

export default function OnboardingModal({ isOpen, onClose, startFace, notice }: OnboardingModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl rounded-2xl border-0 bg-transparent p-0 sm:p-0">
            {/* Mounted only while open, so every reopen starts fresh */}
            <OnboardingFlow startFace={startFace} notice={notice} onClose={onClose} />
        </Modal>
    );
}

type CardState = { rotation: number, front: Face | null, back: Face | null };

function OnboardingFlow({ startFace, notice, onClose }: Omit<OnboardingModalProps, "isOpen">) {
    const router = useRouter();
    const [card, setCard] = useState<CardState>({ rotation: 0, front: startFace, back: null });
    const flipping = useRef(false);

    // Puts the next face on the hidden side and turns the card over. Once the flip ends,
    // the old face is unmounted so it stops running (e.g. the verify step's polling).
    function goTo(next: Face, direction: 1 | -1 = 1) {
        if (flipping.current) return;
        flipping.current = true;
        setCard(c => ({
            ...c,
            [isBackVisible(c.rotation) ? "front" : "back"]: next,
            rotation: c.rotation + 180 * direction,
        }));
        setTimeout(() => {
            setCard(c => ({ ...c, [isBackVisible(c.rotation) ? "front" : "back"]: null }));
            flipping.current = false;
        }, FLIP_MS);
    }

    // After signing in or up, continue from wherever this account is in onboarding
    async function continueSignedIn() {
        rememberThisDevice();
        const res = await fetch("/api/account/status");
        const status = await res.json();
        if (!status.verified) goTo("verify");
        else if (!status.onboarded) goTo("complete");
        else router.push("/dashboard");
    }

    function renderFace(face: Face | null) {
        if (!face) return null;
        const startNotice = face === startFace ? notice : undefined;

        let content: React.ReactNode;
        switch (face) {
            case "welcome":
                content = <Welcome onStart={() => goTo("step1")} onSignIn={() => goTo("signIn")} />;
                break;
            case "step1":
            case "step2":
            case "step3": {
                const step = Number(face.at(-1)) - 1;
                content = (
                    <IntroStep
                        step={step}
                        onNext={() => goTo(`step${step + 2}` as Face)}
                        onBack={() => goTo(step === 0 ? "welcome" : `step${step}` as Face, -1)}
                        onSignUp={() => goTo("signUp")}
                        onSignIn={() => goTo("signIn")}
                    />
                );
                break;
            }
            case "signUp":
            case "signIn":
                content = (
                    <AuthForm
                        key={face}
                        mode={face}
                        notice={startNotice}
                        onAuthenticated={continueSignedIn}
                        onSwitch={() => goTo(face === "signUp" ? "signIn" : "signUp")}
                        onBack={() => goTo("step1", -1)}
                        onForgotPassword={() => goTo("forgotPassword")}
                    />
                );
                break;
            case "forgotPassword":
                content = <ForgotPassword notice={startNotice} onBack={() => goTo("signIn", -1)} />;
                break;
            case "verify":
                content = <VerifyEmail notice={startNotice} onVerified={() => goTo("complete")} />;
                break;
            case "complete":
                content = <CompleteAccount onDone={() => router.push("/dashboard")} />;
                break;
        }

        return <CardFace onClose={onClose}>{content}</CardFace>;
    }

    return <FlipCard rotation={card.rotation} front={renderFace(card.front)} back={renderFace(card.back)} />;
}
