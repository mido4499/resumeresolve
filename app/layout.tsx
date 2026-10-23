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
  // Browsers that support SVG icons use favicon.svg; the rest fall back to favicon.ico.
  // favicon.ico and apple-touch-icon.png are rendered from favicon.svg, so regenerate them when it changes.
  // Bump ?v= after changing an icon so browsers don't keep showing their cached copy.
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png?v=2",
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
