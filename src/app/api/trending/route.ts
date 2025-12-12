import { NextResponse } from "next/server";

export async function GET() {
  const trending = [
    { id: "1", title: "Mechanical Engineer – EV Battery Line", company: "Tata EV", city: "Pune" },
    { id: "2", title: "Biotech Associate – Genome Labs", company: "Genome Labs", city: "Hyderabad" },
    { id: "3", title: "O&M Technician – Solar Plant", company: "Adani Green", city: "Jodhpur" },
    { id: "4", title: "Production Operator – iPhone", company: "Foxconn", city: "Hyderabad" },
  ];
  return NextResponse.json(trending);
}
