import { auth } from '@/auth';
import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';

// To add a contribution to an experience
export async function POST(
    request: Request,
    { params }: {params: Promise<{experienceId: string}>}
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    const { experienceId } = await params;

    const experience = await prisma.experience.findUnique({where: {id: experienceId}});

    if (experience) {
        if (experience?.userId !== session.user.id) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
    }else{
        return new Response("Exprience not found", {status: 404})
    }

    const body = await request.json();
    const { entry } = body;

    const contribution = await prisma.contribution.create({
        data: {
            experienceId: experienceId,
            entry: entry,
        },
    })

    return Response.json(contribution);
}

// Get all contributions for one experience
export async function GET(
    request: Request,
    { params }: {params: Promise<{experienceId: string}>}
) {
    const { experienceId } = await params;
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    } 

    const OriginalExperience = await prisma.experience.findUnique({where: {id: experienceId}});

    if (OriginalExperience) {
        if (OriginalExperience?.userId !== session.user.id) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
    }else{
        return new Response("Exprience not found", {status: 404})
    }

    const contributions = await prisma.contribution.findMany({
        where: {
            experienceId: experienceId,
        }
    })

    return NextResponse.json(contributions, {status: 200});
}