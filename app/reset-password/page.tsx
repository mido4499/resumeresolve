import { redirect } from "next/navigation";
import { findValidResetToken } from "@/lib/passwordReset";
import ResetPasswordForm from "@/app/components/ResetPasswordForm";

// Opened from the link in a "Forgot password" email. Bad or expired links go straight back to the
// landing page's forgot-password card, before the user types anything.
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const { token } = await searchParams;
    if (!token || !(await findValidResetToken(token))) {
        redirect("/?reset=invalid");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-(--metal) px-4 py-16">
            <div className="w-full max-w-xl">
                <ResetPasswordForm token={token} />
            </div>
        </main>
    );
}
