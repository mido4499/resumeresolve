import { auth } from '@/auth';
import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';

// To get an experience
export async function GET(
    request: Request,
    { params }: {params: Promise<{experienceId: string}>}
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const { experienceId } = await params;

    const experience = await prisma.experience.findUnique({
        where: {
            id: experienceId,
        },
    })

    if (!experience) {
        return NextResponse.json({error: "Experience not found"}, {status: 404});
    }
    if (experience.userId !== session.user.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    return Response.json(experience);
}

// To edit an experience
export async function PATCH(
    request: Request,
    { params }: {params: Promise<{experienceId: string}>}
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const { experienceId } = await params;

    const original = await prisma.experience.findUnique({
        where: {
            id: experienceId,
        }
    })
    if (!original) {
        return NextResponse.json({error: "Experience not found"}, {status: 404});
    }
    if (original.userId !== session.user.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const body = await request.json();
    const { role, place, startDate, endDate } = body;

    // null is an explicit "ongoing"; a missing or blank end date is a mistake
    if (endDate !== null && !endDate) {
        return NextResponse.json({error: "Add an end date, or mark the experience as ongoing."}, {status: 400});
    }

    const experience = await prisma.experience.update({
        where: {
            id: experienceId,
        },
        data: {
            place: place,
            role: role,
            startDate: new Date(startDate),
            // No end date means it's ongoing (shown as "Present")
            endDate: endDate ? new Date(endDate) : null,
        }
    })

    return Response.json(experience);

}

// To remove an experience
export async function DELETE(
    request: Request,
    { params }: {params: Promise<{experienceId: string}>}
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const { experienceId } = await params;

    const experience = await prisma.experience.findUnique({
        where: {
            id: experienceId,
        }
    })
    if (!experience) {
        return NextResponse.json({error: "Experience not found"}, {status: 404});
    }
    if (experience.userId !== session.user.id) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    // Contributions are removed by the database (onDelete: Cascade)
    await prisma.experience.delete({
        where: {
            id: experienceId,
        }
    });
    return NextResponse.json({status: 200});
}
