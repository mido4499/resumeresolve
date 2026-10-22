import type { Metadata } from "next";
import { GENERATIONS_PER_DAY } from "@/lib/rateLimit";
import LegalPage, { ContactEmail, Section, legalLink as link, legalList as list, legalStrong as strong } from "@/app/components/LegalPage";

export const metadata: Metadata = {
    title: "Privacy Policy · Resume Resolve",
    description: "What Resume Resolve collects, why, who it's shared with, and how to export or delete it.",
};

const LAST_UPDATED = "October 21, 2026";

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            lastUpdated={LAST_UPDATED}
            intro={<>
                Resume Resolve lets you keep a diary of your professional experiences and turn it into tailored resumes.
                That means you trust us with personal information. This policy explains what we collect, why, who
                else handles it, and how you stay in control of it.
            </>}
        >
            <Section title="What we collect">
                <ul className={list}>
                    <li><span className={strong}>Account details:</span> your name, email address, and password. We store the password only as a secure hash, never in plain text.</li>
                    <li><span className={strong}>Optional profile details:</span> your phone number and education (school, major, minor, graduation date, GPA, and achievements), if you add them.</li>
                    <li><span className={strong}>Your diary:</span> the experiences (jobs and projects) you add, with their dates, and every diary entry you write.</li>
                    <li><span className={strong}>What you type to generate a resume:</span> the job description and any relevant coursework. We send these to our AI provider to write the resume, but we don&apos;t save them, and we don&apos;t keep a copy of the resume we generate.</li>
                    <li><span className={strong}>Security records:</span> your IP address, used briefly to limit repeated sign-in, sign-up, and password-reset attempts. These records expire within about a day.</li>
                    <li><span className={strong}>Account records:</span> when you created your account, verified your email, and agreed to this policy and our Terms of Service.</li>
                </ul>
                <p>We don&apos;t use advertising or analytics trackers, and we don&apos;t sell your information.</p>
            </Section>

            <Section title="How we use it">
                <ul className={list}>
                    <li>To run your account and save your diary.</li>
                    <li>To generate resumes when you ask. Your name, email, phone number, and education appear on the resume, so choose details you&apos;re happy for employers to see.</li>
                    <li>To send account emails: verifying your email address and resetting your password. We don&apos;t send marketing emails.</li>
                    <li>To keep the service secure and affordable, for example by limiting sign-in attempts and allowing up to {GENERATIONS_PER_DAY} resumes per account every 24 hours.</li>
                </ul>
            </Section>

            <Section title="Who else handles your information">
                <p>We share your information only with the services that run Resume Resolve, and only what each one needs:</p>
                <ul className={list}>
                    <li>
                        <span className={strong}>Anthropic (Claude),</span> our AI provider. When you generate a resume, we send your diary,
                        education, the job description, and your coursework to Anthropic&apos;s Claude API so it can write the resume.
                        Anthropic handles this data under its commercial terms and{" "}
                        <a href="https://www.anthropic.com/legal/privacy" className={link} target="_blank" rel="noopener">privacy policy</a>.
                        Generating a resume is optional: you can keep, edit, and export your diary without ever sending it to
                        Anthropic, and nothing is sent until you press Generate.
                    </li>
                    <li><span className={strong}>Resend,</span> which delivers our account emails. It receives your name and email address.</li>
                    <li><span className={strong}>Neon,</span> which hosts our database in the United States. Everything you save is stored there.</li>
                    <li><span className={strong}>Our hosting provider,</span> which runs the website and may keep standard server logs, such as IP addresses and request times.</li>
                </ul>
                <p>
                    If you use <span className={strong}>Copy prompt</span> or <span className={strong}>Download as .txt</span> on the Generate page,
                    your diary goes wherever you paste or upload it. That service&apos;s own privacy policy then applies.
                </p>
                <p>We may also disclose information if the law requires it.</p>
            </Section>

            <Section title="Cookies">
                <p>We use only the cookies the site needs to work:</p>
                <ul className={list}>
                    <li><span className={strong}>Sign-in cookies,</span> which keep you signed in and protect forms from cross-site attacks.</li>
                    <li><span className={strong}>A &ldquo;returning visitor&rdquo; cookie,</span> which remembers that someone has signed in on this browser so the introduction doesn&apos;t open every visit. It contains no personal information and lasts one year.</li>
                </ul>
            </Section>

            <Section title="Your choices and rights">
                <ul className={list}>
                    <li><span className={strong}>See and edit:</span> you can view and change your diary on the dashboard, and your name, email, phone, education, and password on the Account page.</li>
                    <li><span className={strong}>Export:</span> you can download all of your data as a .json file from the Account page.</li>
                    <li><span className={strong}>Delete:</span> deleting your account on the Account page permanently removes your account, diary, and education from our database straight away.</li>
                </ul>
                <p>Depending on where you live, you may have further rights, such as objecting to how we process your data. Contact us and we&apos;ll help.</p>
            </Section>

            <Section title="How long we keep it">
                <p>
                    We keep your information for as long as you have an account. When you delete your account, we delete
                    your data from our database. Security records expire within about a day. Our service providers may
                    keep their own records, such as email delivery logs, for a limited time under their own policies.
                </p>
            </Section>

            <Section title="Security">
                <p>
                    We use encrypted connections (HTTPS) and store passwords and email-link tokens only as hashes. No system
                    is perfectly secure, so please use a password you don&apos;t use anywhere else.
                </p>
            </Section>

            <Section title="Children">
                <p>Resume Resolve isn&apos;t intended for children under 13, and we don&apos;t knowingly collect their information.</p>
            </Section>

            <Section title="Changes to this policy">
                <p>If we change this policy, we&apos;ll update the date at the top. For significant changes, we&apos;ll let you know by email or on the site.</p>
            </Section>

            <Section title="Contact">
                <p>
                    Questions or requests about your privacy? Email us at <ContactEmail />.
                </p>
            </Section>
        </LegalPage>
    );
}
