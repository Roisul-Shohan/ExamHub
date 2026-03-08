'use client';

import React from 'react';
import { X, Trophy, CheckCircle, XCircle, Clock, Calendar, BarChart, Target, TrendingUp, Award } from 'lucide-react';
import { questions, studentAnswers, examAttempts } from './type';
import type { Exam, ExamAttempt, StudentViewResultModalProps } from './type';


export default function StudentViewResultModal({ exam, attempt, onClose }: StudentViewResultModalProps) {
  const examQuestions = questions.filter(q => q.examId === exam.id);
  const attemptAnswers = studentAnswers.filter(a => a.attemptId === attempt.id);

  const correctCount = attemptAnswers.filter(a => a.isCorrect).length;
  const wrongCount = attemptAnswers.filter(a => !a.isCorrect).length;
  const unanswered = examQuestions.length - attemptAnswers.length;
  const percentage = ((attempt.score / attempt.totalMarks) * 100).toFixed(1);
  const isPassed = parseFloat(percentage) >= 40;

  // Simulated class average (to show average score of all students on the exam)
  const allAttemptsForExam = examAttempts.filter(a => a.examId === exam.id);
  const classAvg = allAttemptsForExam.length > 0
    ? (allAttemptsForExam.reduce((sum, a) => sum + ((a.score / a.totalMarks) * 100), 0) / allAttemptsForExam.length).toFixed(1)
    : '0';

  const getGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30' };
    if (pct >= 80) return { grade: 'A', color: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-500/30' };
    if (pct >= 70) return { grade: 'B+', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/30' };
    if (pct >= 60) return { grade: 'B', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/30' };
    if (pct >= 50) return { grade: 'C', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/30' };
    if (pct >= 40) return { grade: 'D', color: 'text-orange-300', bg: 'bg-orange-500/20 border-orange-500/30' };
    return { grade: 'F', color: 'text-rose-300', bg: 'bg-rose-500/20 border-rose-500/30' };
  };

  const gradeInfo = getGrade(parseFloat(percentage));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isPassed
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20'
                : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/20'
            }`}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Exam Result</h2>
              <p className="text-slate-400 text-sm">{exam.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Big Score Display */}
          <div className={`text-center py-8 rounded-2xl border-2 ${
            isPassed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
          }`}>
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 border-4 ${
              isPassed
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-rose-500/10 border-rose-500/40'
            }`}>
              <span className={`text-4xl font-extrabold ${isPassed ? 'text-emerald-300' : 'text-rose-300'}`}>
                {percentage}%
              </span>
            </div>
            <p className="text-slate-200 text-lg font-semibold mb-1">{attempt.score} / {attempt.totalMarks}</p>
            <div className="flex items-center justify-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${gradeInfo.bg} ${gradeInfo.color}`}>
                Grade: {gradeInfo.grade}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                isPassed ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
              }`}>
                {isPassed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-300">{correctCount}</p>
              <p className="text-xs text-slate-400 mt-1">Correct</p>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
              <XCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-rose-300">{wrongCount}</p>
              <p className="text-xs text-slate-400 mt-1">Wrong</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-300">{examQuestions.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total Q&apos;s</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-300">{classAvg}%</p>
              <p className="text-xs text-slate-400 mt-1">Avg Score</p>
            </div>
          </div>

          {/* Exam Info */}
          <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 space-y-3">
            <h4 className="text-slate-300 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-400" />
              Exam Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Date: {exam.examDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Duration: {exam.durationMinutes} min</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <BarChart className="w-4 h-4 text-emerald-400" />
                <span>Total Marks: {exam.totalMarks}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Status: {attempt.status}</span>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
            <h4 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-emerald-400" />
              Performance Breakdown
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-emerald-300">Correct Answers</span>
                  <span className="text-sm text-slate-400">{correctCount}/{examQuestions.length}</span>
                </div>
                <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                    style={{ width: `${(correctCount / examQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-rose-300">Wrong Answers</span>
                  <span className="text-sm text-slate-400">{wrongCount}/{examQuestions.length}</span>
                </div>
                <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                    style={{ width: `${(wrongCount / examQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
              {unanswered > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-400">Unanswered</span>
                    <span className="text-sm text-slate-400">{unanswered}/{examQuestions.length}</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-400"
                      style={{ width: `${(unanswered / examQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className={`flex-1 cursor-pointer px-6 font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg text-white ${
              isPassed
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/20'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
