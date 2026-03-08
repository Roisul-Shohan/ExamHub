'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, BarChart, FileText, Eye, Trophy, Search } from 'lucide-react';
import type { Course, Exam, ExamAttempt } from './type';
import StudentViewQuestionsModal from "./StudentViewQuestionsModal";
import StudentViewResultModal from "./StudentViewResultModal";
import StudentViewExamsModal from "./StudentViewExamsModal";



export default function MyCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [showExamsModal, setShowExamsModal] = useState<{ courseId: number; courseName: string } | null>(null);
  const [viewQuestionsExam, setViewQuestionsExam] = useState<{ exam: Exam; attempt?: ExamAttempt } | null>(null);
  const [viewResultExam, setViewResultExam] = useState<{ exam: Exam; attempt: ExamAttempt } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await fetch('/api/student/myCourses');
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        }

        const examsRes = await fetch('/api/student/exams');
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData);
        }

        const attemptsRes = await fetch('/api/student/examAttempts');
        if (attemptsRes.ok) {
          const attemptsData = await attemptsRes.json();
          setExamAttempts(attemptsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAttemptForExam = (examId: number): ExamAttempt | undefined => {
    return examAttempts.find(a => a.examId === examId);
  };

  const getCourseExams = (courseId: number) => {
    return exams.filter(e => e.courseId === courseId);
  };

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCourseAvgScore = (courseId: number) => {
    const courseExams = getCourseExams(courseId);
    const takenExams = courseExams.filter(e => getAttemptForExam(e.id));
    if (takenExams.length === 0) return null;
    const totalPercent = takenExams.reduce((sum, e) => {
      const attempt = getAttemptForExam(e.id)!;
      return sum + (attempt.score / attempt.totalMarks) * 100;
    }, 0);
    return (totalPercent / takenExams.length).toFixed(1);
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
      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search your courses by name, code, or teacher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-lg">No courses found</p>
          <p className="text-slate-500 text-sm">{searchTerm ? 'Try a different search term' : 'You have not enrolled in any courses yet'}</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((course) => {
          const courseExams = getCourseExams(course.id);
          const avgScore = getCourseAvgScore(course.id);
          const takenCount = courseExams.filter(e => getAttemptForExam(e.id)).length;

          return (
            <div
              key={course.id}
              className="group bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-1 flex flex-col"
            >
              {/* Card Header */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                      {course.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/[0.05]">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">{course.students}</span>
                  </div>
                </div>

                <h3 className="text-slate-100 font-bold text-lg group-hover:text-indigo-400 transition-colors mb-1">
                  {course.name}
                </h3>
                <p className="text-slate-500 text-xs mb-3">by {course.teacherName}</p>

                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  {course.description && course.description.length > 80
                    ? course.description.slice(0, 80) + '...'
                    : course.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.05]">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    {courseExams.length} Exams
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.05]">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {takenCount} Taken
                  </div>
                  {avgScore && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                      <BarChart className="w-3.5 h-3.5" />
                      Avg: {avgScore}%
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowExamsModal({ courseId: course.id, courseName: course.name })}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-indigo-500/10 border border-white/[0.05] hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 rounded-xl transition-all duration-300 text-sm font-medium group/btn backdrop-blur-sm"
                  >
                    <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    View Exams
                  </button>
                  <button
                    onClick={() => {
                      const courseExams = getCourseExams(course.id);
                      const taken = courseExams.filter(e => getAttemptForExam(e.id));
                      if (taken.length > 0) {
                        const exam = taken[0];
                        const attempt = getAttemptForExam(exam.id)!;
                        setViewResultExam({ exam, attempt });
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-indigo-500/10 border border-white/[0.05] hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 rounded-xl transition-all duration-300 text-sm font-medium group/btn backdrop-blur-sm"
                  >
                    <BarChart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    View Results
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modals */}
      {showExamsModal && (
        <StudentViewExamsModal
          courseId={showExamsModal.courseId}
          courseName={showExamsModal.courseName}
          exams={exams}
          examAttempts={examAttempts}
          onClose={() => setShowExamsModal(null)}
          onViewQuestions={(exam, attempt) => {
            setShowExamsModal(null);
            setViewQuestionsExam({ exam, attempt: attempt });
          }}
        />
      )}

      {viewQuestionsExam && (
        <StudentViewQuestionsModal
          exam={viewQuestionsExam.exam}
          attempt={viewQuestionsExam.attempt}
          onClose={() => setViewQuestionsExam(null)}
        />
      )}

      {viewResultExam && (
        <StudentViewResultModal
          exam={viewResultExam.exam}
          attempt={viewResultExam.attempt}
          onClose={() => setViewResultExam(null)}
        />
      )}
    </>
  );
}
