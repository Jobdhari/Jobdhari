import "./globals.css";
import type { Metadata } from "next";
import RootShell from "@/components/layout/RootShell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "JobDhari",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootShell>{children}</RootShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
