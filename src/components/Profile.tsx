/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Coins, 
  Trophy, 
  Activity, 
  Brain, 
  Edit3, 
  Check, 
  Sparkles,
  Award,
  Calendar,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { StudyQuestState } from '../useStudyQuestState';

interface ProfileProps {
  state: StudyQuestState;
}

export function Profile({ state }: ProfileProps) {
  const { profile, tasks, targets, updateProfile } = state;

  const [username, setUsername] = useState(profile?.displayName || 'Hero Student');
  const [editing, setEditing] = useState(false);

  // 1. Level calculations
  const totalCoins = profile?.totalCoins ?? 0;
  const currentStreak = profile?.streak ?? 1;
  const currentLevel = Math.floor(totalCoins / 150) + 1;
  const coinsForCurrentLevel = (currentLevel - 1) * 150;
  const progressTowardsNextLevel = Math.round(((totalCoins - coinsForCurrentLevel) / 150) * 100);

  // 2. Heatmap Visual calculations (14 days)
  const getDailyHeatmap = () => {
    // Generate dates
    const list = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      list.push(d.toISOString().split('T')[0]);
    }

    // Map contributions
    const countMap: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.completed && t.completedAt) {
        const dStr = t.completedAt.split('T')[0];
        countMap[dStr] = (countMap[dStr] || 0) + 1;
      }
    });
    targets.forEach(t => {
      const dStr = t.createdAt.split('T')[0];
      countMap[dStr] = (countMap[dStr] || 0) + 1;
    });

    return list.map(date => ({
      date,
      count: countMap[date] || 0,
      label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));
  };

  const heatmapData = getDailyHeatmap();

  const handleSaveName = async () => {
    if (username.trim()) {
      await updateProfile({ displayName: username.trim() });
      setEditing(false);
    }
  };

  return (
    <div className="space-y-8" id="profile-tab">
      
      {/* Title page */}
      <div>
        <h1 className="text-2xl font-display font-semibold tracking-tight text-white">Student Study Portal</h1>
        <p className="text-slate-400 text-sm mt-1">
          Customize your study avatar credentials, track visual contributions, and review diagnostic advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile edit info */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex flex-col items-center text-center p-4 bg-white/5 rounded-2xl border border-white/5 relative">
            <div className="w-18 h-18 rounded-full bg-slate-900 border-2 border-blue-400 flex items-center justify-center relative shadow-lg shadow-blue-500/10">
              <User className="w-9 h-9 text-blue-400" />
              <div className="absolute -bottom-1 -right-1 bg-purple-500 border border-white/10 text-white rounded-full w-6 h-6 flex items-center justify-center font-mono font-bold text-[10px]">
                {currentLevel}
              </div>
            </div>

            <div className="mt-4 w-full">
              {editing ? (
                <div className="flex gap-2 items-center justify-center max-w-xs mx-auto">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-3 py-1 bg-white/5 text-white border border-white/10 focus:outline-none focus:border-blue-400 rounded-lg text-sm text-center font-semibold"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition-transform cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-lg font-bold font-display text-white">{profile?.displayName}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <span className="text-xs text-slate-450 font-mono block mt-1">STUDENT CREDENTIALS ID: {profile?.uid?.substring(0, 10)}...</span>
            </div>
          </div>

          {/* Level Scale meter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Rank Progression Goal</span>
              <span className="text-amber-450 font-mono font-bold">Lvl {currentLevel} &rarr; Lvl {currentLevel + 1}</span>
            </div>
            <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2.5 rounded-full"
                style={{ width: `${progressTowardsNextLevel}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono text-center">Accumulate {150 - (totalCoins - coinsForCurrentLevel)} more coins on study targets to reach level {currentLevel + 1}!</p>
          </div>

          {/* Inline mini scorecard */}
          <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-white/5">
            <div className="bg-white/5 p-3.5 border border-white/5 rounded-2xl space-y-1 block">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest block">Wallet XP Balance</span>
              <span className="text-base font-bold font-display text-white mt-1 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> {totalCoins} <span className="text-[10px] text-slate-500 font-normal">pts</span>
              </span>
            </div>
            <div className="bg-white/5 p-3.5 border border-white/5 rounded-2xl space-y-1 block">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest block">Active Streak</span>
              <span className="text-base font-bold font-display text-white mt-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-blue-400" /> {currentStreak} <span className="text-[10px] text-slate-500 font-normal">days</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Heatmap and full assessments */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Heatmap block */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Activity className="text-blue-400 w-4.5 h-4.5" /> Lifetime Contribution Matrix (14 days)
            </h2>
            <p className="text-xs text-slate-400">
              Saturating frequency maps compiling tasks done and targets updated:
            </p>

            <div className="grid grid-cols-7 gap-3 py-2 bg-white/5 p-4 rounded-2xl border border-white/5">
              {heatmapData.map((day) => {
                const count = day.count;
                let intensityColor = 'bg-black/30 border-white/5'; // 0
                if (count === 1) intensityColor = 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400';
                if (count === 2) intensityColor = 'bg-emerald-800/40 border-emerald-700/40 text-emerald-150';
                if (count >= 3) intensityColor = 'bg-blue-500 text-white border-white/10';

                return (
                  <div 
                    key={day.date} 
                    className="flex flex-col items-center gap-1.5 p-1 border border-transparent hover:border-white/10 rounded-lg group cursor-pointer transition-all"
                  >
                    <span className="text-[9px] text-slate-500 font-mono leading-none">{day.label}</span>
                    <div 
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-mono font-bold text-xs border ${intensityColor}`}
                      title={`${count} quest milestones on ${day.date}`}
                    >
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assessment display details */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
              <Brain className="text-purple-400 w-4.5 h-4.5" /> AI Diagnostic Dashboard Assessment
            </h2>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
              {profile?.recentInsights ? (
                <div className="space-y-3.5 whitespace-pre-wrap leading-relaxed text-xs text-slate-300">
                  {profile.recentInsights.split('\n\n').map((paragraph, idx) => {
                    const isStrength = paragraph.startsWith('**Strength:**');
                    return (
                      <div key={idx} className="flex gap-3 leading-relaxed">
                        <div className="mt-1 shrink-0">
                          {isStrength ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-white block mb-0.5">{isStrength ? 'Dynamic Strength Profile' : 'Target Growth Assessment'}</span>
                          <span className="text-slate-350">{paragraph.replace('**Strength:**', '').replace('**Growth Area:**', '').trim()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <Brain className="w-8 h-8 text-slate-650 mx-auto" />
                  <p className="text-slate-400 text-xs">No profile assessments found on student server records.</p>
                  <p className="text-[10px] text-slate-500 font-mono">Head over to the Dashboard and click &quot;Analyze Progress with AI&quot; to gather assessment parameters!</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
