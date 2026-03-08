'use client';

import React, { useState } from 'react';
import { Users, BarChart, FileText, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface CourseCardProps {
  id: number;
  code: string;
  name: string;
  students: number;
  description: string;
  onViewStudents: () => void;
  onViewResults: () => void;
  onTakeExam: () => void;
  onSendMaterials: () => void;
}

const MAX_DESCRIPTION_LENGTH = 60;

export default function CourseCard({
  id,
  code,
  name,
  students,
  description,
  onViewStudents,
  onViewResults,
  onTakeExam,
  onSendMaterials,
}: CourseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLongDescription = description.length > MAX_DESCRIPTION_LENGTH;
  const displayText = isExpanded || !isLongDescription 
    ? description 
    : description.slice(0, MAX_DESCRIPTION_LENGTH) + '...';

  return (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              {code}
            </span>
            <h3 className="text-slate-100 font-bold text-lg group-hover:text-indigo-400 transition-colors">{name}</h3>
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {displayText}
            {isLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs transition-colors"
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/[0.05]">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{students}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onViewStudents}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-indigo-500/10 border border-white/[0.05] hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 rounded-xl transition-all duration-300 text-sm font-medium group/btn backdrop-blur-sm"
        >
          <Users className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          Students
        </button>
        <button
          onClick={onViewResults}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.05] hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 rounded-xl transition-all duration-300 text-sm font-medium group/btn backdrop-blur-sm"
        >
          <BarChart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          Results
        </button>
        <button
          onClick={onTakeExam}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-pink-500/10 border border-white/[0.05] hover:border-pink-500/30 text-slate-400 hover:text-pink-300 rounded-xl transition-all duration-300 text-sm font-medium group/btn backdrop-blur-sm"
        >
          <FileText className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          Take Exam
        </button>
        <button
          onClick={onSendMaterials}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-amber-500/10 border border-white/[0.05] hover:border-amber-500/30 text-slate-400 hover:text-amber-300 rounded-xl transition-all duration-300 text-sm font-medium group/btn backdrop-blur-sm"
        >
          <Send className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          Materials
        </button>
      </div>
    </div>
  );
}
