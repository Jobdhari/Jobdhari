"use client";

import { useEffect, useState } from "react";

const HiringNewsTicker = () => {
  const [news, setNews] = useState([
    "Hiring News: TCS expanding in Hyderabad 🚀",
    "Infosys announces 500 new openings in Vizag 💼",
    "JobDhari crosses 1000 active listings 🎯",
  ]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % news.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [news.length]);

  return (
    <div className="bg-amber-100 text-amber-900 px-4 py-2 text-sm font-medium rounded-md shadow-sm overflow-hidden">
      <span>{news[index]}</span>
    </div>
  );
};

export default HiringNewsTicker;
