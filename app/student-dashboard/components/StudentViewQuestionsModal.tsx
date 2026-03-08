'use client';

import React, { useState, useEffect } from 'react';
import { X, HelpCircle, CheckCircle, XCircle, Award, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { Exam, ExamAttempt, Question, StudentViewQuestionsModalProps } from './type';



export default function StudentViewQuestionsModal({ exam, attempt, onClose }: StudentViewQuestionsModalProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/student/questions/${exam.id}`);
        
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        } else {
          const errData = await res.json();
          setError(errData.message || 'Failed to load questions');
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [exam.id]);

  // Preview mode - no attempt yet
  const isPreviewMode = !attempt;

  const getOptionLabel = (option: 'A' | 'B' | 'C' | 'D', question: Question) => {
    switch (option) {
      case 'A': return question.optionA;
      case 'B': return question.optionB;
      case 'C': return question.optionC;
      case 'D': return question.optionD;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col items-center justify-center p-12">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Error</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <p className="text-rose-400 text-lg mb-2">Failed to load questions</p>
              <p className="text-slate-500 text-sm">{error}</p>
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/90">
            <button
              onClick={onClose}
              className="flex-1 cursor-pointer px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">No Questions</h2>
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
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No questions available for this exam</p>
              <p className="text-slate-500 text-sm">Please check back later</p>
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/90">
            <button
              onClick={onClose}
              className="flex-1 cursor-pointer px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                {isPreviewMode ? 'Preview Questions' : 'Questions & Answers'}
              </h2>
              <p className="text-slate-400 text-sm">{exam.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats chips - only show if attempt exists */}
            {attempt && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {questions.filter(q => {
                    const studentAnswer = attempt && (attempt as any).studentAnswers?.find((a: any) => a.questionId === q.id);
                    return studentAnswer?.isCorrect;
                  }).length} Correct
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  {questions.filter(q => {
                    const studentAnswer = attempt && (attempt as any).studentAnswers?.find((a: any) => a.questionId === q.id);
                    return studentAnswer && !studentAnswer.isCorrect;
                  }).length} Wrong
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-lg text-blue-300 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  {attempt.score}/{attempt.totalMarks}
                </span>
              </div>
            )}
            {/* Preview mode indicator */}
            {isPreviewMode && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-bold">
                <Eye className="w-3.5 h-3.5" />
                Preview Mode
              </span>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {questions.map((question, qIndex) => {
            const isExpanded = expandedQuestion === question.id;

            // For preview mode without attempt, show neutral styling
            const isPreview = isPreviewMode;

            return (
              <div
                key={question.id}
                className={`rounded-xl border-2 transition-all duration-300 ${
                  isPreview
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-blue-500/30 bg-blue-500/5'
                }`}
              >
                {/* Question Header */}
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer"
                  onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border ${
                    isPreview
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {qIndex + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-100 font-medium text-base leading-relaxed">
                      {question.questionText}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md text-blue-300 text-xs font-medium">
                        {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                      </span>
                      {isPreview ? (
                        <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md text-purple-300 text-xs font-medium flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Answer: {question.correctOption}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-300 text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Correct: {question.correctOption}
                        </span>
                      )}
                    </div>
                  </div>
                  <Eye className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'text-blue-400 rotate-0' : 'text-slate-500 -rotate-12'}`} />
                </div>

                {/* Expanded Options */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2.5 border-t border-white/[0.05] pt-4 ml-[52px]">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const isCorrectOpt = question.correctOption === opt;
                      const optLabel = getOptionLabel(opt, question);

                      let borderColor = 'border-white/[0.06] bg-white/[0.02]';
                      if (isCorrectOpt) borderColor = 'border-emerald-500/50 bg-emerald-500/10';

                      return (
                        <div
                          key={opt}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-300 ${borderColor}`}
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isCorrectOpt
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}>
                            {opt}
                          </span>
                          <span className={`text-sm flex-1 ${
                            isCorrectOpt ? 'text-emerald-300 font-semibold' : 'text-slate-300'
                          }`}>
                            {optLabel}
                          </span>
                          {isCorrectOpt && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
