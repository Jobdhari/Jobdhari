'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

export default function HeroSearch() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (jobTitle) query.append('q', jobTitle);
    if (location) query.append('loc', location);
    window.location.href = `/jobs?${query.toString()}`;
  };

  return (
    <section className="bg-gradient-to-b from-orange-50 to-white py-20 border-b">
      <div className="max-w-5xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Find Your Next Job on <span className="text-orange-600">JobDhari</span>
        </h1>
        <p className="text-slate-500 mb-10 text-lg">
          Search thousands of opportunities across India — from startups to large enterprises.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white shadow-lg rounded-2xl p-4 max-w-3xl mx-auto border border-slate-200">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="text"
              placeholder="Job title, keyword, or company"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="pl-9 h-12 text-slate-700"
            />
          </div>

          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="text"
              placeholder="City or State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 h-12 text-slate-700"
            />
          </div>

          <Button
            onClick={handleSearch}
            className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-sm transition"
          >
            Find Jobs
          </Button>
        </div>

        <p className="text-sm text-slate-500 mt-6">
          Employers?{' '}
          <a href="/login/employer" className="text-orange-600 hover:underline font-medium">
            Post a Job
          </a>
        </p>
      </div>
    </section>
  );
}
