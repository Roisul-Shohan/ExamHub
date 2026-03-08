'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Download, Send, File } from 'lucide-react';

interface MaterialsModalProps {
  courseId: number;
  courseName: string;
  onClose: () => void;
}

const dummyMaterials = [
  { id: 1, title: 'Lecture 1: Introduction to DS', type: 'PDF', size: '2.3 MB', uploadedAt: '2024-01-15' },
  { id: 2, title: 'Lecture 2: Arrays & Linked Lists', type: 'PDF', size: '3.1 MB', uploadedAt: '2024-01-17' },
  { id: 3, title: 'Assignment 1', type: 'DOCX', size: '156 KB', uploadedAt: '2024-01-20' },
  { id: 4, title: 'Practice Problems', type: 'PDF', size: '1.8 MB', uploadedAt: '2024-01-22' },
];

export default function MaterialsModal({ courseName, onClose }: MaterialsModalProps) {
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'PDF' });
  const [isDragging, setIsDragging] = useState(false);

  const handleSendMaterial = () => {
    alert('Material sent successfully! (Dummy action)');
    setNewMaterial({ title: '', type: 'PDF' });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-red-500" /></div>;
      case 'DOCX':
        return <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-500" /></div>;
      default:
        return <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center"><File className="w-5 h-5 text-slate-500" /></div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-xl animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Send Materials</h2>
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

        {/* Content */}
        <div className="p-6">
          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all duration-300 ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-800/50'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-slate-200 font-medium mb-2">Drag & drop files here</p>
            <p className="text-slate-500 text-sm mb-4">or click to browse</p>
            <div className="flex justify-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-1 bg-slate-800 rounded">PDF</span>
              <span className="px-2 py-1 bg-slate-800 rounded">DOCX</span>
              <span className="px-2 py-1 bg-slate-800 rounded">PPTX</span>
              <span className="px-2 py-1 bg-slate-800 rounded">ZIP</span>
            </div>
          </div>

          {/* Recent Materials */}
          <div className="space-y-3 mb-6">
            <h3 className="text-slate-400 text-sm font-medium">Recent Materials</h3>
            {dummyMaterials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all duration-300 group border border-transparent hover:border-indigo-500/20"
              >
                {getFileIcon(material.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-slate-200 text-sm font-medium truncate">{material.title}</h4>
                  <p className="text-slate-500 text-xs">
                    {material.type} • {material.size} • {material.uploadedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-indigo-400 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Send */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-800">
            <h3 className="text-slate-400 text-sm font-medium mb-3">Quick Send</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                placeholder="Enter material title"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50"
              />
              <select
                value={newMaterial.type}
                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500/50"
              >
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="PPTX">PPTX</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={handleSendMaterial}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send to All Students
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
