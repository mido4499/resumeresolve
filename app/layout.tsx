import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// SIL Open Font License 1.1. The opsz axis lets the browser match letter shapes to the text size.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Role Diary",
  description: "Keep a diary of your professional wins and turn it into a tailored resume.",
  // Browsers that support SVG icons use rolediary-favicon.svg; the rest fall back to favicon.ico.
  // favicon.ico and apple-touch-icon.png are rendered from the SVG.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/rolediary-favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
