'use client';

import React, { useState, useEffect } from 'react';
import { X, HelpCircle, CheckCircle, Award, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuestionData {
  id: number;
  examId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

interface ViewQuestionsModalProps {
  examId: number;
  examTitle: string;
  onClose: () => void;
}

export default function ViewQuestionsModal({ examId, examTitle, onClose }: ViewQuestionsModalProps) {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/questions?examId=${examId}`);
        const data = await res.json();

        if (res.ok) {
          setQuestions(data);
          if (data.length > 0) {
            setExpandedQuestion(data[0].id);
          }
        } else {
          toast.error(data.error || "Failed to fetch questions");
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        toast.error("Something went wrong while fetching questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [examId]);

  const getOptionClass = (option: string, correctOption: string) => {
    if (option === correctOption) {
      return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
    }
    return 'bg-slate-800/50 border-slate-700 text-slate-300';
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-blue-900/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">View Questions</h2>
              <p className="text-slate-400 text-sm">{examTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!loading && questions.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 font-semibold text-sm">
                  {questions.length} Questions • {totalMarks} Marks
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span>Loading questions...</span>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <HelpCircle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No questions found</p>
              <p className="text-sm">Questions haven't been set for this exam yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className={`bg-slate-950/50 rounded-xl border transition-all duration-300 ${
                    expandedQuestion === question.id
                      ? 'border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Question Header */}
                  <div
                    className="flex items-start justify-between p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedQuestion(expandedQuestion === question.id ? null : question.id)
                    }
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-300 font-bold text-sm border border-blue-500/30 mt-1 flex-shrink-0">
                        {qIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-100 font-medium text-base leading-relaxed">
                          {question.questionText}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded-md text-blue-300 text-xs font-medium">
                            {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                          </span>
                          {expandedQuestion === question.id && (
                            <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-300 text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Correct: Option {question.correctOption}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options - Expanded */}
                  {expandedQuestion === question.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-4">
                      <div className="grid grid-cols-1 gap-3">
                        {/* Option A */}
                        <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-300 ${getOptionClass('A', question.correctOption)}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                              A
                            </span>
                            <span className={`text-sm flex-1 ${question.correctOption === 'A' ? 'font-semibold' : ''}`}>
                              {question.optionA}
                            </span>
                          </div>
                          {question.correctOption === 'A' && (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* Option B */}
                        <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-300 ${getOptionClass('B', question.correctOption)}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                              B
                            </span>
                            <span className={`text-sm flex-1 ${question.correctOption === 'B' ? 'font-semibold' : ''}`}>
                              {question.optionB}
                            </span>
                          </div>
                          {question.correctOption === 'B' && (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* Option C */}
                        <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-300 ${getOptionClass('C', question.correctOption)}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                              C
                            </span>
                            <span className={`text-sm flex-1 ${question.correctOption === 'C' ? 'font-semibold' : ''}`}>
                              {question.optionC}
                            </span>
                          </div>
                          {question.correctOption === 'C' && (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>

                        {/* Option D */}
                        <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-300 ${getOptionClass('D', question.correctOption)}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                              D
                            </span>
                            <span className={`text-sm flex-1 ${question.correctOption === 'D' ? 'font-semibold' : ''}`}>
                              {question.optionD}
                            </span>
                          </div>
                          {question.correctOption === 'D' && (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
