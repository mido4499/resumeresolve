import { twMerge } from "tailwind-merge";

type buttonProps = {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// Shared look for buttons and button-styled links
export const buttonBase =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium text-(--platinum) bg-(--oxide) transition-colors hover:bg-(--oxide)/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--oxide) disabled:cursor-not-allowed disabled:opacity-60";

// The variants only differ in size; colors are overridden per use with className
export const buttonSizes = {
    primary: "px-7 py-3 text-base",
    secondary: "px-5 py-2.5 text-sm",
};

export default function Button({
    variant= "primary",
    children,
    className = "",
    ...props
}: buttonProps) {
    return (
        <button className={twMerge(buttonBase, buttonSizes[variant], className)} {...props}>
            {children}
        </button>
    )
}
