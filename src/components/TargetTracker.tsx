/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Gauge, 
  AlertTriangle, 
  Trash2, 
  Clock, 
  Play, 
  CheckCircle, 
  Sparkles,
  RefreshCcw,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudyQuestState } from '../useStudyQuestState';
import { Target } from '../types';

interface TargetTrackerProps {
  state: StudyQuestState;
}

export function TargetTracker({ state }: TargetTrackerProps) {
  const { 
    targets, 
    createTarget, 
    updateTargetProgress, 
    updateTargetBreakdown, 
    deleteTarget 
  } = state;

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [breakingAIId, setBreakingAIId] = useState<string | null>(null);
  const [breakErrors, setBreakErrors] = useState<Record<string, string>>({});
  const [expandedBreakdowns, setExpandedBreakdowns] = useState<Record<string, boolean>>({});

  // Get current date formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    createTarget(title.trim(), dueDate);
    setTitle('');
    setDueDate('');
  };

  const handleBreakdownWithAI = async (target: Target) => {
    if (breakingAIId) return;
    setBreakingAIId(target.id);
    // Clear previous errors for this target
    setBreakErrors(prev => ({ ...prev, [target.id]: '' }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/some-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: target.title,
          dueDate: target.dueDate
        })
      });

      if (!res.ok) {
        throw new Error('Server returned an error');
      }

      const breakdown = await res.json();
      if (Array.isArray(breakdown)) {
        await updateTargetBreakdown(target.id, breakdown);
        // Auto expand
        setExpandedBreakdowns(prev => ({ ...prev, [target.id]: true }));
      } else {
        throw new Error('Invalid breakdown format received');
      }
    } catch (err: any) {
      console.error(err);
      setBreakErrors(prev => ({ 
        ...prev, 
        [target.id]: err.message || 'Error occurred. Please verify your GEMINI_API_KEY.' 
      }));
    } finally {
      setBreakingAIId(null);
    }
  };

  const toggleBreakdown = (id: string) => {
    setExpandedBreakdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8" id="targets-tab">
      
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-white">Academic Target Tracker</h1>
        <p className="text-gray-400 text-sm mt-1">
          Set ambitious learning destinations, break them into week-by-week roadmaps, and monitor milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Grid: Creator Column */}
        <div className="lg:col-span-4">
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800 space-y-4 sticky top-6">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Plus className="text-quest-accent w-4 h-4" /> Register Target
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase text-gray-400 font-mono tracking-wider">Target Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master AP Biology syllabus, Prepare for CS Exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-quest-bg text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-quest-accent text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase text-gray-400 font-mono tracking-wider">Due / Target Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-quest-bg text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-quest-accent text-sm font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-quest-accent hover:bg-quest-accent-hover text-white font-medium text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Target
              </button>
            </form>
          </div>
        </div>

        {/* Right Grid: Active Target Cards list */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
            <Gauge className="text-quest-purple w-4.5 h-4.5" /> Target Roadmap Board
          </h2>

          <div className="space-y-4">
            {targets.map((target) => {
              const overdue = todayStr > target.dueDate && target.progress < 100;
              const formattedDate = new Date(target.dueDate).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
              const isBreaking = breakingAIId === target.id;
              const hasBreakdown = target.weekBreakdown && target.weekBreakdown.length > 0;
              const expanded = expandedBreakdowns[target.id];

              return (
                <div 
                  key={target.id} 
                  className={`bg-quest-card p-6 rounded-2xl border transition ${
                    overdue 
                      ? 'border-red-900 shadow-[0_0_12px_rgba(244,63,94,0.1)]' 
                      : target.progress === 100 
                        ? 'border-emerald-900 bg-emerald-950/5' 
                        : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Top line detail */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {overdue && (
                          <span className="flex items-center gap-1 bg-red-950/60 text-quest-rose text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border border-red-800/20">
                            <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                          </span>
                        )}
                        {target.progress === 100 && (
                          <span className="flex items-center gap-1 bg-emerald-950/60 text-quest-accent text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border border-emerald-800/20">
                            <CheckCircle className="w-2.5 h-2.5" /> TASK COMPLETED
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-900 border border-gray-800/80 text-gray-400 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due: {formattedDate}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white mt-1 leading-normal">{target.title}</h3>
                    </div>

                    <button 
                      onClick={() => deleteTarget(target.id)}
                      className="text-gray-500 hover:text-quest-rose p-1.5 rounded-lg active:scale-95 transition cursor-pointer"
                      title="Remove Target"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Manual Progress Slider Section */}
                  <div className="mt-5 space-y-2 bg-quest-bg/40 p-4 rounded-xl border border-gray-800/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" /> Milestone progress
                      </span>
                      <span className="text-white font-mono font-bold font-display">{target.progress}% Complete</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={target.progress}
                      onChange={(e) => updateTargetProgress(target.id, Number(e.target.value))}
                      className="w-full accent-quest-accent h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* AI Planner breakdown button */}
                  <div className="mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <button
                      onClick={() => handleBreakdownWithAI(target)}
                      disabled={isBreaking}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-quest-purple/15 hover:bg-quest-purple/35 text-quest-purple hover:text-white font-medium text-xs rounded-xl border border-quest-purple/20 transition cursor-pointer disabled:opacity-50 shadow-md shadow-violet-950/10"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-quest-purple ${isBreaking ? 'animate-spin' : ''}`} />
                      {isBreaking ? 'Assembling roadmap...' : hasBreakdown ? 'Regenerate Breakdown' : 'Break this down with AI'}
                    </button>

                    {hasBreakdown && (
                      <button
                        onClick={() => toggleBreakdown(target.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 hover:bg-gray-850 text-gray-300 rounded-xl text-xs transition cursor-pointer"
                      >
                        {expanded ? (
                          <>Hide Roadmap <ChevronUp className="w-3.5 h-3.5" /></>
                        ) : (
                          <>Show Roadmap ({target.weekBreakdown?.length} Weeks) <ChevronDown className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    )}
                  </div>

                  {/* AI Breakdown Error Display */}
                  {breakErrors[target.id] && (
                    <div className="mt-3 p-3 bg-red-950/40 border border-red-800/30 text-red-400 rounded-xl flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{breakErrors[target.id]}</span>
                    </div>
                  )}

                  {/* AI Generated Roadmaps layout */}
                  <AnimatePresence>
                    {hasBreakdown && expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 border-t border-gray-850 pt-4 space-y-3"
                      >
                        <h4 className="text-[11px] font-mono uppercase tracking-wider text-quest-purple">Week-by-week Study Plan:</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {target.weekBreakdown?.map((item, i) => (
                            <div 
                              key={i} 
                              className="bg-quest-bg/60 p-3.5 rounded-xl border border-gray-800/80 space-y-2 hover:border-gray-850/80 transition"
                            >
                              <div className="flex justify-between items-center text-xs font-semibold text-white">
                                <span className="text-quest-accent">{item.week}</span>
                              </div>
                              <p className="text-[11.5px] font-semibold text-gray-200">{item.goal}</p>
                              <ul className="text-3xs space-y-1 text-gray-400 pl-4 list-disc font-sans leading-normal">
                                {item.tasks?.map((taskItem, tIdx) => (
                                  <li key={tIdx} className="text-gray-400 text-[11px]">{taskItem}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {targets.length === 0 && (
              <div className="text-center py-16 bg-quest-card/40 border border-dashed border-gray-800 rounded-2xl space-y-3">
                <BookOpen className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-gray-400">Target itinerary empty.</p>
                <p className="text-xs text-gray-500 font-mono max-w-sm mx-auto">Create academic targets like prepping for exams, reading manuals, or research goals inside the left panel.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
