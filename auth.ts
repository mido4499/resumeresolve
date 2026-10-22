import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { clear, clientIp, hit, limits, peek } from "./lib/rateLimit";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

// Shown to the user as "too many attempts" (AuthForm checks result.code)
class TooManyAttempts extends CredentialsSignin {
    code = "rate_limited";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'}
            },
            async authorize(credentials, request) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("missing credentials");
                    return null;
                }

                // Emails are stored lowercased (see parseEmail)
                const email = String(credentials.email).trim().toLowerCase();

                // Only failed attempts count; a correct password clears this IP's count for the account
                const ip = clientIp(request);
                const perAccount = limits.signInPerAccount(ip, email);
                const perIp = limits.signInPerIp(ip);
                const checks = await Promise.all([peek(perAccount), peek(perIp)]);
                if (checks.some(c => !c.allowed)) throw new TooManyAttempts();

                const recordFailure = () => Promise.all([hit(perAccount), hit(perIp)]);

                const user = await prisma.user.findUnique({
                    where: {email}
                });

                if (!user) {console.log("user not found"); await recordFailure(); return null;}
                if (!user.password) {console.log("User doesn't have a password"); await recordFailure(); return null;}

                const isValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isValid) {console.log("Passwords didn't match"); await recordFailure(); return null;}

                await clear(perAccount);
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