import ExperienceCard from "@/app/components/ExperienceCard";
import PageHeader from "@/app/components/PageHeader";
import { buttonBase, buttonSizes } from "@/app/components/Button";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const monthYear = (date: Date) => date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export default async function ExperiencesPage() {
    const session = await auth();
    // Without this, userId would be undefined and Prisma would return every user's experiences
    if (!session?.user?.id) {
        redirect('/');
    }

    const experiences = await prisma.experience.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: { startDate: "desc" },
    })

    const addLink = (
        <Link href={'/dashboard/add-experience'} className={`${buttonBase} ${buttonSizes.primary}`}>
            + Add experience
        </Link>
    );

    return (
        <>
            <PageHeader
                eyebrow="Your diary"
                title="Experiences"
                description="The jobs and projects you log contributions to."
                action={experiences.length > 0 && addLink}
            />

            {experiences.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-(--slate) px-6 py-14 text-center">
                    <p className="text-lg text-(--platinum)">No experiences yet</p>
                    <p className="max-w-sm text-(--steel)">Add a job or project you&apos;ve worked on, then log what you contributed to it.</p>
                    {addLink}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {experiences.map((experience) => (
                        <ExperienceCard
                            key={experience.id}
                            role={experience.role}
                            place={experience.place}
                            start={monthYear(experience.startDate)}
                            end={experience.endDate ? monthYear(experience.endDate) : "Present"}
                            experienceId={experience.id}
                        />
                    ))}
                </div>
            )}
        </>
    )
}
