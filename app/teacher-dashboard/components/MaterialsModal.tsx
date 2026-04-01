'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Download, Trash2, Loader2, RefreshCw, File } from 'lucide-react';

interface Material {
  id: number;
  title: string;
  fileUrl: string;
  type: string;
  createdAt: string;
}

interface MaterialsModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

export default function MaterialsModal({ courseId, courseName, onClose }: MaterialsModalProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('OTHER');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/materials?courseId=${courseId}`);
      if (res.ok) setMaterials(await res.json());
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, [courseId]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      alert('Please select a file and enter a title.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('courseId', String(courseId));
      formData.append('type', type);

      const res = await fetch('/api/teacher/materials', { method: 'POST', body: formData });
      if (res.ok) {
        setTitle('');
        setSelectedFile(null);
        setType('OTHER');
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchMaterials();
      } else {
        const data = await res.json();
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this material?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/teacher/materials/${id}`, { method: 'DELETE' });
      if (res.ok) setMaterials(prev => prev.filter(m => m.id !== id));
      else alert('Failed to delete material.');
    } catch {
      alert('Error deleting material.');
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'NOTES' || type === 'RANK_PDF')
      return <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-red-400" /></div>;
    return <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center"><File className="w-5 h-5 text-slate-400" /></div>;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-xl animate-in fade-in zoom-in duration-300 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Materials</h2>
              <p className="text-slate-400 text-sm">{courseName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchMaterials} disabled={loading} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Upload area */}
          <div>
            <h3 className="text-slate-300 text-sm font-semibold mb-3">Upload New Material</h3>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
                isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-800/40'
              }`}
            >
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              {selectedFile ? (
                <p className="text-slate-200 text-sm font-medium">{selectedFile.name}</p>
              ) : (
                <>
                  <p className="text-slate-300 text-sm font-medium mb-1">Drag & drop a PDF here</p>
                  <p className="text-slate-500 text-xs">or click to browse • PDF, DOCX, PPTX, ZIP</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.pptx,.zip"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Title + Type row */}
          <div className="flex gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Material title"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/60"
            >
              <option value="NOTES">Notes</option>
              <option value="RANK_PDF">Rank PDF</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading…' : 'Upload & Save'}
          </button>

          {/* Materials list */}
          <div>
            <h3 className="text-slate-400 text-sm font-medium mb-3">
              Uploaded Materials ({materials.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                No materials uploaded yet
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-transparent hover:border-indigo-500/20 transition-all group"
                  >
                    {getFileIcon(m.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">{m.title}</p>
                      <p className="text-slate-500 text-xs">{m.type} · {formatDate(m.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
