// src/lib/data/applyWizardOptions.ts

export const TOP_LOCATIONS_IN_INDIA = [
  "Hyderabad",
  "Bengaluru",
  "Chennai",
  "Mumbai",
  "Pune",
  "Delhi NCR",
  "Noida",
  "Gurugram",
  "Kolkata",
  "Ahmedabad",
  "Remote / Work from home",
];

export const POPULAR_COLLEGES = [
  "JNTU Hyderabad",
  "JNTU Kakinada",
  "JNTU Anantapur",
  "Osmania University",
  "Anna University",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kharagpur",
  "IIM Ahmedabad",
  "IIM Bangalore",
  "IIM Calcutta",
  "BITS Pilani",
  "VIT Vellore",
  "SRM University",
  // you can keep adding over time
];

export const INDUSTRIES_OR_DOMAINS = [
  "IT Services",
  "Product Development",
  "BPO / KPO",
  "Staffing / Recruitment",
  "Manufacturing",
  "Aerospace / Drones",
  "EdTech",
  "FinTech",
  "Healthcare / Pharma",
  "E-commerce",
  "Automotive",
  "Telecom",
  "FMCG",
  "Banking",
  "Consulting",
];

export function filterSuggestions(list: string[], query: string, limit = 8) {
  if (!query.trim()) return list.slice(0, limit);

  const q = query.toLowerCase();

  const startsWithMatches = list.filter((item) =>
    item.toLowerCase().startsWith(q)
  );

  const includesMatches = list.filter(
    (item) =>
      !startsWithMatches.includes(item) && item.toLowerCase().includes(q)
  );

  return [...startsWithMatches, ...includesMatches].slice(0, limit);
}
