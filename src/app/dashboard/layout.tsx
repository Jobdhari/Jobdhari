// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex pt-16">
      {/* ✅ Sidebar REMOVED from here */}
      <main className="ml-64 p-10 w-full min-h-screen bg-surface-1">
        {children}
      </main>
    </div>
  );
}
