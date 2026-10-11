import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import AddExperienceForm from "@/app/components/AddExperienceForm";


export default async function ViewExperiencePage({params}: {params: Promise<{experienceId: string}>}){
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/');
    }

    const { experienceId } = await params;
    const experience = await prisma.experience.findFirst({
        where: {
            id: experienceId,
            userId: session.user.id,
        }
    })
    if (!experience) {
        notFound();
    }

    const contributions = await prisma.contribution.findMany({
        where: {
            experienceId: experienceId,
        },
        orderBy: { createdAt: "desc" },
    });


    return <AddExperienceForm experience={experience} contributions={contributions}/>;
}
