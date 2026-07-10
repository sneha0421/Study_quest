/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Coins, 
  FolderOpen, 
  BookOpen, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { StudyQuestState } from '../useStudyQuestState';

interface TaskManagerProps {
  state: StudyQuestState;
}

export function TaskManager({ state }: TaskManagerProps) {
  const { 
    tasks, 
    targets, 
    customSubjects, 
    createTask, 
    completeTask, 
    deleteTask 
  } = state;

  const [name, setName] = useState('');
  const [subject, setSubject] = useState(customSubjects[0] || 'General');
  const [coins, setCoins] = useState(30);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // AI Suggestions State
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{name: string, subject: string, coins: number}[]>([]);
  const [aiError, setAiError] = useState('');

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTask(name.trim(), subject, coins);
    setName('');
    setCoins(30);
  };

  // Trigger Gemini AI proxy on backend to suggest tasks
  const handleAISuggest = async () => {
    if (loadingAI) return;
    setLoadingAI(true);
    setAiError('');
    setAiSuggestions([]);

    const activeTargets = targets.filter(t => t.progress < 100).map(t => t.title);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/some-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeTargets,
          subjects: customSubjects
        })
      });

      if (!res.ok) {
        throw new Error('AI suggester endpoint returned an error.');
      }

      const list = await res.json();
      if (Array.isArray(list)) {
        setAiSuggestions(list);
      } else {
        throw new Error('Invalid suggested tasks data layout.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Failed to pull task recommendations. Ensure your GEMINI_API_KEY is configured.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAddSuggestedTask = (sName: string, sSub: string, sCoins: number) => {
    createTask(sName, sSub, sCoins);
    // Remove from suggestions list to indicate added
    setAiSuggestions(prev => prev.filter(item => !(item.name === sName && item.subject === sSub)));
  };

  // Filtered list of tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="space-y-8" id="tasks-tab">
      
      {/* Page Title & Backing */}
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-white">Study Quest Manager</h1>
        <p className="text-gray-400 text-sm mt-1">
          Create quests, configure difficulties, and complete challenges to claim your bounty of coins!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Grid: Task lists and additions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. Create Task Card */}
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800">
            <h2 className="text-lg font-display font-medium text-white mb-4 flex items-center gap-2">
              <Plus className="text-quest-accent w-4 h-4" /> Forge New Quest
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase text-gray-400 font-mono tracking-wider">Quest/Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish chemistry equation sets, read Chapter 2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-quest-bg text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-quest-accent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-gray-400 font-mono tracking-wider">Subject Tag</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-quest-bg text-gray-200 border border-gray-800 rounded-xl focus:outline-none focus:border-quest-accent text-sm"
                  >
                    {customSubjects.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase text-gray-400 font-mono tracking-wider flex justify-between">
                    <span>Reward Value</span>
                    <span className="text-quest-gold font-bold">{coins} Coins</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={coins}
                      onChange={(e) => setCoins(Number(e.target.value))}
                      className="w-full accent-quest-gold h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-quest-accent hover:bg-quest-accent-hover active:scale-[0.98] text-white font-medium text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10"
              >
                <Plus className="w-4 h-4" /> Add Quest
              </button>
            </form>
          </div>

          {/* B. Task List Card with Filters */}
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                <FolderOpen className="text-quest-purple w-4 h-4" /> Quest Registry
              </h2>
              
              {/* Filter Tabs */}
              <div className="flex p-0.5 bg-quest-bg border border-gray-800/80 rounded-lg text-xs font-mono">
                {(['pending', 'completed', 'all'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-md font-medium capitalize transition cursor-pointer ${
                      filter === tab 
                        ? 'bg-[#1e2338] text-white font-bold' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks listing list */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition ${
                      task.completed 
                        ? 'bg-quest-bg/20 border-gray-900 opacity-60' 
                        : 'bg-quest-bg/65 border-gray-850 hover:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {task.completed ? (
                        <div className="w-5 h-5 rounded bg-emerald-950/40 border border-quest-accent/40 flex items-center justify-center text-quest-accent font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <button
                          onClick={() => completeTask(task.id)}
                          title="Complete and Claim Reward!"
                          className="w-5 h-5 rounded border border-gray-750 hover:border-quest-accent flex items-center justify-center text-transparent hover:text-quest-accent transition cursor-pointer shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div>
                        <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                          {task.name}
                        </h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] bg-[#1a1c2c] text-gray-400 px-1.5 py-0.5 rounded-md font-mono border border-gray-800/40">
                            {task.subject}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Added {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-xs font-mono font-bold text-quest-gold">
                        +{task.coins} <Coins className="w-3.5 h-3.5 ml-1" />
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete Quest"
                        className="text-gray-500 hover:text-quest-rose active:scale-95 transition cursor-pointer p-1 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTasks.length === 0 && (
                <div className="text-center py-10 border border-dashed border-gray-800 rounded-xl space-y-2">
                  <HelpCircle className="w-10 h-10 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">No matching quests found in registry.</p>
                  <p className="text-[10px] text-gray-500 font-mono">Create an manually entered quest above or fetch from AI Coach suggestions!</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Grid: AI Suggestions Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                <Sparkles className="text-quest-purple w-4 h-4" /> AI Suggested Quests
              </h2>
              <button
                onClick={handleAISuggest}
                disabled={loadingAI}
                className="px-3.5 py-1.5 bg-quest-purple/15 hover:bg-quest-purple/25 text-quest-purple border border-quest-purple/30 rounded-xl text-xs font-medium cursor-pointer transition disabled:opacity-50"
              >
                {loadingAI ? 'Calculating...' : 'Suggest with AI'}
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Based on your active targets and study profiles, Gemini can suggest specific daily targets. Click on suggestions to append to list:
            </p>

            {aiError && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/30 text-red-400 rounded-xl flex gap-2 text-xs">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="space-y-3">
              {loadingAI && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-quest-bg/50 p-4 border border-gray-800 rounded-xl space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-850 rounded w-1/5"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {aiSuggestions.map((suggest, index) => (
                <div 
                  key={index} 
                  className="bg-quest-bg/60 p-4 border border-gray-800/80 rounded-xl space-y-3 hover:border-gray-700 transition"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-normal">{suggest.name}</h4>
                    <span className="inline-block mt-1 text-[10px] bg-slate-900 border border-gray-800 text-gray-300 px-1.5 py-0.5 rounded-md font-mono">
                      {suggest.subject}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-800/60 pt-2.5">
                    <span className="text-[10px] text-quest-gold font-mono font-bold flex items-center">
                      Reward: +{suggest.coins} <Coins className="w-3 h-3 ml-0.5" />
                    </span>
                    <button
                      onClick={() => handleAddSuggestedTask(suggest.name, suggest.subject, suggest.coins)}
                      className="px-2.5 py-1 bg-quest-accent hover:bg-quest-accent-hover text-white text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Quest
                    </button>
                  </div>
                </div>
              ))}

              {aiSuggestions.length === 0 && !loadingAI && (
                <div className="text-center py-8 bg-quest-bg/40 border border-gray-850 rounded-xl space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-gray-400 text-xs font-semibold">Ready for directives.</p>
                  <p className="text-[10px] text-gray-500 font-mono">Click &quot;Suggest with AI&quot; to prompt Gemini.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
