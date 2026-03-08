'use client';

import React, { useState } from 'react';
import { Plus, BookOpen, ClipboardList, Calendar, Hash } from 'lucide-react';
import { toast } from "sonner";
export default function CreateCourseForm() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

     const data = await res.json();

    if (res.ok) {
       toast.success("Course created successfully");
       setFormData({ name: "", code: "", description: "" });
    } else {
      setError(data.message);
      toast.error(data.message);
    }
    
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm backdrop-blur-sm";
  const labelClass = "text-sm font-medium text-slate-300 mb-1.5 block";

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="relative">
            <label className={labelClass}>Course Code</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="CS101"
                className={inputClass + " pl-10"}
              />
            </div>
          </div>

        </div>

        <div className="relative">
          <label className={labelClass}>Course Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter course name"
            className={inputClass}
          />
        </div>

        <div className="relative">
          <label className={labelClass}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what students will learn..."
            rows={4}
            className={inputClass + " resize-none"}
          />
        </div>

        <button
          type="submit"
          className="w-full  cursor-pointer bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </button>
      </form>
    </div>
  );
}
