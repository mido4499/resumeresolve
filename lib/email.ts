const APP_NAME = "Resume Resolve";
// onboarding@resend.dev only delivers to your own Resend account's address; set EMAIL_FROM to an
// address on a domain verified in Resend to email other people
const FROM = process.env.EMAIL_FROM ?? `${APP_NAME} <onboarding@resend.dev>`;

type ActionEmail = {
    to: string;
    subject: string;
    heading: string;
    intro: string;
    buttonLabel: string;
    link: string;
    footer: string;
};

// Sends a one-button email through Resend's REST API.
// Without RESEND_API_KEY (local development) the link is printed instead.
async function sendActionEmail({ to, subject, heading, intro, buttonLabel, link, footer }: ActionEmail) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[email] RESEND_API_KEY not set. "${subject}" link for ${to}: ${link}`);
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
            subject,
            text: `${heading}\n\n${intro}\n\n${buttonLabel}: ${link}\n\n${footer}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #232B30;">
                    <h2 style="color: #0F1417;">${escapeHtml(heading)}</h2>
                    <p>${escapeHtml(intro)}</p>
                    <p style="margin: 28px 0;">
                        <a href="${link}" style="background: #3F7CAC; color: #F2F4F5; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">${escapeHtml(buttonLabel)}</a>
                    </p>
                    <p style="color: #4B565C; font-size: 13px;">${escapeHtml(footer)}</p>
                </div>`,
        }),
    });

    if (!res.ok) {
        throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
    }
}

export function sendVerificationEmail(to: string, name: string, link: string) {
    return sendActionEmail({
        to,
        subject: `Verify your email for ${APP_NAME}`,
        heading: `Welcome to ${APP_NAME}, ${name}`,
        intro: "Confirm your email to finish creating your account. This is the email that will appear on your resumes.",
        buttonLabel: "Verify email",
        link,
        footer: "The link expires in 24 hours. If you didn't create an account, you can ignore this email.",
    });
}

export function sendPasswordResetEmail(to: string, name: string, link: string) {
    return sendActionEmail({
        to,
        subject: `Reset your ${APP_NAME} password`,
        heading: `Reset your password, ${name}`,
        intro: "We received a request to reset the password for your account. Choose a new one with the button below.",
        buttonLabel: "Reset password",
        link,
        footer: "The link expires in 1 hour and works once. If you didn't ask to reset your password, ignore this email; your password won't change.",
    });
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
