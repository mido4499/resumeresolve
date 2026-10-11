import { prisma } from "@/lib/prisma";

async function createUser(){
    await prisma.user.create({
        data: {
            name: 'user1',
            email: 'user1@example.com',
        }
    })
}

createUser();

// id = cmtf8xtna0000acjwekh9hhyv
