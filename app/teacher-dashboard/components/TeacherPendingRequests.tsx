'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Check, X, Clock, User, BookOpen, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EnrollmentRequest {
  id: number;
  courseId: number;
  studentId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  courseName: string;
  courseCode: string;
  studentName: string;
  studentEmail: string;
}

export default function TeacherPendingRequests() {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teacher/enrollmentRequests');
      const data = await res.json();
      if (res.ok) {
        setRequests(data);
      } else {
        toast.error(data.error || 'Failed to fetch enrollment requests');
      }
    } catch {
      toast.error('Something went wrong while fetching requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId: number, action: 'APPROVED' | 'REJECTED') => {
    setProcessing(requestId);
    try {
      const res = await fetch(`/api/teacher/enrollmentRequests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(action === 'APPROVED' ? 'Request approved!' : 'Request rejected');
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        toast.error(data.error || 'Failed to process request');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Pending Requests</h2>
            <p className="text-slate-400 text-sm">
              {requests.length} pending enrollment{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/3 border border-white/7 text-slate-400 hover:text-slate-100 hover:bg-white/6 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-slate-300 font-semibold text-lg mb-1">No Pending Requests</h3>
          <p className="text-slate-500 text-sm">All enrollment requests have been processed.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white/2 backdrop-blur-xl border border-white/6 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-white/10 transition-all duration-200"
            >
              {/* Left: student + course info */}
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-100 font-semibold truncate">{request.studentName}</p>
                  <p className="text-slate-400 text-sm truncate">{request.studentEmail}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-400 text-sm">
                      {request.courseName}
                      <span className="text-slate-600 ml-1">({request.courseCode})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: timestamp + actions */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(request.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>

                {/* Approve */}
                <button
                  onClick={() => handleAction(request.id, 'APPROVED')}
                  disabled={processing === request.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 transition-all duration-200 text-sm font-medium disabled:opacity-50"
                >
                  {processing === request.id ? (
                    <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </button>

                {/* Reject */}
                <button
                  onClick={() => handleAction(request.id, 'REJECTED')}
                  disabled={processing === request.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all duration-200 text-sm font-medium disabled:opacity-50"
                >
                  {processing === request.id ? (
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
