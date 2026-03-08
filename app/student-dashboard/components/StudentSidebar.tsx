'use client';

import React from 'react';
import { BookOpen, BookMarked, FileText, GraduationCap, Clock } from 'lucide-react';

interface StudentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount?: number;
}

const menuItems = [
  { id: 'my-courses', icon: BookOpen, label: 'My Courses' },
  { id: 'available-courses', icon: BookMarked, label: 'Available Courses' },
  { id: 'pending-requests', icon: Clock, label: 'Pending Requests' },
  { id: 'exams', icon: FileText, label: 'Exams' },
];

export default function StudentSidebar({ activeTab, setActiveTab, pendingCount = 0 }: StudentSidebarProps) {
  return (
    <aside className="w-72 bg-white/2 backdrop-blur-xl border-r border-white/5 flex flex-col h-[calc(100vh-64px)] sticky top-16">
      {/* Logo */}
      <div className="pt-8 pl-8 pr-8 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-slate-100 font-bold text-lg tracking-tight">EduMaster</span>
        </div>
        <p className="pt-4 text-slate-400 text-sm">Student Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
              activeTab === item.id
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl" />
            )}
            <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium relative z-10">{item.label}</span>

            {/* Pending requests badge */}
            {item.id === 'pending-requests' && pendingCount > 0 && (
              <span className="absolute right-3 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                {pendingCount}
              </span>
            )}

            {activeTab === item.id && (
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
