/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Save, 
  Trash2, 
  AlertTriangle,
  BookOpen,
  FileText,
  Calculator,
  Languages,
  Compass,
  Briefcase,
  Music,
  Atom,
  Eye,
  Info
} from 'lucide-react';
import { StudyQuestState } from '../useStudyQuestState';

interface StudyGuideProps {
  state: StudyQuestState;
}

// Map icon name to React Component
const IconMap: Record<string, React.ReactNode> = {
  Book: <BookOpen className="w-5 h-5 text-emerald-400" />,
  Atom: <Atom className="w-5 h-5 text-blue-400" />,
  Calculator: <Calculator className="w-5 h-5 text-yellow-400" />,
  Globe: <Compass className="w-5 h-5 text-indigo-400" />,
  Languages: <Languages className="w-5 h-5 text-rose-400" />,
  Music: <Music className="w-5 h-5 text-purple-400" />,
};

const getSubjectIcon = (iconName?: string) => {
  if (iconName && IconMap[iconName]) {
    return IconMap[iconName];
  }
  return <FileText className="w-5 h-5 text-gray-400" />;
};

export function StudyGuide({ state }: StudyGuideProps) {
  const { guides, customSubjects, saveStudyGuide, deleteStudyGuide } = state;

  const [expandedSubject, setExpandedSubject] = useState<string | null>(customSubjects[0] || null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [examType, setExamType] = useState<string>('Standard Midterm');

  // AI loading per subject
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string>('');

  const handleEditStart = (subject: string, currentContent: string) => {
    setEditingSubject(subject);
    setEditingContent(currentContent || `# Study Guide for ${subject}\n\nType your notes or bullet points here...`);
  };

  const handleEditSave = async (subject: string) => {
    await saveStudyGuide(subject, editingContent);
    setEditingSubject(null);
  };

  const handleGenerateWithAI = async (subject: string) => {
    setLoadingSubject(subject);
    setErrorText('');

    try {
      const res = await fetch('/api/gemini/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          examType: examType || 'General Examination'
        })
      });

      if (!res.ok) {
        throw new Error('AI Engine failed to generate response');
      }

      const data = await res.json();
      if (data.content) {
        // Save to firestore
        await saveStudyGuide(subject, data.content, data.icon);
        // If editing this subject, sync editor
        if (editingSubject === subject) {
          setEditingContent(data.content);
        }
      } else {
        throw new Error('Invalid schema received from AI guide maker');
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Guide generation failed. Please verify your GEMINI_API_KEY.');
    } finally {
      setLoadingSubject(null);
    }
  };

  return (
    <div className="space-y-8" id="guides-tab">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-quest-surface p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-white flex items-center gap-2">
            Subject Study Guides
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Build a comprehensive repository of reference sheets. Author manually or draft core material using the Gemini generator.
          </p>
        </div>

        {/* Configurations selector for AI prompt */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Exam context for AI</label>
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="px-3 py-1.5 bg-quest-bg text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-quest-accent text-xs font-medium cursor-pointer"
          >
            <option value="AP Exam Review">AP Exams / SATs</option>
            <option value="Final Term Examinations">Final Terms</option>
            <option value="Standard Midterm">Midterms / Quizzes</option>
            <option value="Practical Lab Assessment">Practical/Lab Assessments</option>
          </select>
        </div>
      </div>

      {/* Accordion List wrapper */}
      <div className="space-y-4">
        {customSubjects.map((subject) => {
          const associatedGuide = guides.find(g => g.subject.toLowerCase() === subject.toLowerCase());
          const isExpanded = expandedSubject === subject;
          const isEditing = editingSubject === subject;
          const isLoading = loadingSubject === subject;

          const guideContent = associatedGuide?.content || '';

          return (
            <div 
              key={subject} 
              className={`bg-quest-card rounded-2xl border transition ${
                isExpanded ? 'border-gray-700 shadow-xl' : 'border-gray-800 hover:border-gray-750'
              }`}
            >
              {/* Accordion header line */}
              <div 
                onClick={() => {
                  setExpandedSubject(isExpanded ? null : subject);
                  setErrorText('');
                }}
                className="flex justify-between items-center p-5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-quest-bg rounded-xl border border-gray-850/65">
                    {getSubjectIcon(associatedGuide?.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{subject} Guides</h3>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {associatedGuide 
                        ? `Last updated: ${new Date(associatedGuide.lastUpdated).toLocaleDateString()}`
                        : 'No guide created yet'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quick stats tags */}
                  {associatedGuide ? (
                    <span className="hidden sm:inline-block text-[10px] bg-emerald-950/40 text-quest-accent border border-emerald-900/30 font-medium px-2.5 py-0.5 rounded-full font-mono">
                      Active
                    </span>
                  ) : (
                    <span className="hidden sm:inline-block text-[10px] bg-yellow-950/40 text-quest-gold border border-yellow-900/20 font-medium px-2.5 py-0.5 rounded-full font-mono">
                      Draft
                    </span>
                  )}

                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Accordion body content */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-gray-850"
                  >
                    <div className="p-6 space-y-4">
                      
                      {/* AI Error displayer */}
                      {errorText && (
                        <div className="p-3.5 bg-red-950/45 border border-red-800/35 text-red-400 rounded-xl flex items-center gap-2.5 text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{errorText}</span>
                        </div>
                      )}

                      {/* Header controls inside Expanded guide */}
                      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-850 pb-3">
                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <button
                              onClick={() => handleEditStart(subject, guideContent)}
                              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl cursor-pointer transition flex items-center gap-1.5"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Click to Edit Guide
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditSave(subject)}
                              className="px-3.5 py-1.5 bg-quest-accent hover:bg-quest-accent-hover text-white text-xs font-semibold rounded-xl cursor-pointer transition flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" /> Save Edits
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGenerateWithAI(subject)}
                            disabled={isLoading}
                            className="px-3.5 py-1.5 bg-quest-purple hover:bg-opacity-95 active:scale-95 text-white text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-purple-950/20"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Drafting Material...' : 'Generate with AI'}
                          </button>

                          {associatedGuide && (
                            <button
                              onClick={() => deleteStudyGuide(associatedGuide.id)}
                              className="p-1.5 text-gray-500 hover:text-quest-rose hover:bg-quest-rose/10 rounded-xl"
                              title="Delete Guide Draft"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Guide editable viewport content */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                            <Info className="w-3.5 h-3.5 text-quest-accent" /> Use raw text or markdown guidelines. Saves to Firebase when updated.
                          </div>
                          <textarea
                            rows={15}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full p-4 bg-quest-bg text-gray-100 border border-gray-800 rounded-xl focus:outline-none focus:border-quest-accent font-mono text-sm leading-relaxed"
                            placeholder="Draft your syllabus sheets..."
                          />
                        </div>
                      ) : (
                        <div className="bg-quest-bg/40 p-5 rounded-xl border border-gray-800/60 min-h-[14rem] max-h-[30rem] overflow-y-auto">
                          {isLoading ? (
                            <div className="space-y-4 py-8 text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-quest-accent mx-auto"></div>
                              <p className="text-gray-400 text-xs font-mono">
                                Gemini artificial intelligence is gathering references to construct study guides...
                              </p>
                            </div>
                          ) : guideContent ? (
                            <div className="markdown-body">
                              {/* Simple markdown conversion logic or pre rendering */}
                              {/* Standard raw markdown pre split line formatting */}
                              {guideContent.startsWith('#') || guideContent.includes('\n-') || guideContent.includes('\n*') ? (
                                <div className="space-y-2">
                                  {guideContent.split('\n').map((line, lIdx) => {
                                    if (line.startsWith('# ')) return <h1 key={lIdx} className="text-xl font-bold font-display text-white border-b border-gray-800 pb-1.5 mb-3">{line.replace('# ', '')}</h1>;
                                    if (line.startsWith('## ')) return <h2 key={lIdx} className="text-lg font-bold font-display text-white pt-2">{line.replace('## ', '')}</h2>;
                                    if (line.startsWith('### ')) return <h3 key={lIdx} className="text-base font-bold font-display text-white pt-1">{line.replace('### ', '')}</h3>;
                                    if (line.startsWith('- ') || line.startsWith('* ')) return <li key={lIdx} className="text-gray-300 ml-4 list-disc text-sm">{line.replace(/^[-*]\s+/, '')}</li>;
                                    if (line.trim() === '') return <div key={lIdx} className="h-2"></div>;
                                    return <p key={lIdx} className="text-gray-300 text-sm leading-relaxed">{line}</p>;
                                  })}
                                </div>
                              ) : (
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{guideContent}</p>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-16 space-y-3">
                              <BookOpen className="w-12 h-12 text-slate-800 mx-auto" />
                              <h4 className="text-sm font-semibold text-gray-400">Blank Reference Canvas</h4>
                              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                No content generated yet for this subject. Click &quot;Generate with AI&quot; to formulate guide files or write one manually using the edit panel.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

    </div>
  );
}
