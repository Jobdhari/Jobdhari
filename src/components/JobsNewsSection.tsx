"use client";
import React from "react";

export default function JobsNewsSection() {
  const news = [
    {
      title: "Tata to invest ₹15,000 crore in new EV battery plant — 10,000 jobs to open",
      link: "#",
    },
    {
      title: "Hyderabad Pharma City expanding hiring — biotech engineers in demand",
      link: "#",
    },
    {
      title: "Adani Green launches new solar unit — 5,000 technical openings announced",
      link: "#",
    },
    {
      title: "Foxconn to build iPhone unit in Telangana — 25,000 jobs expected by 2026",
      link: "#",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📢 Jobs & Industry Updates</h2>
      <ul className="space-y-3">
        {news.map((item, i) => (
          <li key={i} className="border-b border-gray-200 pb-2">
            <a
              href={item.link}
              className="text-lg font-medium text-brand-orange hover:underline"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
