'use client';

import React, { useState } from 'react';
import { X, Clock, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ExamModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

const initialExamData = {
  title: '',
  description: '',
  examDate: '',
  startTime: '',
  totalMarks: 100,
  durationMinutes: 60,
  negativeMark: 0,
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'CLOSED',
};

export default function ExamModal({ courseId, courseName, onClose }: ExamModalProps) {
  const [examData, setExamData] = useState({ ...initialExamData });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateExam = async () => {
    if (!examData.title || !examData.examDate || !examData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate startTime and endTime in DATETIME format
      const startTime = `${examData.examDate}T${examData.startTime}:00`;
      
      // Calculate endTime: startTime + durationMinutes
      const startDateTime = new Date(`${examData.examDate}T${examData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + examData.durationMinutes * 60000);
      const endTime = endDateTime.toISOString().slice(0, 19).replace('T', ' ');

      const examPayload = {
        courseId,
        title: examData.title,
        description: examData.description,
        examDate: examData.examDate,
        totalMarks: examData.totalMarks,
        durationMinutes: examData.durationMinutes,
        startTime: startTime,
        endTime: endTime,
        negativeMark: examData.negativeMark,
        status: examData.status,
      };

      console.log('Creating exam:', examPayload);

      // Call the actual API
      const response = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examPayload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Exam created successfully!');
        // Reset form
        setExamData({ ...initialExamData });
        onClose();
      } else {
        toast.error(data.error || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Create exam error:', error);
      toast.error('Failed to create exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Create New Exam</h2>
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

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Exam Title *</label>
            <input
              type="text"
              value={examData.title}
              onChange={(e) => setExamData({ ...examData, title: e.target.value })}
              placeholder="Enter exam title"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={examData.description}
              onChange={(e) => setExamData({ ...examData, description: e.target.value })}
              placeholder="Enter exam description"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300 resize-none"
            />
          </div>

          {/* Exam Date & Start Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Exam Date *
              </label>
              <input
                type="date"
                value={examData.examDate}
                onChange={(e) => setExamData({ ...examData, examDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Start Time *
              </label>
              <input
                type="time"
                value={examData.startTime}
                onChange={(e) => setExamData({ ...examData, startTime: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Total Marks & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Total Marks *
              </label>
              <input
                type="number"
                value={examData.totalMarks}
                onChange={(e) => setExamData({ ...examData, totalMarks: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Duration (minutes) *
              </label>
              <input
                type="number"
                value={examData.durationMinutes}
                onChange={(e) => setExamData({ ...examData, durationMinutes: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Negative Mark & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Negative Mark
              </label>
              <input
                type="number"
                step="0.25"
                value={examData.negativeMark}
                onChange={(e) => setExamData({ ...examData, negativeMark: parseFloat(e.target.value) })}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Status
              </label>
              <select
                value={examData.status}
                onChange={(e) => setExamData({ ...examData, status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'CLOSED' })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-300"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800 sticky bottom-0 bg-slate-900/90 backdrop-blur-xl">
          <button
            onClick={handleCreateExam}
            disabled={isSubmitting}
            className={`flex-1 cursor-pointer bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Exam'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
