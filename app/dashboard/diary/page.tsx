import AddDiary from "@/app/components/AddDiary";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
export default async function Diary(){
    const session = await auth();
    // Without this, userId would be undefined and Prisma would return every user's experiences
    if (!session?.user?.id) {
        redirect('/');
    }

    const experiences = await prisma.experience.findMany({
        where: {
            userId: session.user.id,
        }
    })

    return (
        <AddDiary experiences={experiences}/>
    )
}
