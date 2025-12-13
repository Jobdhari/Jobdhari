import "./globals.css";
import type { Metadata } from "next";
import RootShell from "@/components/layout/RootShell";

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
      </body>
    </html>
  );
}
