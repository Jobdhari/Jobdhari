"use client";

import React from "react";
import { Toaster } from "sonner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans transition-all duration-200">
      <header className="w-full border-b border-gray-200 bg-white/60 backdrop-blur-md fixed top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
          <h1>
            <a
              href="/"
              className="text-xl font-bold text-brand-orange hover:opacity-90 transition"
            >
              JobDhari
            </a>
          </h1>

          <nav className="hidden md:flex space-x-8 text-gray-700">
            <a href="/" className="hover:text-brand-blue">
              Home
            </a>
            <a href="/jobs" className="hover:text-brand-blue">
              Jobs
            </a>
            <a href="/login/candidate" className="hover:text-brand-blue">
              Candidate
            </a>
            <a href="/login/employer" className="hover:text-brand-blue">
              Employer
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <footer className="w-full border-t border-gray-200 mt-10 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} JobDhari. All rights reserved.
      </footer>

      {/* ✅ Global Toaster */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
