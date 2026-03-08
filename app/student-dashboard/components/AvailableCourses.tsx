'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Clock, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

import type { Course } from './type';

interface AvailableCoursesProps {
  studentId: number;
  onRequestSent?: (change: number) => void;
}

export default function AvailableCourses({ studentId, onRequestSent }: AvailableCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`/api/student/availableCourse/${studentId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, [studentId]);

 const handleJoinRequest = async (courseId: number) => {
  try {
    const res = await fetch('/api/student/enrollmentsRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courseId
      })
    });

    if (!res.ok) {
      throw new Error("Failed to send request");
    }

    setCourses(prev => prev.filter(c => c.id !== courseId));
    
    if (onRequestSent) {
      onRequestSent(1);
    }

  } catch (error) {
    console.error("Join request failed", error);
  }
};

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
     
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search courses by name, code, or teacher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/3 backdrop-blur-xl border border-white/8 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="group bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-1"
          >
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {course.code}
                  </span>
                </div>
                <h3 className="text-slate-100 font-bold text-lg group-hover:text-indigo-400 transition-colors">
                  {course.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/[0.05]">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{course.students}</span>
              </div>
            </div>

           
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-white/3 rounded-lg border border-white/5">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {course.teacherName.charAt(0)}
              </div>
              <span className="text-slate-300 text-sm font-medium">{course.teacherName}</span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              {course.description.length > 100
                ? course.description.slice(0, 100) + '...'
                : course.description}
            </p>

           
            {course.enrollmentStatus === 'PENDING' ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-semibold cursor-not-allowed"
              >
                <Clock className="w-4 h-4" />
                Request Pending
              </button>
            ) : course.enrollmentStatus === 'APPROVED' ? (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-semibold cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                Already Enrolled
              </button>
            ) : (
              <button
                onClick={() => handleJoinRequest(course.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500/20 to-indigo-500/20 hover:from-indigo-500/30 hover:to-indigo-500/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
              >
                <UserPlus className="w-4 h-4" />
                Ask to Join
              </button>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-lg">No courses found</p>
          <p className="text-slate-500 text-sm">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
