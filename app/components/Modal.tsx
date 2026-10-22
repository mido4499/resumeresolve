"use client";

import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

type modalProps = {
    isOpen: boolean;
    onClose: ()=>void;
    children: React.ReactNode;
    className?: string; // overrides for the modal panel
};


export default function Modal({isOpen, onClose, children, className}: modalProps){

    // Close on escape key
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        if (isOpen) document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent background scrolling when window is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden":"";
        return () => {
            document.body.style.overflow = "";
        }
    }, [isOpen]);

    if (!isOpen) return null;
    
    return (
        // Backdrop div
        <div
            className="fixed inset-0 flex z-50 items-center justify-center bg-black/70 px-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            {/**Actual modal */}
            <div
                className={twMerge("w-full max-w-md rounded-2xl border border-(--slate)/60 bg-(--metal) p-6 sm:p-8", className)}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    )
}