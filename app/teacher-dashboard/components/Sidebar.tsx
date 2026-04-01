'use client';

import React from 'react';
import { BookOpen, PlusCircle, User, GraduationCap, ClipboardList } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'my-courses', icon: BookOpen, label: 'My Courses' },
  { id: 'create-course', icon: PlusCircle, label: 'Create Courses' },
  { id: 'pending-requests', icon: ClipboardList, label: 'Pending Requests' },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-72 bg-white/2 backdrop-blur-xl border-r border-white/5  flex flex-col  h-[calc(100vh-64px)] sticky top-16">
      {/* Logo */}
      <div className="pt-8 pl-8 pr-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-slate-100 font-bold text-lg tracking-tight">EduMaster</span>
        </div>
        <p className='pt-4'>Platform For Teacher</p>
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
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl" />
            )}
            <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium relative z-10">{item.label}</span>
            
            {activeTab === item.id && (
              <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
            )}
          </button>
        ))}
      </nav>

    </aside>
  );
}
