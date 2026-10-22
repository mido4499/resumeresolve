"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { rememberThisDevice } from "@/lib/returningUser";
import Image from "next/image";
import { signOut } from "next-auth/react";

function subscribe(){return() => {}}

const links = [
    {href: '/dashboard/diary', label: "Diary", icon: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" />},
    {href: '/dashboard/experiences', label: "Experiences", icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>},
    {href: '/dashboard/generate', label: "Generate", icon: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>},
    {href: '/dashboard/account', label: "Account", icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>},
]

// Fixed sidebar on desktop; on phones a top bar with a menu button that slides the same sidebar in
export default function DashboardSidebar(){
    const pathname = usePathname();
    const mounted = useSyncExternalStore(subscribe, ()=>true, ()=>false);
    const [menuOpen, setMenuOpen] = useState(false);

    // Only signed-in users see the dashboard, so this browser belongs to a returning user
    useEffect(() => { rememberThisDevice(); }, []);

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-(--slate)/40 bg-(--metal)/90 px-4 backdrop-blur md:hidden">
                <span className="text-lg font-semibold tracking-tight text-(--platinum)">My Dashboard</span>
                <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={menuOpen}
                    className="rounded-lg p-2 text-(--chrome) hover:bg-(--charcoal)"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-6 w-6">
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                </button>
            </div>

            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)} aria-hidden />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-8 border-r border-(--slate)/40 bg-(--metal) px-5 py-8 transition-transform duration-300 md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-(--platinum)">My Dashboard</h2>
                    <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="text-2xl leading-none text-(--steel) hover:text-(--platinum) md:hidden">
                        &times;
                    </button>
                </div>

                <nav className="flex flex-col gap-1">
                    {links.map(link => {
                        const active = mounted && pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${active
                                    ? "bg-(--oxide)/15 font-medium text-(--platinum) ring-1 ring-(--oxide)/40"
                                    : "text-(--steel) hover:bg-(--charcoal) hover:text-(--platinum)"}`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${active ? "text-(--oxide)" : ""}`}>
                                    {link.icon}
                                </svg>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={()=>signOut({callbackUrl: '/'})}
                    className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-(--steel) transition-colors hover:bg-(--charcoal) hover:text-(--platinum)"
                >
                    <Image src={"/logouticon.svg"} alt="" width={20} height={20}/>
                    Sign out
                </button>
            </aside>
        </>
    )
}
