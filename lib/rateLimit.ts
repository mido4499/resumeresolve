import { prisma } from "@/lib/prisma";

// Fixed-window rate limits stored in Postgres (the RateLimit table), so they hold across
// serverless instances. Each key counts hits until its window ends, then starts over.

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export type Limit = { key: string, max: number, windowMs: number };
export type LimitResult = { allowed: boolean, count: number, resetAt: Date };

// Counts a hit atomically (safe under concurrent requests) and says whether it's within the limit
export async function hit({ key, max, windowMs }: Limit): Promise<LimitResult> {
    const [row] = await prisma.$queryRaw<{ count: number, resetAt: Date }[]>`
        INSERT INTO "RateLimit" ("key", "count", "resetAt")
        VALUES (${key}, 1, ${new Date(Date.now() + windowMs)})
        ON CONFLICT ("key") DO UPDATE SET
            "count"   = CASE WHEN "RateLimit"."resetAt" <= NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
            "resetAt" = CASE WHEN "RateLimit"."resetAt" <= NOW() THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
        RETURNING "count", "resetAt"`;

    // Occasionally clear out windows that ended a while ago, so the table stays small
    if (Math.random() < 0.01) {
        prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date(Date.now() - DAY) } } }).catch(() => {});
    }

    return { allowed: row.count <= max, count: row.count, resetAt: row.resetAt };
}

// Reads a limit without counting a hit
export async function peek({ key, max }: Limit): Promise<LimitResult> {
    const row = await prisma.rateLimit.findUnique({ where: { key } });
    if (!row || row.resetAt <= new Date()) {
        return { allowed: true, count: 0, resetAt: new Date() };
    }
    return { allowed: row.count < max, count: row.count, resetAt: row.resetAt };
}

// Gives back a hit, e.g. when the action it was counted for failed on our side
export async function refund({ key }: Limit) {
    await prisma.rateLimit.updateMany({ where: { key, count: { gt: 0 } }, data: { count: { decrement: 1 } } });
}

export async function clear({ key }: Limit) {
    await prisma.rateLimit.deleteMany({ where: { key } });
}

// The caller's IP, as reported by the hosting platform's proxy (first x-forwarded-for entry)
export function clientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || request.headers.get("x-real-ip") || "unknown";
}

// "15 minutes", "2 hours": how long until a limit resets, rounded up
export function waitTime(resetAt: Date): string {
    const minutes = Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / MINUTE));
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    const hours = Math.ceil(minutes / 60);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
}

export const GENERATIONS_PER_DAY = 10;

// The limits themselves, in one place
export const limits = {
    // Wrong passwords for one email from one IP; per-IP-and-email so an attacker can't lock a real user out
    signInPerAccount: (ip: string, email: string): Limit => ({ key: `signin:${ip}:${email}`, max: 5, windowMs: 15 * MINUTE }),
    // Wrong passwords from one IP across all emails
    signInPerIp: (ip: string): Limit => ({ key: `signin:${ip}`, max: 30, windowMs: 15 * MINUTE }),
    // Each sign-up sends a verification email
    signUpPerIp: (ip: string): Limit => ({ key: `signup:${ip}`, max: 5, windowMs: HOUR }),
    // On top of the per-account cooldown in lib/passwordReset.ts
    forgotPasswordPerIp: (ip: string): Limit => ({ key: `forgot:${ip}`, max: 10, windowMs: HOUR }),
    // Each generation is a paid Claude API call
    generationsPerUser: (userId: string): Limit => ({ key: `generate:${userId}`, max: GENERATIONS_PER_DAY, windowMs: DAY }),
};
