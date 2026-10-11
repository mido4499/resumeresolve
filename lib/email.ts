const APP_NAME = "Resume Resolve";
// onboarding@resend.dev only delivers to your own Resend account's address; set EMAIL_FROM to an
// address on a domain verified in Resend to email other people
const FROM = process.env.EMAIL_FROM ?? `${APP_NAME} <onboarding@resend.dev>`;

// Sends through Resend's REST API. Without RESEND_API_KEY (local development) the link is printed instead.
export async function sendVerificationEmail(to: string, name: string, link: string) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[email] RESEND_API_KEY not set. Verification link for ${to}: ${link}`);
        return;
    }

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: FROM,
            to,
            subject: `Verify your email for ${APP_NAME}`,
            text: `Hi ${name},\n\nConfirm your email by opening this link (it expires in 24 hours):\n${link}\n\nThis is the email that will appear on your resumes.\n\nIf you didn't create an account, you can ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #232B30;">
                    <h2 style="color: #0F1417;">Welcome to ${APP_NAME}, ${escapeHtml(name)}</h2>
                    <p>Confirm your email to finish creating your account. This is the email that will appear on your resumes.</p>
                    <p style="margin: 28px 0;">
                        <a href="${link}" style="background: #3F7CAC; color: #F2F4F5; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">Verify email</a>
                    </p>
                    <p style="color: #4B565C; font-size: 13px;">The link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
                </div>`,
        }),
    });

    if (!res.ok) {
        throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
    }
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
