'use client';

import React, { useEffect, useState } from 'react';
import { X, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface StudentsModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

interface Student {
  id: number;
  name: string;
  email: string;
  status:string;
}


export default function StudentsModal({ courseId,courseName, onClose }: StudentsModalProps) {
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);
 
  const handleApprove = async (studentId: number) => {
    try {
      setApproving(studentId);
      const res = await fetch(`/api/teacher/students/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'approve' })
      });
      
      if (res.ok) {
        toast.success('Student approved successfully');
        // Update local state
        setStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, status: 'APPROVED' } : s
        ));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to approve student');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setApproving(null);
    }
  };
 
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/teacher/students/${courseId}`);
        const data = await res.json();

        if (res.ok) {
          setStudents(data);
        } else {
          toast.error(data.error || "Failed to fetch students");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
  fetchStudents();
  }, [courseId]);

  
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Enrolled Students</h2>
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

        {/* Students List */}
        <div className="p-4 space-y-2 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No students enrolled yet
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all duration-300 group cursor-pointer border border-transparent hover:border-indigo-500/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-200 font-semibold">{student.name}</h4>
                  <p className="text-slate-500 text-sm">{student.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    student.status === 'APPROVED' 
                      ? 'bg-green-500/20 text-green-400' 
                      : student.status === 'PENDING'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {student.status}
                  </span>
                </div>
                {student.status === 'PENDING' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(student.id);
                    }}
                    disabled={approving === student.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center gap-2"
                  >
                    {approving === student.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Approve'
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Total Students</span>
            <span className="text-slate-200 font-semibold">{students.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
