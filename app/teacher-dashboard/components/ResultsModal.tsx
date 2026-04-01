'use client';

import React, { useState, useEffect } from 'react';
import { X, BarChart, Trophy, Loader2 } from 'lucide-react';

interface ResultsModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

interface ExamResult {
  attemptId: number;
  examId: number;
  studentId: number;
  studentName: string;
  examTitle: string;
  score: number;
  examTotalMarks: number;
  status: string;
}

export default function ResultsModal({ courseId, courseName, onClose }: ResultsModalProps) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<{id: number; title: string; totalMarks: number}[]>([]);
  const [selectedExam, setSelectedExam] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/examResults/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.attempts || []);
          setExams(data.exams || []);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [courseId]);

  const filteredResults = selectedExam === 'all' 
    ? results 
    : results.filter(r => r.examId === selectedExam);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (percentage >= 60) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) return { color: 'from-yellow-400 to-yellow-600', text: 'A' };
    if (percentage >= 80) return { color: 'from-emerald-400 to-emerald-600', text: 'B' };
    if (percentage >= 70) return { color: 'from-blue-400 to-blue-600', text: 'C' };
    if (percentage >= 60) return { color: 'from-orange-400 to-orange-600', text: 'D' };
    return { color: 'from-red-400 to-red-600', text: 'F' };
  };

  const calculatePercentage = (score: number, totalMarks: number) => {
    return totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  };

  const topScorer = filteredResults.length > 0 
    ? filteredResults.reduce((top, current) => {
        const topPct = calculatePercentage(top.score, top.examTotalMarks);
        const currentPct = calculatePercentage(current.score, current.examTotalMarks);
        return currentPct > topPct ? current : top;
      })
    : null;

  const classAverage = filteredResults.length > 0
    ? filteredResults.reduce((sum, r) => sum + calculatePercentage(r.score, r.examTotalMarks), 0) / filteredResults.length
    : 0;

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

        {/* Exam Filter */}
        {exams.length > 1 && (
          <div className="px-6 py-3 border-b border-slate-800">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Results Table */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found</p>
              <p className="text-sm mt-1">Students haven't taken any exams yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-800">
                  <th className="pb-4 font-medium pl-4">Student</th>
                  <th className="pb-4 font-medium text-center">Exam</th>
                  <th className="pb-4 font-medium text-center">Score</th>
                  <th className="pb-4 font-medium text-center">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => {
                  const percentage = calculatePercentage(result.score, result.examTotalMarks);
                  return (
                    <tr
                      key={result.attemptId}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 pl-4 text-slate-200 font-medium">{result.studentName}</td>
                      <td className="py-4 text-center text-slate-400 text-sm">{result.examTitle}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${getGradeColor(percentage)}`}>
                          {result.score}/{result.examTotalMarks}
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getGradeColor(percentage)}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && filteredResults.length > 0 && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Trophy className="w-4 h-4" />
                <span>Top Scorer: {topScorer?.studentName || 'N/A'}</span>
              </div>
              <div className="text-sm text-slate-400">
                Class Average: <span className="text-indigo-400 font-semibold">{classAverage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
