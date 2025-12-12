import { NextResponse } from "next/server";

export async function GET() {
  const news = [
    { title: "Tata to invest ₹15,000 crore in EV plant — 10,000 jobs" },
    { title: "Hyderabad Pharma City expanding biotech hiring" },
    { title: "Adani Green opens new solar unit — 5,000 openings" },
    { title: "Foxconn iPhone unit Telangana — 25,000 jobs by 2026" },
  ];
  return NextResponse.json(news);
}
