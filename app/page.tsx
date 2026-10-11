import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Landing from "./components/Landing";
import type { Face, OnboardingNotice } from "./components/onboarding/OnboardingModal";

// Picks which onboarding card to open based on where the visitor is:
// new visitor -> intro steps, unverified -> verify email, verified -> complete account, done -> dashboard.
// ?verify= is set by the email verification link (see app/api/auth/verify).
export default async function Home({ searchParams }: PageProps<"/">) {
    const { verify } = await searchParams;
    const linkFailed = verify === "expired" || verify === "invalid";

    const session = await auth();
    const user = session?.user?.id
        ? await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { emailVerified: true, onboardedAt: true },
        })
        : null;

    let startFace: Face = "step1";
    let notice: OnboardingNotice | undefined;

    if (user) {
        if (!user.emailVerified) {
            startFace = "verify";
            if (linkFailed) notice = { tone: "error", text: "That link is invalid or has expired. Send yourself a new one below." };
        } else if (!user.onboardedAt) {
            startFace = "complete";
        } else {
            redirect("/dashboard");
        }
    } else if (verify === "success") {
        // Link opened in a browser that isn't signed in
        startFace = "signIn";
        notice = { tone: "success", text: "Your email is verified. Sign in to finish setting up your account." };
    } else if (linkFailed) {
        startFace = "signIn";
        notice = { tone: "error", text: "That verification link is invalid or has expired. Sign in to get a new one." };
    }

    return <Landing startFace={startFace} notice={notice} />;
}
