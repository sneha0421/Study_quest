/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Coins, 
  Flame, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Plus, 
  Activity, 
  Sparkles, 
  AlertTriangle,
  Brain,
  HelpCircle,
  Clock,
  Check
} from 'lucide-react';
import { StudyQuestState } from '../useStudyQuestState';
import { Task } from '../types';

interface DashboardProps {
  state: StudyQuestState;
}

export function Dashboard({ state }: DashboardProps) {
  const { 
    profile, 
    tasks, 
    targets, 
    customSubjects, 
    addSubject, 
    completeTask, 
    updateProfile 
  } = state;

  const [newSubject, setNewSubject] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // 1. Calculate General Progression metrics
  const totalCoins = profile?.totalCoins ?? 0;
  const currentStreak = profile?.streak ?? 1;
  const completedTasksCount = tasks.filter(t => t.completed).length;

  const activeTargets = targets.filter(t => t.progress < 100);
  const overallGoalProgress = targets.length > 0
    ? Math.round(targets.reduce((acc, t) => acc + t.progress, 0) / targets.length)
    : 0;

  // 2. Compute 14 Day Heatmap contributions
  // Map last 14 days (date string -> contribution count)
  const getContributionMap = () => {
    const map: Record<string, number> = {};
    const now = new Date();
    
    // Check completed tasks
    tasks.forEach(t => {
      if (t.completed && t.completedAt) {
        const dateStr = t.completedAt.split('T')[0];
        map[dateStr] = (map[dateStr] || 0) + 1;
      }
    });
    // Check active targets additions/milestones
    targets.forEach(t => {
      const dateStr = t.createdAt.split('T')[0];
      map[dateStr] = (map[dateStr] || 0) + 1;
    });

    return map;
  };

  const contributionMap = getContributionMap();
  
  // Array of last 14 days YYYY-MM-DD
  const getLast14Days = () => {
    const list = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      list.push(`${year}-${month}-${date}`);
    }
    return list;
  };

  const last14Days = getLast14Days();

  // 3. Subject-wise progress bars calculations
  // Progress = (Completed Tasks in Subject / Total Tasks in Subject) * 100
  // If no tasks, default to 0. Plus custom offset
  const getSubjectProgress = (subj: string) => {
    const list = tasks.filter(t => t.subject === subj);
    if (list.length === 0) return 0;
    const completed = list.filter(t => t.completed).length;
    return Math.round((completed / list.length) * 100);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim()) {
      addSubject(newSubject.trim());
      setNewSubject('');
    }
  };

  // 4. Trigger Gemini Insights via Backend Proxy
  const analyzeActivityWithGemini = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    setAnalysisError('');

    // Pre-calculate task completion distribution for the past 7 days
    const subjectWiseCompleted: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completed) {
        subjectWiseCompleted[t.subject] = (subjectWiseCompleted[t.subject] || 0) + 1;
      }
    });

    const targetProgressList = targets.map(t => ({ title: t.title, progress: t.progress, dueDate: t.dueDate }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gemini/insights`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskSummary: subjectWiseCompleted,
    streak: currentStreak,
    targetProgress: targetProgressList
    })
  });

      if (!res.ok) {
        throw new Error('Server returned error while analysis');
      }

      const data = await res.json();
      if (data.positiveStrength && data.areasToImprove) {
        const compiledText = `**Strength:** ${data.positiveStrength}\n\n**Growth Area:** ${data.areasToImprove}`;
        await updateProfile({ recentInsights: compiledText });
      } else {
        throw new Error('Invalid analysis payload from AI');
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Error occurred. Please verify your GEMINI_API_KEY.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Get tasks scheduled for today (or up to 5 non-completed tasks)
  const todayTasks = tasks.filter(t => !t.completed).slice(0, 5);

  return (
    <div className="space-y-8" id="dashboard-tab">
      
      {/* 1. Header Hero Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-quest-surface p-6 rounded-2xl border border-gray-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-white flex items-center gap-2">
            Welcome back, <span className="text-quest-accent">{profile?.displayName}</span>!
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            Your quests await. Ready to power up your brain parameters today?
          </p>
        </div>
        <button
          onClick={analyzeActivityWithGemini}
          disabled={analyzing}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-quest-purple to-quest-accent hover:opacity-90 active:scale-95 text-white font-medium rounded-xl text-sm transition shadow-lg disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing with AI...' : 'Analyze Progress with AI'}
        </button>
      </div>

      {/* 2. Key Metrics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-quest-card p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3.5 bg-yellow-950/40 rounded-xl text-quest-gold border border-yellow-800/30">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase text-gray-400 font-mono tracking-wider block">Wallet Balance</span>
            <span className="text-2xl font-bold font-display text-white mt-1 block">{totalCoins} <span className="text-xs text-quest-gold font-normal">coins</span></span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-quest-card p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-950/40 rounded-xl text-quest-accent border border-emerald-800/30">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs uppercase text-gray-400 font-mono tracking-wider block">Quest Streak</span>
            <span className="text-2xl font-bold font-display text-white mt-1 block">{currentStreak} <span className="text-xs text-quest-accent font-normal">days</span></span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-quest-card p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3.5 bg-violet-950/40 rounded-xl text-quest-purple border border-violet-800/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase text-gray-400 font-mono tracking-wider block">Quests Completed</span>
            <span className="text-2xl font-bold font-display text-white mt-1 block">{completedTasksCount} <span className="text-xs text-quest-purple font-normal">tasks</span></span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-quest-card p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3.5 bg-cyan-950/40 rounded-xl text-cyan-400 border border-cyan-800/30">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase text-gray-400 font-mono tracking-wider block">Target Rate</span>
            <span className="text-2xl font-bold font-display text-white mt-1 block">{overallGoalProgress}% <span className="text-xs text-cyan-400 font-normal">overall</span></span>
          </div>
        </div>
      </div>

      {/* 3. Core Panels Row: Heatmap & Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Grid Column 7: Left Column Custom Subjects & Heatmap */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. Subject Progression panel */}
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
                <TrendingUp className="text-quest-accent w-4 h-4" /> Subject progress
              </h2>
              
              {/* Manual Subject Adder form */}
              <form onSubmit={handleAddSubject} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Subject..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="px-3 py-1 bg-quest-bg text-white border border-gray-800 rounded-lg text-xs focus:outline-none focus:border-quest-accent"
                />
                <button
                  type="submit"
                  className="p-1 px-2.5 bg-quest-accent/20 text-quest-accent hover:bg-quest-accent/30 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-0.5" /> Add
                </button>
              </form>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {customSubjects.map((subject) => {
                const progress = getSubjectProgress(subject);
                return (
                  <div key={subject} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-gray-300">{subject}</span>
                      <span className="font-mono text-gray-400 font-bold">{progress}% complete</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-gray-800">
                      <div 
                        className="bg-gradient-to-r from-quest-accent to-emerald-400 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {customSubjects.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No custom subjects declared. Add one above.</p>
              )}
            </div>
          </div>

          {/* B. Heatmap tracker 2 weeks */}
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Activity className="text-quest-purple w-4 h-4" /> 14-Day Activity Heatmap
            </h2>
            <p className="text-xs text-gray-400">
              Visual ledger mapping completed study targets and quests:
            </p>

            <div className="flex items-center justify-between gap-2 overflow-x-auto py-2 bg-quest-bg/60 p-4 rounded-xl border border-gray-800/50">
              {last14Days.map((date) => {
                const count = contributionMap[date] || 0;
                // Calculate color intensity
                let opacityColor = 'bg-gray-900 border-gray-800'; // 0
                if (count === 1) opacityColor = 'bg-emerald-950 text-emerald-400 border-emerald-800/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
                if (count === 2) opacityColor = 'bg-emerald-800 text-emerald-200 border-emerald-700/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
                if (count >= 3) opacityColor = 'bg-quest-accent text-white border-white/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]';

                // Get label date representation (e.g. "May 24")
                const parsedDate = new Date(date);
                const displayLabel = parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                return (
                  <div key={date} className="flex flex-col items-center gap-1.5 flex-1 min-w-[44px]">
                    <span className="text-[10px] text-gray-500 font-mono">{displayLabel}</span>
                    <div 
                      title={`${count} Study quests/milestones on ${date}`}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${opacityColor} transition-all duration-300`}
                    >
                      {count > 0 ? `+${count}` : '0'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 items-center justify-end text-[10px] text-gray-500 pt-1 font-mono">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-gray-900 border border-gray-800 rounded"></div> 0 quests</div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-emerald-950 border border-emerald-800/40 rounded"></div> 1 study</div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-emerald-800 border border-emerald-700/50 rounded"></div> 2 study</div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-quest-accent rounded"></div> 3+ peak</div>
            </div>
          </div>

        </div>

        {/* Grid Column 5: Right Column Today's Quests & Coach Insights */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. Today's Pending Task Checklist */}
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-lg font-display font-medium text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-quest-accent w-4 h-4" /> High-Priority Quests
              </span>
              <span className="text-xs text-gray-500 font-mono font-bold">{todayTasks.length} pending</span>
            </h2>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-quest-bg/60 border border-gray-800/60 rounded-xl hover:border-gray-800 transition group"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => completeTask(task.id)}
                      className="w-5 h-5 rounded border border-gray-700 hover:border-quest-accent flex items-center justify-center text-transparent hover:text-quest-accent transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-quest-accent transition line-clamp-1">{task.name}</h4>
                      <span className="inline-block mt-1 text-[10px] bg-[#1d1f30] text-gray-400 px-1.5 py-0.5 rounded-md font-mono">{task.subject}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-mono font-bold text-quest-gold shrink-0">
                    +{task.coins} <Coins className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              ))}

              {todayTasks.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-800/50 rounded-xl">
                  <Check className="w-8 h-8 text-quest-accent/40 mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">All tasks complete or none added.</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">Head over to the Task Manager to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* B. Coach insights panel */}
          <div className="bg-quest-card p-6 rounded-2xl border border-gray-800 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Brain className="w-32 h-32 text-quest-purple" />
            </div>

            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Brain className="text-quest-purple w-4 h-4" /> AI Coach Assessment
            </h2>

            {analysisError && (
              <div className="p-3 bg-red-950/40 border border-red-800/30 text-red-400 rounded-xl flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{analysisError}</span>
              </div>
            )}

            <div className="text-xs space-y-3 bg-quest-bg/60 p-4 rounded-xl border border-gray-800/50 max-h-52 overflow-y-auto">
              {profile?.recentInsights ? (
                <div className="space-y-2 whitespace-pre-wrap leading-relaxed text-gray-300">
                  {profile.recentInsights.split('\n\n').map((paragraph, i) => {
                    const isStrength = paragraph.startsWith('**Strength:**');
                    return (
                      <p key={i} className="flex gap-2.5">
                        <span className="mt-1 shrink-0">
                          {isStrength ? (
                            <Check className="w-4 h-4 text-quest-accent" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-quest-gold" />
                          )}
                        </span>
                        <span>
                          {paragraph.replace('**Strength:**', '').replace('**Growth Area:**', '').trim()}
                        </span>
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <HelpCircle className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-gray-400">No profile assessment loaded.</p>
                  <p className="text-[10px] text-gray-500 font-mono">Click &quot;Analyze Progress with AI&quot; at the top to draft your insights with Gemini.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
