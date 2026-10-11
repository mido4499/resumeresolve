import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from 'next/server';

//Add an experience
export async function POST(
    request: Request
) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({error: "unauthorized"}, {status: 401});
    }


    const body = await request.json();
    const { role, place, text, startDate, endDate } = body;

    // null is an explicit "ongoing"; a missing or blank end date is a mistake
    if (endDate !== null && !endDate) {
        return NextResponse.json({error: "Add an end date, or mark the experience as ongoing."}, {status: 400});
    }
    
    const experience = await prisma.experience.create({
        data: {
            place: place,
            role: role,
            // Only create the first contribution if the user wrote one
            ...(text && {
                contributions: {
                    create: {
                        entry: text,
                    },
                },
            }),
            startDate: new Date(startDate),
            // No end date means it's ongoing (shown as "Present")
            endDate: endDate ? new Date(endDate) : null,
            userId: session.user.id as string,
        }
    })

    return Response.json(experience);
}

