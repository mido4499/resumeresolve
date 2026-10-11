"use client";
import { useEffect, useEffectEvent, useState } from "react";
import { signOut } from "next-auth/react";
import Button from "../Button";
import { IconTile } from "./CardFace";
import { formButtonClass, Notice } from "../FormFields";

const POLL_MS = 4000;
const RESEND_COOLDOWN_S = 60;

type VerifyEmailProps = {
    onVerified: () => void;
    notice?: { tone: "success" | "error", text: string };
};

// Waits for the user to click the link in their email. Polls the account status (and re-checks
// when the tab regains focus), then moves on by itself.
export default function VerifyEmail({ onVerified, notice }: VerifyEmailProps) {
    const [email, setEmail] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [message, setMessage] = useState<{ tone: "success" | "error", text: string } | undefined>(notice);

    const handleVerified = useEffectEvent(onVerified);

    useEffect(() => {
        let done = false;
        async function check() {
            if (done) return;
            const res = await fetch("/api/account/status");
            if (!res.ok || done) return;
            const status = await res.json();
            setEmail(status.email);
            if (status.verified) {
                done = true;
                handleVerified();
            }
        }
        function onVisible() {
            if (document.visibilityState === "visible") check();
        }

        check();
        const interval = setInterval(check, POLL_MS);
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            done = true;
            clearInterval(interval);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    async function resend() {
        setMessage(undefined);
        const res = await fetch("/api/auth/verify/resend", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
            setMessage({ tone: "error", text: data.error });
            return;
        }
        setMessage({ tone: "success", text: "A new link is on its way." });
        setCooldown(RESEND_COOLDOWN_S);
    }

    return (
        <div className="flex flex-col items-center gap-6 py-2 text-center">
            <div className="relative">
                <span aria-hidden className="absolute inset-0 animate-ping rounded-2xl bg-(--oxide)/25 motion-reduce:animate-none" />
                <IconTile><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></IconTile>
            </div>

            <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold tracking-[0.2em] text-(--oxide)">ONE MORE THING</span>
                <h2 className="text-3xl font-semibold text-(--platinum)">Check your inbox</h2>
                <p className="text-lg leading-relaxed text-(--chrome)">
                    We sent a verification link to{" "}
                    {email ? <span className="font-semibold text-(--platinum)">{email}</span> : "your email"}.
                    Open it to continue. This card will move on by itself.
                </p>
            </div>

            {message && <Notice tone={message.tone}>{message.text}</Notice>}

            <div className="flex items-center gap-2 text-sm text-(--steel)" aria-live="polite">
                <span className="h-2 w-2 animate-pulse rounded-full bg-(--oxide) motion-reduce:animate-none" />
                Waiting for verification
            </div>

            <div className="flex w-full flex-col gap-3 border-t border-(--charcoal) pt-6">
                <Button type="button" variant="secondary" className={`w-full bg-transparent ring-1 ring-(--oxide) ${formButtonClass}`} onClick={resend} disabled={cooldown > 0}>
                    {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend the email"}
                </Button>
                <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-(--steel) hover:text-(--platinum)">
                    Wrong email? Start over
                </button>
            </div>
        </div>
    );
}
