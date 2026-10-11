import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/app/components/PageHeader";
import DeleteAccountSection from "@/app/components/account/DeleteAccountSection";
import EducationSection from "@/app/components/account/EducationSection";
import EmailSection from "@/app/components/account/EmailSection";
import PasswordSection from "@/app/components/account/PasswordSection";
import ProfileSection from "@/app/components/account/ProfileSection";
import type { SaveMessage } from "@/app/components/account/Section";

// ?email= is set by the verification link when changing email (see app/api/auth/verify)
const EMAIL_RESULTS: Record<string, SaveMessage> = {
    changed: { tone: "success", text: "Your email has been updated." },
    taken: { tone: "error", text: "That email is now used by another account, so your email wasn't changed." },
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/");
    }
    const { email: emailResult } = await searchParams;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            education: { orderBy: { id: "asc" } },
            verificationTokens: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });
    if (!user) {
        redirect("/");
    }

    const latestToken = user.verificationTokens[0];
    const pendingEmail = latestToken && latestToken.email !== user.email && latestToken.expiresAt > new Date()
        ? latestToken.email
        : null;

    const education = user.education.map(e => ({
        school: e.school ?? "",
        major: e.major ?? "",
        minor: e.minor ?? "",
        graduationDate: e.graduationDate ? e.graduationDate.toISOString().slice(0, 7) : "",
        graduated: e.graduated ?? false,
        gpa: e.gpa ?? "",
        achievements: e.achievements ?? "",
    }));

    return (
        <>
            <PageHeader eyebrow="Settings" title="Account" description="Everything here appears on the resumes you generate." />
            <ProfileSection initialName={user.name} initialPhone={user.phone ?? ""} />
            <EmailSection
                currentEmail={user.email}
                initialPendingEmail={pendingEmail}
                initialMessage={emailResult ? EMAIL_RESULTS[emailResult] : undefined}
            />
            <EducationSection initialEntries={education} />
            {user.password && <PasswordSection />}
            <DeleteAccountSection hasPassword={Boolean(user.password)} />
        </>
    );
}
