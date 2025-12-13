// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {/* Left */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Find Your Next
              <br />
              Opportunity
            </h1>

            <p className="mt-4 max-w-xl text-gray-600">
              Explore thousands of job openings carefully curated to match your
              growth path. Your career deserves the right direction.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Search Jobs
              </Link>

              <Link
                href="/login/employer"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                I&apos;m Hiring / Post a Job
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center md:justify-end">
            <div className="h-72 w-full max-w-xl rounded-[999px] border bg-gray-50 flex items-center justify-center text-gray-400">
              JobDhari Hero
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
