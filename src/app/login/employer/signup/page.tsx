"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployerSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    agreeTerms: false,
  });

  // ✅ FIXED handleChange with proper typing
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    const checked =
      (target as HTMLInputElement).type === "checkbox"
        ? (target as HTMLInputElement).checked
        : false;

    setFormData({
      ...formData,
      [name]: (target as HTMLInputElement).type === "checkbox" ? checked : value,
    });
  };

  // ✅ Simple handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Employer Signup Data:", formData);
    alert("Signup successful!");
    router.push("/employer/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-orange-600 text-center">
          Employer Signup
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm">I agree to the Terms & Conditions</label>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
