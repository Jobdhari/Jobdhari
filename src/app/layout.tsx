// src/app/layout.tsx
"use client";

import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Any /login/... route should NOT show the sidebar
  const isLoginPage = pathname.startsWith("/login");

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-surface text-text font-body min-h-screen flex flex-col">
        {/* ✅ Global Navbar */}
        <Navbar />

        {isLoginPage ? (
          <>
            {/* ✅ Login & Auth pages: full width, no sidebar */}
            <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </>
        ) : (
          <>
            {/* ✅ All other pages: Sidebar + content */}
            <div className="flex flex-1">
              <Sidebar />

              <main className="flex-1 md:ml-64 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
          </>
        )}

        {/* 🌟 Optional Footer (if you want it visible on all pages) */}
        {/* <Footer /> */}

        {/* 🔔 Global toast notifications */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
