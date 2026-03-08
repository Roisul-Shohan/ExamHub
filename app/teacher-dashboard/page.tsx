'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, CourseCard, CreateCourseForm, StudentsModal, ResultsModal, ExamModal, MaterialsModal, PreviousExams } from './components';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboardPage() {

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-courses');
  const [modal, setModal] = useState<{ type: string; courseId: number; courseName: string } | null>(null);
  const [examView, setExamView] = useState<'PREVIOUS' | 'NEW' | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/sign-in");
      return;
    }
    
    if (session.user.role !== "TEACHER") {
      router.push("/");
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/courses/teacher");
        const data = await res.json();

        if (res.ok) {
          setCourses(data);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [session, status, router]);

  const totalStudents = courses.reduce((acc, c) => acc + (c.students || 0), 0);
  const totalCourses = courses.length;


  const handleTakeExam = (courseId: number, courseName: string) => {
    setExamView('PREVIOUS');
    setModal({ type: 'exam', courseId, courseName });
  };

  const handleAddQuestion = (examId: number) => {
    alert(`Add Question feature for Exam ID: ${examId}`);
  };

  const handleSeeResult = (examId: number) => {
    alert(`See Result feature for Exam ID: ${examId}`);
  };

  const handleCreateNewExam = () => {
    setExamView('NEW');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {activeTab === 'my-courses' && 'My Courses'}
              {activeTab === 'create-course' && 'Create Course'}
              {activeTab === 'edit-profile' && 'Edit Profile'}
            </h1>
            <p className="text-slate-400">
              {activeTab === 'my-courses' && 'Manage your courses and students'}
              {activeTab === 'create-course' && 'Add a new course to your portfolio'}
              {activeTab === 'edit-profile' && 'Update your personal information'}
            </p>
          </div>
          
          {activeTab === 'my-courses' && (
            <div className="flex gap-4">
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl px-5 py-3 shadow-sm">
                <span className="text-slate-400 text-sm">Total Courses</span>
                <p className="text-slate-100 font-bold text-xl">{totalCourses}</p>
              </div>
              <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-xl px-5 py-3 shadow-sm">
                <span className="text-slate-400 text-sm">Total Students</span>
                <p className="text-slate-100 font-bold text-xl">{totalStudents}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'my-courses' && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg">Loading courses...</span>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-slate-400 text-lg">No courses found</p>
                <p className="text-slate-500 text-sm mt-2">Create a new course to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  code={course.code}
                  name={course.name}
                  students={course.students}
                  description={course.description}
                  onViewStudents={() => {
                    setModal({ type: 'students', courseId: course.id, courseName: course.name });
                  }}
                  onViewResults={() => {
                    setModal({ type: 'results', courseId: course.id, courseName: course.name });
                  }}
                  onTakeExam={() => {
                    handleTakeExam(course.id, course.name);
                  }}
                  onSendMaterials={() => {
                    setModal({ type: 'materials', courseId: course.id, courseName: course.name });
                  }}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'create-course' && <CreateCourseForm />}

      </main>

      {/* Modals */}
      {modal && modal.type === 'students' && (
        <StudentsModal
          courseId={modal.courseId}
          courseName={modal.courseName}
          onClose={() => { setModal(null); setExamView(null); }}
        />
      )}
      {modal && modal.type === 'results' && (
        <ResultsModal
          courseId={modal.courseId}
          courseName={modal.courseName}
          onClose={() => { setModal(null); setExamView(null); }}
        />
      )}
      {modal && modal.type === 'exam' && examView === 'PREVIOUS' && (
        <PreviousExams
          courseId={modal.courseId}
          onClose={() => { setModal(null); setExamView(null); }}
          onAddQuestion={handleAddQuestion}
          onSeeResult={handleSeeResult}
          onCreateNew={handleCreateNewExam}
        />
      )}
      {modal && modal.type === 'exam' && examView === 'NEW' && (
        <ExamModal
          courseId={modal.courseId}
          courseName={modal.courseName}
          onClose={() => { setModal(null); setExamView(null); }}
        />
      )}
      {modal && modal.type === 'materials' && (
        <MaterialsModal
          courseId={modal.courseId}
          courseName={modal.courseName}
          onClose={() => { setModal(null); setExamView(null); }}
        />
      )}
    </div>
  );
}
