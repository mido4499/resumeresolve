import DashboardSidebar from "../components/DashboardSideBar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({children}: {children: React.ReactNode}){
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/');
    }
    // Unverified users are sent back to the landing page, which shows the verify-email step
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true },
    });
    if (!user?.emailVerified) {
        redirect('/');
    }

    return (
        <div className="min-h-screen">
            <DashboardSidebar/>
            {/* Clears the phone top bar (pt-14) and the desktop sidebar (md:pl-64) */}
            <main className="pt-14 md:pt-0 md:pl-64">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
                    {children}
                </div>
            </main>
        </div>
    )
}
