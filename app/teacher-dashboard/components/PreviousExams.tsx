'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, HelpCircle, Calendar, Plus, Eye, CheckCircle, Circle, FileText, Trophy, Edit, Lock } from 'lucide-react';
import toast from "react-hot-toast";
import SetQuestionsModal from './SetQuestionsModal';
import ViewResultsModal from './ViewResultsModal';
import ViewQuestionsModal from './ViewQuestionsModal';
import EditExamModal from './EditExamModal';

interface Exam {
  id: number;
  title: string;
  description?: string;
  totalMarks: number;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  negativeMark?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  examDate: string;
}

interface PreviousExamsProps {
  courseId: number;
  onClose: () => void;
  onAddQuestion?: (examId: number) => void;
  onSeeResult?: (examId: number) => void;
  onCreateNew?: () => void;
}

export default function PreviousExams({ 
  courseId, 
  onClose,
  onAddQuestion,
  onSeeResult,
  onCreateNew
}: PreviousExamsProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [showSetQuestions, setShowSetQuestions] = useState<{ examId: number; examTitle: string } | null>(null);
  const [showViewResults, setShowViewResults] = useState<{ examId: number; examTitle: string } | null>(null);
  const [showViewQuestions, setShowViewQuestions] = useState<{ examId: number; examTitle: string } | null>(null);
  const [examQuestionCounts, setExamQuestionCounts] = useState<Record<number, number>>({});
  const [editExam, setEditExam] = useState<Exam | null>(null);

  useEffect(() => {
    // Fetch exams from API
    const fetchExams = async () => {
     try {
        setLoading(true);

        const res = await fetch(`/api/teacher/exams/${courseId}`);
        const data = await res.json();

        if (res.ok) {
          setExams(data);
          // Fetch question counts for each exam
          await fetchQuestionCounts(data);
        } else {
          toast.error(data.error || "Failed to fetch exams");
        }
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        toast.error("Something went wrong while fetching exams");
      } finally {
        setLoading(false);
      }
    };

    const fetchQuestionCounts = async (examsList: Exam[]) => {
      const counts: Record<number, number> = {};
      
      // Fetch question counts for all exams in parallel
      await Promise.all(
        examsList.map(async (exam: Exam) => {
          try {
            const res = await fetch(`/api/teacher/questions?examId=${exam.id}`);
            if (res.ok) {
              const questions = await res.json();
              counts[exam.id] = questions.length;
            }
          } catch (err) {
            console.error(`Failed to fetch questions for exam ${exam.id}:`, err);
            counts[exam.id] = 0;
          }
        })
      );
      
      setExamQuestionCounts(counts);
    };

    fetchExams();
  }, [courseId]);

  const handleTogglePublish = async (examId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    
    try {
      const res = await fetch(`/api/teacher/exams/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId, status: newStatus })
      });

      if (res.ok) {
        setExams(exams.map((exam: Exam) => 
          exam.id === examId 
            ? { ...exam, status: newStatus as 'DRAFT' | 'PUBLISHED' | 'CLOSED' } 
            : exam
        ));
        toast.success(newStatus === 'PUBLISHED' ? 'Exam published!' : 'Exam unpublished');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update exam status');
      }
    } catch (err) {
      console.error('Failed to update exam status:', err);
      toast.error('Something went wrong');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PUBLISHED') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
          <CheckCircle className="w-3 h-3" />
          Published
        </span>
      );
    }
    if (status === 'DRAFT') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">
          <Circle className="w-3 h-3" />
          Draft
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 text-xs">
        <Clock className="w-3 h-3" />
        Closed
      </span>
    );
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

  // Determine exam status based on date
  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const examStart = new Date(exam.startTime.replace(' ', 'T'));
    // Calculate end time from start + duration to handle incorrect stored endTime
    const examEnd = new Date(examStart.getTime() + exam.durationMinutes * 60000);

    if (exam.status === 'CLOSED') return 'TAKEN';
    if (now < examStart) return 'PENDING';
    if (now >= examStart && now <= examEnd) return 'DUE';
    return 'TAKEN';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-3xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Previous Exams</h2>
                <p className="text-slate-400 text-sm">Course ID: {courseId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onCreateNew && (
                <button
                  onClick={onCreateNew}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Take New Exam
                </button>
              )}
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
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-slate-400">
                  <Clock className="w-6 h-6 animate-spin" />
                  <span>Loading exams...</span>
                </div>
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No exams found for this course</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam: Exam) => {
                  const examStatus = getExamStatus(exam);
                  return (
                    <div
                      key={exam.id}
                      className={`bg-slate-950/50 rounded-xl border p-4 transition-all duration-300 ${
                        selectedExam === exam.id
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center border border-indigo-500/30">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="text-slate-100 font-semibold">{exam.title}</h4>
                            <p className="text-slate-400 text-sm flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {formatDateTime(exam.startTime)} | {formatTime(exam.startTime)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(exam.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {exam.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-4 h-4" />
                          {exam.totalMarks} marks
                        </span>
                        {exam.negativeMark && exam.negativeMark > 0 && (
                          <span className="text-amber-400">
                            -{exam.negativeMark} negative
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        {/* Show appropriate button based on exam status and question availability */}
                        {examQuestionCounts[exam.id] > 0 ? (
                          // Exam has questions - show "View Questions" button
                          <button
                            onClick={() => setShowViewQuestions({ examId: exam.id, examTitle: exam.title })}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/10"
                          >
                            <Eye className="w-4 h-4" />
                            View Questions ({examQuestionCounts[exam.id]})
                          </button>
                        ) : exam.status === 'CLOSED' ? (
                          // Exam is closed and has no questions - show disabled button
                          <button
                            disabled
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-500 rounded-lg text-sm font-semibold cursor-not-allowed opacity-60"
                          >
                            <Lock className="w-4 h-4" />
                            Exam Closed
                          </button>
                        ) : (
                          // Exam is not closed and has no questions - show "Set Questions" button
                          <button
                            onClick={() => setShowSetQuestions({ examId: exam.id, examTitle: exam.title })}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-500/10"
                          >
                            <Edit className="w-4 h-4" />
                            Set Questions
                          </button>
                        )}
                        
                        {/* View Results Button - show for all exams with questions */}
                        {examQuestionCounts[exam.id] > 0 && (
                          <button
                            onClick={() => setShowViewResults({ examId: exam.id, examTitle: exam.title })}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/10"
                          >
                            <Trophy className="w-4 h-4" />
                            View Results
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleTogglePublish(exam.id, exam.status)}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-300 ${
                            exam.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30 text-emerald-300'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                        >
                          {exam.status === 'PUBLISHED' ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Published
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4" />
                              Not Published
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditExam(exam)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-800">
            <button
              onClick={onClose}
              className="flex-1 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold py-3 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      {showSetQuestions && (
        <SetQuestionsModal
          examId={showSetQuestions.examId}
          examTitle={showSetQuestions.examTitle}
          onClose={() => setShowSetQuestions(null)}
        />
      )}
      
      {showViewResults && (
        <ViewResultsModal
          examId={showViewResults.examId}
          examTitle={showViewResults.examTitle}
          onClose={() => setShowViewResults(null)}
        />
      )}

      {showViewQuestions && (
        <ViewQuestionsModal
          examId={showViewQuestions.examId}
          examTitle={showViewQuestions.examTitle}
          onClose={() => setShowViewQuestions(null)}
        />
      )}

      {editExam && (
        <EditExamModal
          exam={editExam}
          courseId={courseId}
          onClose={() => setEditExam(null)}
          onSave={(updatedExam) => {
            setExams(exams.map(e => e.id === updatedExam.id ? updatedExam : e));
          }}
        />
      )}
    </>
  );
}
