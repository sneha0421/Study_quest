/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  BookOpen, 
  Trophy, 
  UserCircle, 
  LogOut, 
  Sparkles, 
  Coins, 
  Flame,
  Brain,
  ShieldCheck,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import { useStudyQuestState } from '../useStudyQuestState';
import { loginWithGoogle, logoutUser } from '../firebase';

// Import Views
import { Dashboard } from './Dashboard';
import { TaskManager } from './TaskManager';
import { TargetTracker } from './TargetTracker';
import { StudyGuide } from './StudyGuide';
import { Rewards } from './Rewards';
import { Profile } from './Profile';

type TabType = 'dashboard' | 'tasks' | 'targets' | 'guides' | 'rewards' | 'profile';

export function Layout() {
  const state = useStudyQuestState();
  const { user, loading, profile } = state;
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-quest-bg flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-quest-accent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="w-4 h-4 text-quest-purple animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 text-xs font-mono tracking-wider uppercase animate-pulse">Syncing quest matrices...</p>
      </div>
    );
  }

  // 1. Unauthenticated Landing View
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col justify-between text-slate-100 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/25 rounded-full blur-[130px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/25 rounded-full blur-[130px] pointer-events-none"></div>

        {/* Simple navigation navbar */}
        <header className="px-6 md:px-12 py-5 flex justify-between items-center border-b border-white/10 bg-white/5 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/10">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Study<span className="text-blue-400">Quest</span>
            </span>
          </div>

          <button
            onClick={loginWithGoogle}
            className="px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 hover:opacity-90 active:scale-95 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Initiate Study
          </button>
        </header>

        {/* Hero Landing body */}
        <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center space-y-8 flex-1 flex flex-col justify-center z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-semibold text-blue-400 mx-auto font-mono uppercase tracking-wider animate-bounce">
            <Sparkles className="w-3 h-3 text-blue-400" /> Powered by Google Gemini AI
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight text-white leading-tight">
              Gamify Your Study Routine, <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Power Up Your Brain Parameters.</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              StudyQuest converts academic milestones into rewarding daily challenges. Forge custom objectives, break them into AI roadmaps, build subject guides, and get motivational notifications on Gmail.
            </p>
          </div>

          {/* Social Proof metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 md:pt-8 text-left">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-bold font-display text-white">100%</span>
              <p className="text-xs text-slate-400 mt-1">Gamified Motivation</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-bold font-display text-blue-400 flex items-center gap-1">
                <Coins className="w-5 h-5 text-amber-500" /> Gold
              </span>
              <p className="text-xs text-slate-400 mt-1">Completed Quest Bounty</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-bold font-display text-purple-400 flex items-center gap-1">
                <Brain className="w-5 h-5 text-purple-400" /> AI
              </span>
              <p className="text-xs text-slate-400 mt-1">Syllabus Guide Builder</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-bold font-display text-white flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-400" /> Streaks
              </span>
              <p className="text-xs text-slate-400 mt-1">Keep Daily Fire Burning</p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={loginWithGoogle}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-95 text-white font-medium text-sm rounded-xl cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98] transition inline-flex items-center gap-2"
            >
              Log in with Google to Start <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-wider flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Secured by Firebase Firestore Persistence
            </p>
          </div>

        </main>

        <footer className="py-6 text-center border-t border-white/10 text-xs text-gray-650 font-mono z-10">
          StudyQuest Study Portal &bull; Designed with Space Grotesk and JetBrains Mono
        </footer>

      </div>
    );
  }

  // 2. Authenticated Dashboard Layout with Sidebar Navigation
  return (
    <div className="min-h-screen bg-[#050508] text-slate-100 flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white/5 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between p-6 shrink-0 z-10">
        
        {/* Brand / Profile section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between md:justify-start gap-3 border-b border-white/10 pb-5 md:pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BookMarked className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white leading-none">
                Study<span className="text-blue-400">Quest</span>
              </span>
            </div>
            
            {/* Simple profile indicator in sidebar mobile */}
            <div className="flex md:hidden items-center gap-2 bg-white/10 px-2.5 py-1 rounded-lg border border-white/5">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-white font-mono">{profile?.totalCoins ?? 0}</span>
            </div>
          </div>

          {/* Quick Active Student Info card in sidebar desktop */}
          <div className="hidden md:flex items-center gap-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-slate-755 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-xs shrink-0 font-mono">
              ★
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-white truncate">{profile?.displayName}</h4>
              <div className="flex gap-2 items-center mt-1">
                <span className="text-[10px] text-amber-400 font-bold font-mono">XP: {profile?.totalCoins ?? 0}</span>
                <span className="text-[10px] text-blue-400 font-bold font-mono flex items-center gap-0.5"><Flame className="w-2.5 h-2.5" /> {profile?.streak ?? 1}</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-white/10 border border-white/5 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'tasks' 
                  ? 'bg-white/10 border border-white/5 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <CheckSquare className="w-4 h-4" /> Quest Manager
            </button>

            <button
              onClick={() => setActiveTab('targets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'targets' 
                  ? 'bg-white/10 border border-white/5 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Target className="w-4 h-4" /> Target Tracker
            </button>

            <button
              onClick={() => setActiveTab('guides')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'guides' 
                  ? 'bg-white/10 border border-white/5 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Study Guides
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'rewards' 
                  ? 'bg-white/10 border border-white/5 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Trophy className="w-4 h-4" /> Rewards &amp; Reminders
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'profile' 
                  ? 'bg-white/10 border border-white/5 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <UserCircle className="w-4 h-4" /> Student Profile
            </button>
          </nav>
        </div>

        {/* Logout section */}
        <div className="pt-4 border-t border-white/10 mt-4 md:mt-0">
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium rounded-xl cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout Session
          </button>
        </div>

      </aside>

      {/* CORE DISPLAY WINDOW VIEWPORTS */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto z-10">
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && <Dashboard state={state} />}
          {activeTab === 'tasks' && <TaskManager state={state} />}
          {activeTab === 'targets' && <TargetTracker state={state} />}
          {activeTab === 'guides' && <StudyGuide state={state} />}
          {activeTab === 'rewards' && <Rewards state={state} />}
          {activeTab === 'profile' && <Profile state={state} />}
        </div>
      </main>

    </div>
  );
}
