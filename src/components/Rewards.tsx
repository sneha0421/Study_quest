/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Mail, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  AlertCircle,
  FileCheck,
  Send,
  Trophy,
  History,
  Zap,
  Info
} from 'lucide-react';
import { StudyQuestState } from '../useStudyQuestState';
import { EmailLog } from '../types';

interface RewardsProps {
  state: StudyQuestState;
}

export function Rewards({ state }: RewardsProps) {
  const { 
    profile, 
    tasks, 
    targets, 
    coinLog, 
    emailLogs, 
    updateProfile, 
    addEmailLog 
  } = state;

  const [gmail, setGmail] = useState(profile?.gmail || '');
  const [newTime, setNewTime] = useState('08:00');
  const [newAmpm, setNewAmpm] = useState('AM');
  const [remindersEnabled, setRemindersEnabled] = useState(profile?.remindersEnabled ?? true);
  
  // Simulation triggers
  const [testingEmail, setTestingEmail] = useState(false);
  const [testMailResult, setTestMailResult] = useState<{subject: string, body: string} | null>(null);
  const [testMailError, setTestMailError] = useState('');

  // 1. Calculate Level & Progress toward next level
  // Let's declare each 150 coins as a level upgrade
  const totalCoins = profile?.totalCoins ?? 0;
  const currentLevel = Math.floor(totalCoins / 150) + 1;
  const coinsForCurrentLevel = (currentLevel - 1) * 150;
  const progressTowardsNextLevel = Math.round(((totalCoins - coinsForCurrentLevel) / 150) * 100);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gmail.trim()) {
      await updateProfile({ gmail: gmail.trim() });
    }
  };

  const handleToggleActive = async (val: boolean) => {
    setRemindersEnabled(val);
    await updateProfile({ remindersEnabled: val });
  };

  const handleAddTime = async () => {
    if (!profile) return;
    const timeString = `${newTime} ${newAmpm}`;
    const list = profile.reminderTimes || [];
    if (!list.includes(timeString)) {
      const updatedList = [...list, timeString];
      await updateProfile({ reminderTimes: updatedList });
    }
  };

  const handleRemoveTime = async (time: string) => {
    if (!profile) return;
    const list = profile.reminderTimes || [];
    const updatedList = list.filter(t => t !== time);
    await updateProfile({ reminderTimes: updatedList });
  };

  // 2. Trigger Gemini Dynamic Daily Reminders pipeline
  const simulateHourlyReminderCron = async () => {
    if (testingEmail) return;
    setTestingEmail(true);
    setTestMailError('');
    setTestMailResult(null);

    const pendingToday = tasks.filter(t => !t.completed).map(t => t.name);
    const deadlines = targets.filter(t => t.progress < 100).map(t => `${t.title} (Due: ${t.dueDate})`);
    const streak = profile?.streak || 1;
    const userName = profile?.displayName || 'Hero';
    const emailTo = profile?.gmail || 'kesarwanisneha26@gmail.com';

    try {
      const res = await fetch('/api/reminders/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          pendingTasks: pendingToday,
          upcomingDeadlines: deadlines,
          streak
        })
      });

      if (!res.ok) {
        throw new Error('Backend failed to package Gemini reminder compilation');
      }

      const rawEmail = await res.json();
      if (rawEmail.subject && rawEmail.body) {
        setTestMailResult(rawEmail);
        // Save reminder log to Firebase Firestore
        await addEmailLog(rawEmail.subject, rawEmail.body, emailTo);
      } else {
        throw new Error('Invalid schema format from email generator');
      }
    } catch (err: any) {
      console.error(err);
      setTestMailError(err.message || 'Error occurred. Please verify your GEMINI_API_KEY.');
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="space-y-8" id="rewards-tab">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Level Stats card */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy className="w-32 h-32 text-amber-500" />
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Gamified Rank</span>
              <h2 className="text-xl font-display font-medium text-white flex items-center gap-1.5">
                <Trophy className="text-amber-500 w-5 h-5" /> Explorer Level {currentLevel}
              </h2>
            </div>
            <span className="inline-block px-3 py-1 bg-white/10 text-amber-400 border border-white/10 font-semibold rounded-lg font-mono text-xs">
              {totalCoins} XP
            </span>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Progress to level {currentLevel + 1}</span>
              <span className="text-white font-bold">{progressTowardsNextLevel}%</span>
            </div>
            <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressTowardsNextLevel}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Unlock next Level with every 150 coins accumulated in quests!</p>
          </div>
        </div>

        {/* Reminders engine control board */}
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <h2 className="text-lg font-display font-medium text-white flex items-center justify-between">
            <span className="flex items-center gap-2"><Mail className="text-blue-400 w-4.5 h-4.5" /> GMAIL Reminders schedules</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={remindersEnabled} 
                onChange={(e) => handleToggleActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
            </div>
          </h2>

          <form onSubmit={handleSaveContact} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="e.g. MyGmailAddress@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-white/5 text-slate-200 border border-white/10 rounded-lg focus:outline-none focus:border-blue-400 text-xs font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white text-blue-400 font-semibold text-xs rounded-lg transition-all cursor-pointer"
            >
              Update Email
            </button>
          </form>

          {/* Schedule adder */}
          <div className="flex gap-2 items-center pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-lg border border-white/10">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-transparent text-xs text-white border-none outline-none font-mono"
              />
              <select
                value={newAmpm}
                onChange={(e) => setNewAmpm(e.target.value)}
                className="bg-transparent text-xs text-slate-400 border-none outline-none"
              >
                <option value="AM" className="bg-slate-900 text-white">AM</option>
                <option value="PM" className="bg-slate-900 text-white">PM</option>
              </select>
            </div>
            
            <button
              onClick={handleAddTime}
              className="px-3.5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-white border border-purple-500/20 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1 flex-1 justify-center"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reminder Schedule
            </button>
          </div>

          {/* List schedules */}
          <div className="flex flex-wrap gap-2 pt-1 max-h-24 overflow-y-auto">
            {profile?.reminderTimes?.map((time) => (
              <span 
                key={time} 
                className="inline-flex items-center gap-1 bg-white/10 border border-white/10 text-[10.5px] font-mono px-2.5 py-1 rounded-lg text-slate-300"
              >
                <Clock className="w-3 h-3 text-purple-400" /> {time}
                <button 
                  onClick={() => handleRemoveTime(time)}
                  className="text-slate-500 hover:text-red-400 ml-1 shrink-0 p-0.5 rounded cursor-pointer transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
            {(!profile?.reminderTimes || profile.reminderTimes.length === 0) && (
              <span className="text-[10px] text-slate-500 font-mono">No reminder schedules registered. Add one above.</span>
            )}
          </div>
        </div>

      </div>

      {/* Reminders testing and output block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Email remind Simulator & testing log */}
        <div className="lg:col-span-4 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <h2 className="text-lg font-display font-medium text-white flex items-center gap-2">
            <Zap className="text-purple-400 w-4.5 h-4.5" /> Simulation Core
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Since active crons run on an hourly cycle, you can click below to immediately trigger Gemini to packages pending study guidelines, outstanding targets and deadlines into an email alert!
          </p>

          <button
            onClick={simulateHourlyReminderCron}
            disabled={testingEmail}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium text-xs rounded-xl cursor-pointer shadow-lg disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <Sparkles className={`w-3.5 h-3.5 ${testingEmail ? 'animate-spin' : ''}`} />
            {testingEmail ? 'Packaging email templates...' : 'Simulate & Send Daily Email'}
          </button>

          {testMailError && (
            <div className="p-3.5 bg-red-950/45 border border-red-800/35 text-red-400 rounded-xl flex gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{testMailError}</span>
            </div>
          )}

          {/* Test reminder body container view */}
          <AnimatePresence>
            {testMailResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3"
              >
                <div className="flex gap-2 items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 pb-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-400" /> Generated email payload
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">SUBJECT:</span>
                  <p className="text-xs font-semibold text-white mt-0.5">{testMailResult.subject}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">DRAFT:</span>
                  <div className="text-xs text-slate-300 mt-1 pl-3 border-l-2 border-purple-500/55 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed py-0.5 font-sans">
                    {testMailResult.body}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Split Table Logs */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Notification logs box */}
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-display font-semibold text-white flex items-center gap-1.5">
                <History className="text-blue-400 w-4 h-4" /> Notification Logs
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Stream status</span>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-[11px] text-left text-slate-200">
                <thead className="bg-white/5 text-slate-400 font-mono uppercase text-[8px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200 line-clamp-1">{log.subject}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-bold text-[8px] uppercase">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {emailLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-500 font-mono text-[10px]">No alerts logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* XP Bounty transaction log logs box */}
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-display font-semibold text-white flex items-center gap-1.5">
                <Coins className="text-amber-400 w-4 h-4" /> XP Bounty Ledger
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Active balance ledger</span>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-[11px] text-left text-slate-200">
                <thead className="bg-white/5 text-slate-400 font-mono uppercase text-[8px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Study Quest Title</th>
                    <th className="px-4 py-2.5 text-right">Bounty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {coinLog.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200 line-clamp-1">{log.taskName}</td>
                      <td className="px-4 py-3 text-right text-amber-400 font-mono font-bold whitespace-nowrap">
                        +{log.coinsEarned} XP
                      </td>
                    </tr>
                  ))}
                  {coinLog.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-500 font-mono text-[10px]">No quest bounties claimed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
