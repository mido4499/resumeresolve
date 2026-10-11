import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'}
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("missing credentials");
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {email: credentials.email as string}
                });

                if (!user) {console.log("user not found"); return null;}
                if (!user.password) {console.log("User doesn't have a password"); return null;}

                const isValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isValid) {console.log("Passwords didn't match"); return null;}

                return user;

            }
        })
    ],
    session: {strategy: 'jwt'},
    callbacks: {
        async signIn({user, account}) {
            if (account?.provider === 'google') {
                await prisma.user.upsert({
                    where: {email: user.email!},
                    update: {},
                    create: {
                        email: user.email!,
                        name: user.name!,
                        image: user.image,
                    }
                })
            }
            return true;
        },
        // This function returns the token with the authorized user's id inside
        // It also handles when the user changes ther display name
        async jwt({token, trigger, session, account}) {
            if (account) {
                const dbUser = await prisma.user.findUnique({
                    where: {email: token.email!}
                })
                if (dbUser) token.id = dbUser.id;
            }

            if (trigger === 'update' && session?.name) {
                token.name = session.name;
            }
            if (trigger === 'update' && session?.email) {
                token.email = session.email;
            }
            return token;
        },
        // This is to expose the user's id inside the token as
        // session.user.id so that the code can use it
        async session({session, token}) {
            session.user.id = token.id as string;
            return session;
        }

    }
})