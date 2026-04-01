'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Download, ExternalLink, Loader2, RefreshCw, File, BookOpen } from 'lucide-react';

interface Material {
  id: number;
  title: string;
  fileUrl: string;
  type: string;
  createdAt: string;
}

interface StudentMaterialsModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

export default function StudentMaterialsModal({ courseId, courseName, onClose }: StudentMaterialsModalProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/materials/${courseId}`);
      if (res.ok) setMaterials(await res.json());
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, [courseId]);

  const getFileIcon = (type: string) => {
    if (type === 'NOTES')
      return <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-400" /></div>;
    if (type === 'RANK_PDF')
      return <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-amber-400" /></div>;
    return <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center"><File className="w-5 h-5 text-slate-400" /></div>;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'NOTES') return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">Notes</span>;
    if (type === 'RANK_PDF') return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">Rank PDF</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">Other</span>;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-lg animate-in fade-in zoom-in duration-300 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Course Materials</h2>
              <p className="text-slate-400 text-sm">{courseName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchMaterials}
              disabled={loading}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">No materials uploaded yet</p>
              <p className="text-slate-500 text-sm mt-1">Your teacher has not uploaded any materials for this course.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-transparent hover:border-indigo-500/20 transition-all group"
                >
                  {getFileIcon(m.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-slate-200 text-sm font-medium truncate">{m.title}</p>
                      {getTypeBadge(m.type)}
                    </div>
                    <p className="text-slate-500 text-xs">{formatDate(m.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-medium transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </a>
                    <a
                      href={m.fileUrl}
                      download
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
