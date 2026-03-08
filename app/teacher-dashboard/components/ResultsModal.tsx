'use client';

import React from 'react';
import { X, BarChart, Trophy } from 'lucide-react';

interface ResultsModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

const dummyResults = [
  { studentId: 1, name: 'Alice Brown', midTerm: 85, final: 92, assignments: 88, total: 88.3 },
  { studentId: 2, name: 'Bob Smith', midTerm: 72, final: 78, assignments: 80, total: 76.7 },
  { studentId: 3, name: 'Charlie Davis', midTerm: 90, final: 95, assignments: 92, total: 92.3 },
  { studentId: 4, name: 'Diana Miller', midTerm: 68, final: 74, assignments: 70, total: 70.7 },
  { studentId: 5, name: 'Ethan Wilson', midTerm: 78, final: 82, assignments: 85, total: 81.7 },
];

export default function ResultsModal({ courseName, onClose }: ResultsModalProps) {
  const getGradeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  const getGradeBadge = (total: number) => {
    if (total >= 90) return { color: 'from-yellow-400 to-yellow-600', text: 'A' };
    if (total >= 80) return { color: 'from-emerald-400 to-emerald-600', text: 'B' };
    if (total >= 70) return { color: 'from-blue-400 to-blue-600', text: 'C' };
    if (total >= 60) return { color: 'from-orange-400 to-orange-600', text: 'D' };
    return { color: 'from-red-400 to-red-600', text: 'F' };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[70vh] overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <BarChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Course Results</h2>
              <p className="text-slate-400 text-sm">{courseName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Table */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-800">
                <th className="pb-4 font-medium pl-4">Student</th>
                <th className="pb-4 font-medium text-center">Mid Term</th>
                <th className="pb-4 font-medium text-center">Final</th>
                <th className="pb-4 font-medium text-center">Assignments</th>
                <th className="pb-4 font-medium text-center">Total</th>
                <th className="pb-4 font-medium text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {dummyResults.map((result) => {
                const badge = getGradeBadge(result.total);
                return (
                  <tr
                    key={result.studentId}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 pl-4 text-slate-200 font-medium">{result.name}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${getGradeColor(result.midTerm)}`}>
                        {result.midTerm}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${getGradeColor(result.final)}`}>
                        {result.final}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-1 rounded text-sm ${getGradeColor(result.assignments)}`}>
                        {result.assignments}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getGradeColor(result.total)}`}>
                        {result.total.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${badge.color} text-white font-bold text-sm shadow-lg`}>
                        {badge.text}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Trophy className="w-4 h-4" />
              <span>Top Scorer: {dummyResults.sort((a, b) => b.total - a.total)[0].name}</span>
            </div>
            <div className="text-sm text-gray-500">
              Class Average: <span className="text-gray-800 font-semibold">{((dummyResults.reduce((acc, r) => acc + r.total, 0) / dummyResults.length)).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
