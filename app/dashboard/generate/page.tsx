import GenerateForm from "@/app/components/GenerateForm";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isEducationComplete } from "@/lib/education";
import { templates } from "@/lib/templates";
import { redirect } from "next/navigation";

export default async function GeneratePage(){
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/');
    }

    const [experienceCount, education] = await Promise.all([
        prisma.experience.count({ where: { userId: session.user.id } }),
        prisma.education.findMany({
            where: { userId: session.user.id },
            select: { school: true, major: true, graduationDate: true },
        }),
    ]);

    return (
        <GenerateForm
            templates={Object.values(templates).map(({ id, name }) => ({ id, name }))}
            hasExperiences={experienceCount > 0}
            hasEducation={education.some(isEducationComplete)}
        />
    )
}
