'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, TrendingUp, Award, Download, Search, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentResult {
  id: number;
  name: string;
  email: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank: number;
  attempted: number;
  correct: number;
  wrong: number;
  unattempted: number;
}

interface ViewResultsModalProps {
  examId: number;
  examTitle: string;
  onClose: () => void;
}

export default function ViewResultsModal({ examId, examTitle, onClose }: ViewResultsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<StudentResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/examResults/byExam/${examId}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [examId]);

  const filteredResults = results.filter(
    result =>
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageScore = results.length > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0;
  const highestScore = results.length > 0 ? Math.max(...results.map(r => r.percentage)) : 0;
  const lowestScore = results.length > 0 ? Math.min(...results.map(r => r.percentage)) : 0;

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-semibold">
          ?? 1st
        </span>
      );
    if (rank === 2)
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-slate-400/20 to-slate-500/20 border border-slate-400/30 text-slate-300 text-xs font-semibold">
          ?? 2nd
        </span>
      );
    if (rank === 3)
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-amber-700/20 to-orange-700/20 border border-amber-700/30 text-amber-400 text-xs font-semibold">
          ?? 3rd
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium">
        #{rank}
      </span>
    );
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-blue-400';
    if (percentage >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const downloadResults = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 60);
    doc.text(`Exam Results: ${examTitle}`, 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Total Students: ${results.length}   Average: ${averageScore.toFixed(1)}%   Highest: ${highestScore}%   Lowest: ${lowestScore}%`,
      14,
      28
    );

    autoTable(doc, {
      startY: 35,
      head: [['Rank', 'Name', 'Email', 'Score', 'Percentage', 'Correct', 'Wrong', 'Unattempted']],
      body: results.map(r => [
        `#${r.rank}`,
        r.name,
        r.email,
        `${r.score}/${r.totalMarks}`,
        `${r.percentage}%`,
        String(r.correct),
        String(r.wrong),
        String(r.unattempted),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 255] },
    });

    doc.save(`${examTitle.replace(/[^a-z0-9]/gi, '_')}_results.pdf`);
  };

  const renderStats = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      );
    }
    if (results.length === 0) {
      return (
        <div className="text-center py-8 text-slate-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No results found</p>
          <p className="text-sm mt-1">No students have taken this exam yet</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Students</p>
              <p className="text-slate-100 text-2xl font-bold">{results.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Average Score</p>
              <p className="text-slate-100 text-2xl font-bold">{averageScore.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Highest Score</p>
              <p className="text-slate-100 text-2xl font-bold">{highestScore}%</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Lowest Score</p>
              <p className="text-slate-100 text-2xl font-bold">{lowestScore}%</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      );
    }
    if (filteredResults.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No results found</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {filteredResults.map((result) => (
          <div
            key={result.id}
            className="bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-300 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-indigo-300 font-bold text-lg">
                    {result.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="text-slate-100 font-semibold">{result.name}</h4>
                  <p className="text-slate-400 text-sm">{result.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-slate-400 text-xs mb-1">Score</p>
                  <p className={`text-2xl font-bold ${getPercentageColor(result.percentage)}`}>
                    {result.score}/{result.totalMarks}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs mb-1">Percentage</p>
                  <p className={`text-xl font-bold ${getPercentageColor(result.percentage)}`}>
                    {result.percentage}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs mb-1">Rank</p>
                  {getRankBadge(result.rank)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-slate-400 text-xs mb-1">Attempted</p>
                <p className="text-slate-100 font-semibold">{result.attempted}</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400 text-xs mb-1">Correct</p>
                <p className="text-emerald-300 font-semibold">{result.correct}</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 text-xs mb-1">Wrong</p>
                <p className="text-red-300 font-semibold">{result.wrong}</p>
              </div>
              <div className="text-center">
                <p className="text-amber-400 text-xs mb-1">Unattempted</p>
                <p className="text-amber-300 font-semibold">{result.unattempted}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-6xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Exam Results</h2>
              <p className="text-slate-400 text-sm">{examTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="p-6 border-b border-slate-800">
          {renderStats()}
        </div>

        {/* Search and Download */}
        {!loading && results.length > 0 && (
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-purple-500/20"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}

        {/* Results Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderResults()}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="flex-1 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
