'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, FileText, Trophy, CheckCircle, AlertCircle, Eye, BarChart, BookOpen, Timer, Play } from 'lucide-react';
import type { Exam, ExamAttempt, Question } from './type';
import StudentViewResultModal from "./StudentViewResultModal";
import TakeExamModal from "./TakeExamModal";



export default function StudentExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [examQuestions, setExamQuestions] = useState<Record<number, Question[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'due' | 'taken'>('due');
  const [viewQuestionsExam, setViewQuestionsExam] = useState<{ exam: Exam; attempt?: ExamAttempt } | null>(null);
  const [viewResultExam, setViewResultExam] = useState<{ exam: Exam; attempt: ExamAttempt } | null>(null);
  const [takeExamExam, setTakeExamExam] = useState<Exam | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exams
        const examsRes = await fetch('/api/student/exams');
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData);
          
          // Fetch questions for each exam
          const questionsMap: Record<number, Question[]> = {};
          for (const exam of examsData) {
            const questionsRes = await fetch(`/api/student/questions/${exam.id}`);
            if (questionsRes.ok) {
              const questionsData = await questionsRes.json();
              questionsMap[exam.id] = questionsData;
            }
          }
          setExamQuestions(questionsMap);
        }

        // Fetch exam attempts
        const attemptsRes = await fetch('/api/student/examAttempts');
        if (attemptsRes.ok) {
          const attemptsData = await attemptsRes.json();
          setExamAttempts(attemptsData);
        }
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAttemptForExam = (examId: number): ExamAttempt | undefined => {
    return examAttempts.find(a => a.examId === examId);
  };

  const hasQuestions = (examId: number): boolean => {
    return examQuestions[examId] && examQuestions[examId].length > 0;
  };

  // Format datetime for display - handles both ISO and MySQL format
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    // Replace space with T for parsing
    const dateStrFixed = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(dateStrFixed);
    // Check if date is valid
    if (isNaN(date.getTime())) return dateStr;
    // Format as MM/DD/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Format time to 12-hour format with AM/PM
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    // Replace space with T for parsing
    const dateStrFixed = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(dateStrFixed);
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    // Format as 12-hour time with AM/PM
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Calculate end time from start time and duration (to handle incorrect stored endTime)
  const calculateEndTime = (startTimeStr: string, durationMinutes: number): string => {
    if (!startTimeStr) return '';
    // Parse the start time
    const dateStrFixed = startTimeStr.includes('T') ? startTimeStr : startTimeStr.replace(' ', 'T');
    const startDate = new Date(dateStrFixed);
    if (isNaN(startDate.getTime())) return '';
    
    // Add duration
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    // Format as 12-hour time with AM/PM
    return endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Parse datetime string to Date object
  const parseDateTime = (str: string): Date => {
    // MySQL returns "YYYY-MM-DD HH:MM:SS" which needs the space replaced with T
    return new Date(str.includes('T') ? str : str.replace(' ', 'T'));
  };

  const isExamAvailable = (startTime: string, durationMinutes: number): boolean => {
    const now = new Date();
    const start = parseDateTime(startTime);
    // Calculate end time from start + duration to handle incorrect stored endTime
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return now >= start && now <= end;
  };

  // Sort dueExams: available exams first (by end time), then upcoming exams (by start time)
  const dueExams = exams.filter(e => !getAttemptForExam(e.id) && e.status === 'PUBLISHED')
    .sort((a, b) => {
      const now = new Date().getTime();
      const aStart = parseDateTime(a.startTime).getTime();
      const aEnd = aStart + a.durationMinutes * 60000;
      const bStart = parseDateTime(b.startTime).getTime();
      const bEnd = bStart + b.durationMinutes * 60000;
      
      const aIsAvailable = now >= aStart && now <= aEnd;
      const bIsAvailable = now >= bStart && now <= bEnd;
      
      // If both are available, sort by end time (soonest to expire first)
      if (aIsAvailable && bIsAvailable) {
        return aEnd - bEnd;
      }
      // If only a is available, it comes first
      if (aIsAvailable) return -1;
      // If only b is available, it comes first
      if (bIsAvailable) return 1;
      // Both are upcoming, sort by start time (soonest first)
      return aStart - bStart;
    });
  const takenExams = exams.filter(e => !!getAttemptForExam(e.id));

  const getTimeUntilExam = (startTime: string) => {
    const now = new Date();
    const start = parseDateTime(startTime);
    const diff = start.getTime() - now.getTime();
    if (diff <= 0) return 'Available now';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const refreshAttempts = async () => {
    const attemptsRes = await fetch('/api/student/examAttempts');
    if (attemptsRes.ok) setExamAttempts(await attemptsRes.json());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-8 p-1.5 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.05] w-fit">
          <button
            onClick={() => setActiveFilter('due')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeFilter === 'due'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Due Exams
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === 'due' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.05] text-slate-500'
            }`}>
              {dueExams.length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('taken')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              activeFilter === 'taken'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Taken Exams
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeFilter === 'taken' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/[0.05] text-slate-500'
            }`}>
              {takenExams.length}
            </span>
          </button>
        </div>

        {/* Due Exams */}
        {activeFilter === 'due' && (
          <div className="space-y-4">
            {dueExams.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                <CheckCircle className="w-14 h-14 mx-auto text-indigo-500/50 mb-4" />
                <p className="text-slate-300 text-lg font-medium">All caught up!</p>
                <p className="text-slate-500 text-sm">No pending exams at the moment</p>
              </div>
            ) : (
              dueExams.map((exam) => {
                const isAvailable = isExamAvailable(exam.startTime, exam.durationMinutes);
                return (
                  <div
                    key={exam.id}
                    className={`group bg-gradient-to-r from-white/[0.06] to-white/[0.02] backdrop-blur-xl rounded-2xl border p-6 transition-all duration-500 hover:shadow-xl ${
                      isAvailable 
                        ? 'border-emerald-500/40 hover:border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'border-white/10 hover:border-indigo-500/40 hover:shadow-indigo-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="text-slate-100 font-bold text-lg">{exam.title}</h3>
                            <p className="text-slate-500 text-xs flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3" />
                              {exam.courseCode} · {exam.courseName}
                            </p>
                          </div>
                          {isAvailable && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                              Available Now
                            </span>
                          )}
                        </div>

                        {exam.description && (
                          <p className="text-slate-400 text-sm ml-[52px] mb-4">{exam.description}</p>
                        )}

                        <div className="flex items-center gap-4 ml-[52px] flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            {formatDateTime(exam.startTime)}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            {formatTime(exam.startTime)} - {calculateEndTime(exam.startTime, exam.durationMinutes)}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                            <Timer className="w-3.5 h-3.5 text-violet-400" />
                            {exam.durationMinutes} min
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            {exam.totalMarks} marks
                          </div>
                          {exam.negativeMark > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                              -{exam.negativeMark} negative
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {/* Only show Take Exam button if exam is currently available (within time window) */}
                        {isExamAvailable(exam.startTime, exam.durationMinutes) ? (
                          hasQuestions(exam.id) ? (
                            <button
                              onClick={() => setTakeExamExam(exam)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/20"
                            >
                              <Play className="w-4 h-4" />
                              Take Exam
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-500/10 border border-slate-500/20 text-slate-400 rounded-xl text-sm font-semibold cursor-not-allowed">
                              No Questions
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-500/10 border border-slate-500/20 text-slate-400 rounded-xl text-sm font-semibold cursor-not-allowed">
                            <Clock className="w-4 h-4" />
                            {getTimeUntilExam(exam.startTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Taken Exams */}
        {activeFilter === 'taken' && (
          <div className="space-y-4">
            {takenExams.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                <FileText className="w-14 h-14 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-300 text-lg font-medium">No exams taken yet</p>
                <p className="text-slate-500 text-sm">Your completed exams will appear here</p>
              </div>
            ) : (
              takenExams.map((exam) => {
                const attempt = getAttemptForExam(exam.id)!;
                const percentage = ((attempt.score / attempt.totalMarks) * 100).toFixed(1);
                const isPassed = parseFloat(percentage) >= 40;
                const examHasQuestions = hasQuestions(exam.id);

                return (
                  <div
                    key={exam.id}
                    className={`group bg-gradient-to-r from-white/[0.06] to-white/[0.02] backdrop-blur-xl rounded-2xl border p-6 transition-all duration-500 hover:shadow-xl ${
                      isPassed
                        ? 'border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-indigo-500/10'
                        : 'border-rose-500/20 hover:border-rose-500/40 hover:shadow-rose-500/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                            isPassed
                              ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-500/20 border-indigo-500/30'
                              : 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 border-rose-500/30'
                          }`}>
                            <Trophy className={`w-5 h-5 ${isPassed ? 'text-indigo-400' : 'text-rose-400'}`} />
                          </div>
                          <div>
                            <h3 className="text-slate-100 font-bold text-lg">{exam.title}</h3>
                            <p className="text-slate-500 text-xs flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3" />
                              {exam.courseCode} · {exam.courseName}
                            </p>
                          </div>
                        </div>

                        {/* Score Bar */}
                        <div className="ml-[52px] mt-3 mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-slate-400">Score</span>
                            <span className={`text-sm font-bold ${isPassed ? 'text-indigo-300' : 'text-rose-300'}`}>
                              {attempt.score}/{attempt.totalMarks} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                isPassed
                                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                                  : 'bg-gradient-to-r from-rose-500 to-pink-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-[52px] flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            {formatDateTime(exam.startTime)}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            {exam.durationMinutes} min
                          </div>
                          <div className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border ${
                              attempt.status === 'SUBMITTED'
                                ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
                                : 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                          }`}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            {attempt.status === 'SUBMITTED' ? 'Submitted' : 'Auto-Submitted'}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 mt-26">
                        
                        <button
                          onClick={() => setViewResultExam({ exam, attempt })}
                          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-semibold transition-all duration-300"
                        >
                          <BarChart className="w-4 h-4" />
                          Result
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      

      {viewResultExam && (
        <StudentViewResultModal
          exam={viewResultExam.exam}
          attempt={viewResultExam.attempt}
          onClose={() => setViewResultExam(null)}
        />
      )}

      {takeExamExam && examQuestions[takeExamExam.id] && (
        <TakeExamModal
          exam={takeExamExam}
          questions={examQuestions[takeExamExam.id]}
          onClose={() => { setTakeExamExam(null); refreshAttempts(); }}
          onDone={refreshAttempts}
        />
      )}
    </>
  );
}
