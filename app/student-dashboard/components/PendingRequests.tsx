'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Search, X } from 'lucide-react';

interface PendingRequest {
  id: number;
  courseId: number;
  studentId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  courseName: string;
  courseCode: string;
  courseDescription: string;
  teacherName: string;
}

interface PendingRequestsProps {
  onRequestCancelled?: (change: number) => void;
}

export default function PendingRequests({ onRequestCancelled }: PendingRequestsProps) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await fetch('/api/student/pendingRequests');

        if (!res.ok) {
          throw new Error("Failed to fetch pending requests");
        }

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching pending requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleCancelRequest = async (requestId: number) => {
    try {
      const res = await fetch(`/api/student/enrollmentsRequest/${requestId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error("Failed to cancel request");
      }

      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      // Notify parent to update pending count
      if (onRequestCancelled) {
        onRequestCancelled(-1);
      }
    } catch (error) {
      console.error("Cancel request failed", error);
    }
  };

  const filtered = requests.filter(r =>
    r.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search pending requests by name, code, or teacher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-lg">No pending requests</p>
          <p className="text-slate-500 text-sm">When you request to join a course, it will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((request) => (
            <div
              key={request.id}
              className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                      {request.courseCode}
                    </span>
                  </div>
                  <h3 className="text-slate-100 font-bold text-lg group-hover:text-amber-400 transition-colors">
                    {request.courseName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
              </div>

              {/* Teacher badge */}
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {request.teacherName.charAt(0)}
                </div>
                <span className="text-slate-300 text-sm font-medium">{request.teacherName}</span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                {request.courseDescription.length > 100
                  ? request.courseDescription.slice(0, 100) + '...'
                  : request.courseDescription}
              </p>

              {/* Cancel Button */}
              <button
                onClick={() => handleCancelRequest(request.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-300 hover:text-red-200 rounded-xl text-sm font-semibold transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Cancel Request
              </button>

              <p className="text-slate-500 text-xs mt-3 text-center">
                Requested on {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
