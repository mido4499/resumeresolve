import { auth } from '@/auth';
import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';

// To remove a contribution from an experience
export async function DELETE(
    request: Request,
    { params }: {params: Promise<{experienceId: string, contributionId: string}>}
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const { experienceId, contributionId } = await params;

    try{
        const originalExperience = await prisma.experience.findUnique({
            where: {
                id: experienceId,
            }
        })

        if (!originalExperience|| originalExperience.userId !== session.user.id){
            return NextResponse.json({error: "Unauthorized"}, {status: 400});
        }

        // Scoping by experienceId ensures the contribution belongs to the experience checked above
        const { count } = await prisma.contribution.deleteMany({
            where:{
                id: contributionId,
                experienceId: experienceId,
            }
        })
        if (count === 0) {
            return NextResponse.json({error: "contribution not found"}, {status: 404});
        }

        return NextResponse.json({status: 200});
    }catch{
        return NextResponse.json({error: "contribution not found"}, {status: 404});
    }
    
}