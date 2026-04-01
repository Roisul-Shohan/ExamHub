'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, AlertTriangle, CheckCircle, XCircle, Send, ChevronLeft, ChevronRight, Info, Trophy, BarChart } from 'lucide-react';
import type { Exam, Question } from './type';

type Phase = 'start' | 'exam' | 'result';

interface ResultData {
  score: number;
  totalMarks: number;
  isAutoSubmit: boolean;
}

interface TakeExamModalProps {
  exam: Exam;
  questions: Question[];
  onClose: () => void;
  /** Called immediately after successful submission so the parent can refresh its data. */
  onDone?: () => void;
  /** @deprecated use onDone – kept for legacy callers */
  onSubmit?: (answers: Record<number, 'A' | 'B' | 'C' | 'D'>, isAutoSubmit: boolean) => void;
}

export default function TakeExamModal({ exam, questions, onClose, onDone, onSubmit }: TakeExamModalProps) {
  const [phase, setPhase] = useState<Phase>('start');
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  // Refs to avoid stale closures in event handlers
  const answersRef = useRef(answers);
  const phaseRef = useRef<Phase>('start');
  const isSubmittedRef = useRef(false);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Internal submit — handles the API call and transitions to result phase
  const submitExam = useCallback(async (isAutoSubmit: boolean) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitting(true);

    const currentAnswers = answersRef.current;

    // Support legacy onSubmit callers (StudentExams)
    if (onSubmit) {
      onSubmit(currentAnswers, isAutoSubmit);
      return;
    }

    try {
      const response = await fetch('/api/student/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: exam.id, answers: currentAnswers, isAutoSubmit }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult({ score: data.attempt.score, totalMarks: data.attempt.totalMarks, isAutoSubmit });
        setPhase('result');
        onDone?.();
      } else {
        // Already attempted — still show a summary screen
        setResult({ score: 0, totalMarks: exam.totalMarks, isAutoSubmit });
        setPhase('result');
      }
    } catch {
      alert('Error submitting exam. Please try again.');
      isSubmittedRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [exam.id, exam.totalMarks, onDone, onSubmit]);

  // Timer — ticks every second while exam is active
  useEffect(() => {
    if (phase !== 'exam') return;
    if (timeLeft <= 0) { submitExam(true); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, submitExam]);

  // Auto-submit on tab/window hide (visibility change only — not window.blur)
  useEffect(() => {
    if (phase !== 'exam') return;
    const handle = () => {
      if (document.hidden && phaseRef.current === 'exam') submitExam(true);
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [phase, submitExam]);

  const handleOptionSelect = (questionId: number, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  const getTimeColor = () => {
    if (timeLeft <= 60) return 'text-rose-400 animate-pulse';
    if (timeLeft <= 300) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getTimeBorder = () => {
    if (timeLeft <= 60) return 'border-rose-500 bg-rose-500/20';
    if (timeLeft <= 300) return 'border-amber-500 bg-amber-500/20';
    return 'border-emerald-500 bg-emerald-500/20';
  };

  // ── START SCREEN ──────────────────────────────────────────────────────────
  const startScreen = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center gap-3 p-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Start Exam</h2>
            <p className="text-slate-400 text-sm">{exam.title}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-amber-300 font-semibold">Important Instructions</h4>
                <ul className="text-slate-400 text-sm mt-2 space-y-1.5">
                  <li>• Once you start, the timer will begin counting down</li>
                  <li className="text-rose-400 font-medium">• Switching tabs or minimising the window will auto-submit your exam</li>
                  <li>• You can answer questions in any order</li>
                  <li>• Make sure to submit before the timer ends</li>
                  {exam.negativeMark > 0 && <li>• Wrong answers deduct {exam.negativeMark} mark(s)</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Clock className="w-4 h-4 text-cyan-400" />, label: 'Duration', value: `${exam.durationMinutes} min` },
              { icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, label: 'Questions', value: questions.length },
              { icon: null, label: 'Total Marks', value: exam.totalMarks },
              { icon: null, label: 'Negative Mark', value: exam.negativeMark || 0 },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">{icon}{label}</div>
                <p className="text-2xl font-bold text-slate-100">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 py-3 font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all">Cancel</button>
          <button onClick={() => setPhase('exam')} className="flex-1 py-3 font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/20 transition-all">Start Exam</button>
        </div>
      </div>
    </div>
  );

  // ── EXAM SCREEN ───────────────────────────────────────────────────────────
  const examScreen = (
    <div className="fixed inset-0 bg-slate-950 flex flex-col" style={{ zIndex: 99999 }}>
      {/* Header with timer */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-indigo-900/60 via-slate-900 to-indigo-900/60 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-100 font-bold text-sm sm:text-base truncate">{exam.title}</p>
            <p className="text-slate-400 text-xs">Q {currentQuestionIndex + 1} / {questions.length}</p>
          </div>
        </div>

        {/* Timer — always clearly visible */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 shrink-0 ${getTimeBorder()}`}>
          <Clock className={`w-5 h-5 ${getTimeColor()}`} />
          <span className={`text-xl font-bold font-mono tracking-widest ${getTimeColor()}`}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className="text-slate-300 font-semibold">{answeredCount}/{questions.length} answered</span>
        </div>
        <div className="w-full h-1.5 bg-slate-700 rounded-full">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-sm shrink-0 border border-indigo-500/30">
              {currentQuestionIndex + 1}
            </span>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl text-slate-100 font-medium leading-relaxed">{currentQuestion.questionText}</h3>
              <p className="text-xs text-slate-500 mt-1">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="space-y-3 pl-13">
            {(['A', 'B', 'C', 'D'] as const).map((option) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(currentQuestion.id, option)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${isSelected ? 'border-indigo-500 bg-indigo-500/10 text-slate-100' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'}`}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{option}</span>
                  <span className="flex-1 text-sm sm:text-base">{currentQuestion[`option${option}` as keyof Question] as string}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/95 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Prev / Next */}
          <div className="flex gap-2">
            <button onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))} disabled={currentQuestionIndex === 0} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-sm transition-all">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))} disabled={currentQuestionIndex === questions.length - 1} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-sm transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Question grid jumper */}
          <div className="hidden sm:flex items-center gap-1 flex-wrap max-w-xs">
            {questions.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  idx === currentQuestionIndex ? 'bg-indigo-500 text-white' :
                  answers[questions[idx].id] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >{idx + 1}</button>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={() => submitExam(false)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-sm transition-all"
          >
            {isSubmitting
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
              : <><Send className="w-4 h-4" />Submit Exam</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ── RESULT SCREEN ─────────────────────────────────────────────────────────
  const resultScreen = result ? (() => {
    const pct = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
    const isPassed = pct >= 40;
    const getGrade = (p: number) => {
      if (p >= 90) return { grade: 'A+', color: 'text-emerald-300' };
      if (p >= 80) return { grade: 'A',  color: 'text-emerald-300' };
      if (p >= 70) return { grade: 'B+', color: 'text-blue-300' };
      if (p >= 60) return { grade: 'B',  color: 'text-blue-300' };
      if (p >= 50) return { grade: 'C',  color: 'text-amber-300' };
      if (p >= 40) return { grade: 'D',  color: 'text-orange-300' };
      return { grade: 'F', color: 'text-rose-300' };
    };
    const gradeInfo = getGrade(pct);

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
          {/* Hero */}
          <div className={`p-6 text-center border-b border-slate-800 rounded-t-2xl ${isPassed ? 'bg-gradient-to-b from-emerald-900/30' : 'bg-gradient-to-b from-rose-900/20'}`}>
            <div className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center border-2 ${isPassed ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-rose-500/20 border-rose-500/40'}`}>
              <Trophy className={`w-10 h-10 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`} />
            </div>
            {result.isAutoSubmit && (
              <div className="flex items-center justify-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 w-fit mx-auto">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">Auto-submitted — window was left</span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-slate-100 mb-1">{isPassed ? '🎉 Passed!' : 'Not Passed'}</h2>
            <p className="text-slate-400 text-sm">{exam.title}</p>
          </div>

          {/* Stats */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-indigo-400" />
                <span className="text-slate-300 font-medium">Score</span>
              </div>
              <span className="text-2xl font-bold text-slate-100">
                {result.score} <span className="text-slate-500 text-base">/ {result.totalMarks}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Percentage</p>
                <p className={`text-2xl font-bold ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>{pct.toFixed(1)}%</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Grade</p>
                <p className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</p>
              </div>
            </div>

            <div className={`flex items-center justify-center gap-2 py-3 rounded-xl border ${
              isPassed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {isPassed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="font-semibold">{isPassed ? 'You passed this exam' : 'Below passing mark (40%)'}</span>
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-3 font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/20 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  })() : null;

  // Use createPortal so the modal renders directly at document.body,
  // bypassing any parent stacking-context (layout's z-10 wrapper vs navbar z-50).
  if (typeof window === 'undefined') return null;
  const content = phase === 'start' ? startScreen : phase === 'exam' ? examScreen : resultScreen;
  return createPortal(content, document.body);
}
