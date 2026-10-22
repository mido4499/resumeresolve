import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { RETURNING_USER_COOKIE } from "@/lib/returningUser";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Landing from "./components/Landing";
import type { Face, OnboardingNotice } from "./components/onboarding/OnboardingModal";

// Picks which onboarding card to open based on where the visitor is:
// new visitor -> intro steps, unverified -> verify email, verified -> complete account, done -> dashboard.
// ?verify= is set by the email verification link (see app/api/auth/verify).
export default async function Home({ searchParams }: PageProps<"/">) {
    const { verify, reset } = await searchParams;
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
    } else if (reset === "success") {
        startFace = "signIn";
        notice = { tone: "success", text: "Your password has been reset. Sign in with your new password." };
    } else if (reset === "invalid") {
        startFace = "forgotPassword";
        notice = { tone: "error", text: "That reset link is invalid or has expired. Enter your email to get a new one." };
    }

    // Returning visitors on this device skip the intro; anything that needs their attention
    // (a verification result, a pending verify or complete-account step) still opens it
    const returning = (await cookies()).has(RETURNING_USER_COOKIE);
    const autoOpen = !returning || startFace !== "step1";

    return <Landing startFace={startFace} notice={notice} autoOpen={autoOpen} />;
}
