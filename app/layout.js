import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ViewTransitionGuard from "@/components/ViewTransitionGuard";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "HireFlow — AI-Powered Recruitment Platform",
  description: "Manage your entire hiring process from one place. AI-powered candidate matching, job management, and analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <ViewTransitionGuard />
        {children}
      </body>
    </html>
  );
}
