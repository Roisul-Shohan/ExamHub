'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, CheckCircle, XCircle, Clock, Calendar, BarChart, Target, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';
import type { Exam, ExamAttempt, Question } from './type';

interface StudentAnswer {
  id: number;
  questionId: number;
  selectedOption: string | null;
  isCorrect: boolean;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
}

interface StudentViewResultModalProps {
  exam: Exam;
  attempt: ExamAttempt;
  onClose: () => void;
}

export default function StudentViewResultModal({ exam, attempt, onClose }: StudentViewResultModalProps) {
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await fetch(`/api/student/examAttempts/${attempt.id}`);
        if (response.ok) {
          const data = await response.json();
          setAnswers(data.answers || []);
        }
      } catch (error) {
        console.error('Error fetching answers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [attempt.id]);

  const correctCount = answers.filter(a => a.isCorrect).length;
  const wrongCount = answers.filter(a => !a.isCorrect && a.selectedOption).length;
  const unanswered = answers.filter(a => !a.selectedOption).length;
  const percentage = ((attempt.score / attempt.totalMarks) * 100).toFixed(1);
  const isPassed = parseFloat(percentage) >= 40;

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

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getOptionClass = (answer: StudentAnswer, option: string) => {
    const isCorrectOption = option === answer.correctOption;
    const isSelectedOption = option === answer.selectedOption;

    if (isCorrectOption) {
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
    }
    if (isSelectedOption && !isCorrectOption) {
      return 'border-rose-500 bg-rose-500/10 text-rose-300';
    }
    return 'border-slate-700 bg-slate-800/50 text-slate-400';
  };

  const getOptionIcon = (answer: StudentAnswer, option: string) => {
    const isCorrectOption = option === answer.correctOption;
    const isSelectedOption = option === answer.selectedOption;

    if (isCorrectOption) {
      return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
    if (isSelectedOption && !isCorrectOption) {
      return <XCircle className="w-5 h-5 text-rose-400" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-2xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-emerald-900/20 shrink-0">
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
              <p className="text-2xl font-bold text-amber-300">{answers.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total Q's</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-300">{unanswered}</p>
              <p className="text-xs text-slate-400 mt-1">Unanswered</p>
            </div>
          </div>

          {/* Questions Review */}
          <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
            <h4 className="text-slate-300 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-emerald-400" />
              Questions Review
            </h4>
            <div className="space-y-3">
              {answers.map((answer, index) => {
                const isExpanded = expandedQuestions.has(answer.questionId);
                
                return (
                  <div
                    key={answer.id}
                    className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                      answer.isCorrect
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : answer.selectedOption
                          ? 'border-rose-500/30 bg-rose-500/5'
                          : 'border-amber-500/30 bg-amber-500/5'
                    }`}
                  >
                    {/* Question Header */}
                    <button
                      onClick={() => toggleQuestion(answer.questionId)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                          answer.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : answer.selectedOption
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-slate-200 text-sm font-medium line-clamp-2">
                          {answer.questionText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {answer.isCorrect ? (
                          <span className="text-xs text-emerald-400 font-semibold">Correct</span>
                        ) : answer.selectedOption ? (
                          <span className="text-xs text-rose-400 font-semibold">Wrong</span>
                        ) : (
                          <span className="text-xs text-amber-400 font-semibold">Unanswered</span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Question Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2 border-t border-slate-700/50 pt-4">
                        {(['A', 'B', 'C', 'D'] as const).map((option) => {
                          const optionText = answer[`option${option}` as keyof StudentAnswer];
                          
                          return (
                            <div
                              key={option}
                              className={`p-3 rounded-lg border-2 flex items-center gap-3 ${getOptionClass(answer, option)}`}
                            >
                              <span className={`flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${
                                option === answer.correctOption
                                  ? 'bg-emerald-500 text-white'
                                  : option === answer.selectedOption
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-700 text-slate-300'
                              }`}>
                                {option}
                              </span>
                              <span className="flex-1 text-sm">{optionText}</span>
                              {getOptionIcon(answer, option)}
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/50">
                          <span className="text-xs text-slate-400">
                            Marks: {answer.marks}
                          </span>
                          {answer.isCorrect ? (
                            <span className="text-xs text-emerald-400">+{answer.marks}</span>
                          ) : (
                            <span className="text-xs text-rose-400">0</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/90 shrink-0">
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
