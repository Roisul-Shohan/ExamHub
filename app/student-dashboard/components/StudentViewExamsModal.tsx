'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Clock, Trophy, CheckCircle, Edit, Eye } from 'lucide-react';
import type { Exam, ExamAttempt,StudentViewExamsModalProps} from './type';



export default function StudentViewExamsModal({ 
  courseId, 
  courseName, 
  exams, 
  examAttempts,
  onClose,
  onViewQuestions 
}: StudentViewExamsModalProps) {
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchQuestionCounts = async () => {
      const courseExams = exams.filter(e => e.courseId === courseId);
      const counts: Record<number, number> = {};
      
      for (const exam of courseExams) {
        try {
          const res = await fetch(`/api/student/questions/count/${exam.id}`);
          if (res.ok) {
            const data = await res.json();
            counts[exam.id] = data.count;
          }
        } catch (err) {
          console.error("Error fetching question count:", err);
          counts[exam.id] = 0;
        }
      }
      
      setQuestionCounts(counts);
      setLoadingQuestions(false);
    };

    fetchQuestionCounts();
  }, [courseId, exams]);

  const getAttemptForExam = (examId: number): ExamAttempt | undefined => {
    return examAttempts.find(a => a.examId === examId);
  };

  const courseExams = exams.filter(e => e.courseId === courseId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900/90 to-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Exams</h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {courseExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No exams available</p>
              <p className="text-sm">There are no exams for this course yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courseExams.map((exam) => {
                const attempt = getAttemptForExam(exam.id);
                const isTaken = !!attempt;
                const questionCount = questionCounts[exam.id] ?? 0;
                const hasQuestions = questionCount > 0;

                // Check if exam is available
                const now = new Date();
                const start = new Date(exam.startTime);
                const end = new Date(exam.endTime);
                const isAvailable = now >= start && now <= end;

                return (
                  <div
                    key={exam.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isTaken
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : isAvailable
                        ? 'bg-blue-500/5 border-blue-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-slate-200 font-semibold">{exam.title}</p>
                          {isTaken ? (
                            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                              Taken
                            </span>
                          ) : isAvailable ? (
                            <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                              Available
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {exam.examDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {exam.durationMinutes} min
                          </span>
                          <span>{exam.totalMarks} marks</span>
                          {!loadingQuestions && (
                            <span className={`flex items-center gap-1 ${hasQuestions ? 'text-purple-300' : 'text-slate-500'}`}>
                              <FileText className="w-4 h-4" />
                              {questionCount} questions
                            </span>
                          )}
                        </div>
                      </div>

                      {isTaken ? (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                            {attempt.score}/{attempt.totalMarks}
                          </span>
                          {onViewQuestions && (
                            <button
                              onClick={() => onViewQuestions(exam, attempt)}
                              className="px-3 py-1.5 text-sm font-medium bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg transition-all"
                            >
                              View
                            </button>
                          )}
                        </div>
                      ) : hasQuestions ? (
                        <div className="flex items-center gap-2">
                          {onViewQuestions && (
                            <button
                              onClick={() => onViewQuestions(exam, undefined)}
                              className="px-3 py-2 text-sm font-medium bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg transition-all flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </button>
                          )}
                          {isAvailable && (
                            <button
                              onClick={() => {
                                // TODO: Implement start exam functionality
                                alert('Start Exam functionality coming soon!');
                              }}
                              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg transition-all"
                            >
                              Start Exam
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-amber-300">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
