import type { Metadata } from "next";
import Link from "next/link";
import { GENERATIONS_PER_DAY } from "@/lib/rateLimit";
import LegalPage, { ContactEmail, Section, legalLink as link, legalList as list, legalStrong as strong } from "@/app/components/LegalPage";

export const metadata: Metadata = {
    title: "Terms of Service · Resume Resolve",
    description: "The rules for using Resume Resolve, including AI-written resumes, your content, and our responsibilities.",
};

const LAST_UPDATED = "October 21, 2026";

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of Service"
            lastUpdated={LAST_UPDATED}
            intro={<>
                These terms are an agreement between you and Resume Resolve (&ldquo;we&rdquo;, &ldquo;us&rdquo;) about using
                the Resume Resolve website. By creating an account or using the site, you agree to them. If you don&apos;t
                agree, please don&apos;t use Resume Resolve. Our <Link href="/privacy" className={link}>Privacy Policy</Link> explains
                how we handle your information.
            </>}
        >
            <Section title="Who can use Resume Resolve">
                <p>
                    You must be at least 13 years old. If you&apos;re under 18, or under the age of majority where you live,
                    you need permission from a parent or guardian to use Resume Resolve.
                </p>
            </Section>

            <Section title="Your account">
                <ul className={list}>
                    <li>Give accurate information when you sign up, and keep your email address up to date.</li>
                    <li>Keep your password private. You&apos;re responsible for what happens in your account, so tell us right away if you think someone else has accessed it.</li>
                    <li>Accounts are for one person. Don&apos;t share yours or create accounts for other people without their permission.</li>
                </ul>
            </Section>

            <Section title="The service">
                <p>
                    Resume Resolve is currently free. To keep it running, we limit how much it can be used, for example to{" "}
                    {GENERATIONS_PER_DAY} resumes per account every 24 hours. We may change, add, or remove features and
                    limits, or stop offering Resume Resolve altogether. If we ever introduce paid features, we&apos;ll tell you
                    first, and you won&apos;t be charged unless you choose to pay.
                </p>
                <p>
                    We work to keep the site available and your diary safe, but we can&apos;t promise it will always be
                    available, error-free, or never lose data. Use the export on the Account page to keep your own copy of
                    anything important.
                </p>
            </Section>

            <Section title="AI-written resumes">
                <ul className={list}>
                    <li>Resumes are written by artificial intelligence (Anthropic&apos;s Claude) from your diary and the job description you provide. AI can make mistakes: it can leave things out, word them inaccurately, or add details that aren&apos;t in your diary.</li>
                    <li><span className={strong}>Review every resume before you use it.</span> You&apos;re responsible for what you send to employers, and for making sure it&apos;s accurate and truthful.</li>
                    <li>We don&apos;t guarantee any outcome, such as interviews, job offers, or how a resume performs with applicant tracking systems.</li>
                </ul>
            </Section>

            <Section title="Your content">
                <p>
                    You own what you put into Resume Resolve: your diary, profile, education, and the job descriptions you
                    paste in. You give us permission to store, process, and transmit that content, including sending it to
                    the service providers named in our Privacy Policy, only as needed to run Resume Resolve for you. This
                    permission ends when you delete the content or your account.
                </p>
                <p>
                    You also own the resumes you generate. You&apos;re free to edit, use, and share them however you like.
                </p>
                <p>
                    Only add content you have the right to use. Don&apos;t include other people&apos;s personal information
                    without their permission, or confidential information you&apos;re not allowed to share, such as an
                    employer&apos;s trade secrets.
                </p>
            </Section>

            <Section title="Acceptable use">
                <p>When using Resume Resolve, you agree not to:</p>
                <ul className={list}>
                    <li>break the law, or use the site to deceive or defraud anyone, including employers;</li>
                    <li>create accounts in bulk, use automated tools to access the site, or try to get around usage limits;</li>
                    <li>interfere with the site, overload it, probe it for security weaknesses, or access other users&apos; accounts or data;</li>
                    <li>resell or offer Resume Resolve to others as your own service;</li>
                    <li>submit content that is unlawful, harassing, or infringes someone else&apos;s rights.</li>
                </ul>
            </Section>

            <Section title="Other services">
                <p>
                    Resume Resolve relies on third-party services, such as Anthropic for writing resumes. If you copy or
                    download your diary to use with another AI service or tool, that service&apos;s own terms and privacy
                    policy apply, and we&apos;re not responsible for it.
                </p>
            </Section>

            <Section title="Ending your account">
                <p>
                    You can delete your account at any time from the Account page. We may suspend or close your account if
                    you break these terms, if your use puts the site or other users at risk, or if we stop offering Resume
                    Resolve. Where reasonable, we&apos;ll tell you first so you can export your data.
                </p>
            </Section>

            <Section title="Disclaimers">
                <p>
                    Resume Resolve is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the fullest extent the law
                    allows, we make no warranties of any kind, express or implied, including warranties of merchantability,
                    fitness for a particular purpose, accuracy, and non-infringement.
                </p>
            </Section>

            <Section title="Limitation of liability">
                <p>
                    To the fullest extent the law allows, we won&apos;t be liable for any indirect, incidental, special,
                    consequential, or punitive damages, or for lost opportunities, profits, or data, arising from your use
                    of Resume Resolve or any resume it produces. Our total liability for any claim relating to Resume
                    Resolve is limited to the greater of the amount you paid us in the 12 months before the claim, or US$50.
                </p>
                <p>
                    Some places don&apos;t allow these limits, so they may not all apply to you. Nothing in these terms limits
                    rights you have under the law that can&apos;t be waived.
                </p>
            </Section>

            <Section title="Indemnity">
                <p>
                    If someone makes a claim against us because of content you submitted or because you broke these terms,
                    you agree to cover the reasonable costs of that claim, to the extent the law allows.
                </p>
            </Section>

            <Section title="Governing law">
                <p>
                    These terms are governed by the laws of the State of Arizona, USA, without regard to its conflict-of-law
                    rules. Any dispute will be handled in the state or federal courts located in Maricopa County, Arizona,
                    unless the law where you live gives you the right to bring it elsewhere.
                </p>
            </Section>

            <Section title="Changes to these terms">
                <p>
                    We may update these terms. When we do, we&apos;ll change the date at the top, and for significant changes
                    we&apos;ll let you know by email or on the site before they take effect. If you keep using Resume Resolve
                    after the changes take effect, you accept the updated terms. If you don&apos;t accept them, you can delete
                    your account.
                </p>
                <p>
                    If any part of these terms can&apos;t be enforced, the rest still applies. These terms and our Privacy
                    Policy are the whole agreement between you and us about Resume Resolve.
                </p>
            </Section>

            <Section title="Contact">
                <p>
                    Questions about these terms? Email us at <ContactEmail />.
                </p>
            </Section>
        </LegalPage>
    );
}
