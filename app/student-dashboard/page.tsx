'use client';

import React, { useState, useEffect } from 'react';
import { StudentSidebar, MyCourses, AvailableCourses, PendingRequests, StudentExams } from './components';
import { BookOpen, BookMarked, FileText, Trophy, Users, Clock } from 'lucide-react';
import { useSession } from "next-auth/react";
import type { ExamAttempt } from './components/type';

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState('my-courses');
  const [pendingCount, setPendingCount] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [totalExamsTaken, setTotalExamsTaken] = useState(0);
  const [avgScore, setAvgScore] = useState('0');
  const { data: session } = useSession();
  const studentId = session?.user?.id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch pending count
        const pendingRes = await fetch('/api/student/pendingRequests');
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setPendingCount(pendingData.length);
        }

        // Fetch enrolled courses count
        const coursesRes = await fetch('/api/student/myCourses');
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setTotalEnrolled(coursesData.length);
        }

        // Fetch exam attempts for stats
        const attemptsRes = await fetch('/api/student/examAttempts');
        if (attemptsRes.ok) {
          const attemptsData: ExamAttempt[] = await attemptsRes.json();
          setTotalExamsTaken(attemptsData.length);
          
          if (attemptsData.length > 0) {
            const totalPercent = attemptsData.reduce((sum, a) => {
              return sum + (a.score / a.totalMarks) * 100;
            }, 0);
            setAvgScore((totalPercent / attemptsData.length).toFixed(1));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  const updatePendingCount = (change: number) => {
    setPendingCount(prev => Math.max(0, prev + change));
    // Also update enrolled count when request is approved
    if (change > 0) {
      setTotalEnrolled(prev => prev);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <StudentSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        pendingCount={pendingCount}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {activeTab === 'my-courses' && 'My Courses'}
              {activeTab === 'available-courses' && 'Available Courses'}
              {activeTab === 'pending-requests' && 'Pending Requests'}
              {activeTab === 'exams' && 'Exams'}
            </h1>
            <p className="text-slate-400">
              {activeTab === 'my-courses' && 'View your enrolled courses and exam history'}
              {activeTab === 'available-courses' && 'Discover and join new courses'}
              {activeTab === 'pending-requests' && 'View and manage your course enrollment requests'}
              {activeTab === 'exams' && 'Track your upcoming and completed exams'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3">
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl px-5 py-3 shadow-sm">
              <span className="text-slate-400 text-sm flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Enrolled
              </span>
              <p className="text-slate-100 font-bold text-xl">{totalEnrolled}</p>
            </div>
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl px-5 py-3 shadow-sm">
              <span className="text-slate-400 text-sm flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Exams Taken
              </span>
              <p className="text-slate-100 font-bold text-xl">{totalExamsTaken}</p>
            </div>
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl px-5 py-3 shadow-sm">
              <span className="text-slate-400 text-sm flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                Avg Score
              </span>
              <p className="text-slate-100 font-bold text-xl">{avgScore}%</p>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-courses' && <MyCourses />}
        {activeTab === 'available-courses' && <AvailableCourses studentId={studentId} onRequestSent={updatePendingCount} />}
        {activeTab === 'pending-requests' && <PendingRequests onRequestCancelled={updatePendingCount} />}
        {activeTab === 'exams' && <StudentExams />}
      </main>
    </div>
  );
}
