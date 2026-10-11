"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Button from "../Button";
import { Field, formButtonClass, inputClass, Notice } from "../FormFields";

type AuthFormProps = {
    mode: "signUp" | "signIn";
    onAuthenticated: () => void;
    onSwitch: () => void;
    onBack: () => void;
    notice?: { tone: "success" | "error", text: string };
};

export default function AuthForm({ mode, onAuthenticated, onSwitch, onBack, notice }: AuthFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const isSignUp = mode === "signUp";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (isSignUp) {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error);
                setLoading(false);
                return;
            }
        }

        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
            setError("Invalid email or password.");
            setLoading(false);
            return;
        }
        onAuthenticated();
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 pr-8">
                <span className="text-xs font-semibold tracking-[0.2em] text-(--oxide)">
                    {isSignUp ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
                </span>
                <h2 className="text-3xl font-semibold text-(--platinum)">{isSignUp ? "Sign up" : "Sign in"}</h2>
            </div>

            {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

            {isSignUp && (
                <Field label="Name">
                    <input className={inputClass} value={name} onChange={e => setName(e.target.value)} autoComplete="name" required autoFocus />
                </Field>
            )}

            <Field
                label="Email"
                hint={isSignUp && <>This is the email that will appear on your resume, so use one you&apos;re happy for employers to see. We&apos;ll send you a link to verify it.</>}
            >
                <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required autoFocus={!isSignUp} />
            </Field>

            <Field label="Password" hint={isSignUp && "At least 8 characters."}>
                <div className="relative">
                    <input
                        className={`${inputClass} pr-12`}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        minLength={isSignUp ? 8 : undefined}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-(--steel) hover:text-(--platinum)"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                            {!showPassword && <path d="M4 4l16 16" />}
                        </svg>
                    </button>
                </div>
            </Field>

            {error && <p className="text-sm text-(--rust)">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading} className={`mt-1 w-full ${formButtonClass}`}>
                {isSignUp
                    ? (loading ? "Creating your account..." : "Create account")
                    : (loading ? "Signing you in..." : "Sign in")}
            </Button>

            <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={onBack} className="text-(--steel) hover:text-(--platinum)">&larr; How it works</button>
                <button type="button" onClick={onSwitch} className="text-(--oxide) hover:underline">
                    {isSignUp ? "I already have an account" : "Create an account"}
                </button>
            </div>
        </form>
    );
}
