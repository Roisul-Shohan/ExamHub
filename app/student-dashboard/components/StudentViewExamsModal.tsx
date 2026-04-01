'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Clock, Trophy, CheckCircle, Eye, Play, RefreshCw } from 'lucide-react';
import type { Exam, ExamAttempt, Question, StudentViewExamsModalProps } from './type';
import TakeExamModal from './TakeExamModal';

export default function StudentViewExamsModal({ 
  courseId, 
  courseName, 
  onClose,
  onViewQuestions,
  onViewResults
}: StudentViewExamsModalProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [takeExamData, setTakeExamData] = useState<{ exam: Exam; questions: Question[] } | null>(null);
  const [loadingExamId, setLoadingExamId] = useState<number | null>(null);

  const parseDateTime = (str: string): Date =>
    new Date(str.includes('T') ? str : str.replace(' ', 'T'));

  // Format datetime for display
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const dateStrFixed = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(dateStrFixed);
    if (isNaN(date.getTime())) return dateStr;
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Format time to 12-hour format with AM/PM
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const dateStrFixed = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(dateStrFixed);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Calculate end time from start time and duration
  const calculateEndTime = (startTimeStr: string, durationMinutes: number): Date => {
    if (!startTimeStr) return new Date();
    const dateStrFixed = startTimeStr.includes('T') ? startTimeStr : startTimeStr.replace(' ', 'T');
    const startDate = new Date(dateStrFixed);
    if (isNaN(startDate.getTime())) return new Date();
    return new Date(startDate.getTime() + durationMinutes * 60000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, attemptsRes] = await Promise.all([
        fetch('/api/student/exams'),
        fetch('/api/student/examAttempts'),
      ]);

      const [examsData, attemptsData] = await Promise.all([
        examsRes.ok ? examsRes.json() : [],
        attemptsRes.ok ? attemptsRes.json() : [],
      ]);

      const courseExams: Exam[] = examsData.filter((e: Exam) => e.courseId === courseId);
      setExams(courseExams);
      setExamAttempts(attemptsData);

      // Fetch question counts
      const counts: Record<number, number> = {};
      await Promise.all(
        courseExams.map(async (exam: Exam) => {
          try {
            const res = await fetch(`/api/student/questions/count/${exam.id}`);
            if (res.ok) {
              const data = await res.json();
              counts[exam.id] = data.count;
            } else {
              counts[exam.id] = 0;
            }
          } catch {
            counts[exam.id] = 0;
          }
        })
      );
      setQuestionCounts(counts);
    } catch (err) {
      console.error('Error fetching exam data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const getAttemptForExam = (examId: number): ExamAttempt | undefined =>
    examAttempts.find(a => a.examId === examId);

  const handleStartExam = async (exam: Exam) => {
    setLoadingExamId(exam.id);
    try {
      const res = await fetch(`/api/student/questions/${exam.id}`);
      if (res.ok) {
        const questions: Question[] = await res.json();
        setTakeExamData({ exam, questions });
      } else {
        alert('Could not load exam questions. Please try again.');
      }
    } catch {
      alert('Error loading exam. Please try again.');
    } finally {
      setLoadingExamId(null);
    }
  };



  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-linear-to-r from-slate-900/90 to-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Exams</h2>
                <p className="text-slate-400 text-sm">{courseName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                title="Refresh"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">No exams available</p>
                <p className="text-sm">There are no published exams for this course yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => {
                  const attempt = getAttemptForExam(exam.id);
                  const isTaken = !!attempt;
                  const questionCount = questionCounts[exam.id] ?? 0;
                  const hasQuestions = questionCount > 0;

                  const now = new Date();
                  const start = parseDateTime(exam.startTime);
                  const end = calculateEndTime(exam.startTime, exam.durationMinutes);
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-slate-200 font-semibold truncate">{exam.title}</p>
                            {isTaken ? (
                              <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">Taken</span>
                            ) : isAvailable ? (
                              <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">Available</span>
                            ) : (
                              <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">Upcoming</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDateTime(exam.startTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(exam.startTime)} – {end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              {exam.totalMarks} marks
                            </span>
                            <span className={`flex items-center gap-1 ${hasQuestions ? 'text-purple-300' : 'text-slate-500'}`}>
                              <FileText className="w-3.5 h-3.5" />
                              {questionCount} questions
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          {isTaken ? (
                            <>
                              <span className="text-sm font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                                {attempt.score}/{attempt.totalMarks}
                              </span>
                              {onViewResults && (
                                <button
                                  onClick={() => onViewResults(exam, attempt)}
                                  className="px-3 py-1.5 text-sm font-medium bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg transition-all flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Results
                                </button>
                              )}
                            </>
                          ) : isAvailable && hasQuestions ? (
                            <button
                              onClick={() => handleStartExam(exam)}
                              disabled={loadingExamId === exam.id}
                              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-linear-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-lg transition-all disabled:opacity-60"
                            >
                              {loadingExamId === exam.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              Start Exam
                            </button>
                          ) : !hasQuestions ? (
                            <span className="text-sm text-slate-500 px-3 py-1.5">No Questions</span>
                          ) : (
                            <span className="text-sm text-amber-300 px-3 py-1.5">Upcoming</span>
                          )}
                        </div>
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
              className="flex-1 cursor-pointer px-6 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Take Exam Modal */}
      {takeExamData && (
        <TakeExamModal
          exam={takeExamData.exam}
          questions={takeExamData.questions}
          onClose={() => { setTakeExamData(null); fetchData(); }}
          onDone={fetchData}
        />
      )}
    </>
  );
}

