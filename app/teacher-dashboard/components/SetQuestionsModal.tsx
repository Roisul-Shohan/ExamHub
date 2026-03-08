'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, HelpCircle, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  marks: number;
  options: QuestionOption[];
}

interface SetQuestionsModalProps {
  examId: number;
  examTitle: string;
  onClose: () => void;
}

export default function SetQuestionsModal({ examId, examTitle, onClose }: SetQuestionsModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string>('1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExistingQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/questions?examId=${examId}`);
        const data = await res.json();

        if (res.ok && data.length > 0) {
          // Convert database questions to the format used by this component
          const convertedQuestions = data.map((q: any, index: number) => ({
            id: String(index + 1),
            questionText: q.questionText,
            marks: q.marks,
            options: [
              { id: `${index + 1}a`, text: q.optionA, isCorrect: q.correctOption === 'A' },
              { id: `${index + 1}b`, text: q.optionB, isCorrect: q.correctOption === 'B' },
              { id: `${index + 1}c`, text: q.optionC, isCorrect: q.correctOption === 'C' },
              { id: `${index + 1}d`, text: q.optionD, isCorrect: q.correctOption === 'D' },
            ],
          }));
          setQuestions(convertedQuestions);
          setExpandedQuestion('1');
        } else {
          // No existing questions, start with empty question
          setQuestions([{
            id: '1',
            questionText: '',
            marks: 1,
            options: [
              { id: '1a', text: '', isCorrect: false },
              { id: '1b', text: '', isCorrect: false },
              { id: '1c', text: '', isCorrect: false },
              { id: '1d', text: '', isCorrect: false },
            ],
          }]);
          setExpandedQuestion('1');
        }
      } catch (error) {
        console.error("Failed to fetch existing questions:", error);
        toast.error("Failed to load existing questions");
        // Start with empty question on error
        setQuestions([{
          id: '1',
          questionText: '',
          marks: 1,
          options: [
            { id: '1a', text: '', isCorrect: false },
            { id: '1b', text: '', isCorrect: false },
            { id: '1c', text: '', isCorrect: false },
            { id: '1d', text: '', isCorrect: false },
          ],
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingQuestions();
  }, [examId]);

  const addNewQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([
      ...questions,
      {
        id: newId,
        questionText: '',
        marks: 1,
        options: [
          { id: `${newId}a`, text: '', isCorrect: false },
          { id: `${newId}b`, text: '', isCorrect: false },
          { id: `${newId}c`, text: '', isCorrect: false },
          { id: `${newId}d`, text: '', isCorrect: false },
        ],
      },
    ]);
    setExpandedQuestion(newId);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length === 1) {
      toast.error('At least one question is required');
      return;
    }
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, field: string, value: string | number) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    );3
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(opt =>
                opt.id === optionId ? { ...opt, text } : opt
              ),
            }
          : q
      )
    );
  };

  const toggleCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(opt =>
                opt.id === optionId
                  ? { ...opt, isCorrect: !opt.isCorrect }
                  : opt
              ),
            }
          : q
      )
    );
  };


  const validateAndSave = async() => {
    // Validation
    for (const question of questions) {
      if (!question.questionText.trim()) {
        toast.error(`Question ${question.id} is empty`);
        return;
      }
      if (question.options.length < 2) {
        toast.error(`Question ${question.id} must have at least 2 options`);
        return;
      }
      if (question.options.some(opt => !opt.text.trim())) {
        toast.error(`Question ${question.id} has empty options`);
        return;
      }
      if (!question.options.some(opt => opt.isCorrect)) {
        toast.error(`Question ${question.id} must have at least one correct answer`);
        return;
      }
    }

    try {
    const res = await fetch("/api/teacher/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examId,
        questions,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Questions saved successfully!");
    } else {
      toast.error(data.error || "Failed to save questions");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-300 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Set Questions</h2>
              <p className="text-slate-400 text-sm">{examTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
              <span className="text-slate-400">Loading questions...</span>
            </div>
          ) : (
            <>
          {questions.map((question, qIndex) => (
            <div
              key={question.id}
              className={`bg-slate-950/50 rounded-xl border transition-all duration-300 ${
                expandedQuestion === question.id
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Question Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() =>
                  setExpandedQuestion(expandedQuestion === question.id ? '' : question.id)
                }
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 font-semibold text-sm border border-purple-500/30">
                    {qIndex + 1}
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your question here..."
                    value={question.questionText}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateQuestion(question.id, 'questionText', e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none text-sm font-medium"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuestion(question.id);
                    }}
                    className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all duration-300 border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Options - Expanded */}
              {expandedQuestion === question.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-4">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Answer Options
                  </p>
                  {question.options.map((option, oIndex) => (
                    <div
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                        option.isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => toggleCorrectOption(question.id, option.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          option.isCorrect
                            ? 'bg-emerald-500 border-emerald-400'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        {option.isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                      </button>
                      <span className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 font-medium text-xs">
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        value={option.text}
                        onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                        className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none text-sm"
                      />
                      
                    </div>
                  ))}
                 
                </div>
              )}
            </div>
          ))}

          {/* Add Question Button */}
          <button
            onClick={addNewQuestion}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20 border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 text-purple-300 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={validateAndSave}
            className="flex-1 cursor-pointer px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5 " />
            Save Questions ({questions.length})
          </button>
        </div>
      </div>
    </div>
  );
}
