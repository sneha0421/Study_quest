/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  displayName: string;
  totalCoins: number;
  streak: number;
  gmail: string;
  reminderTimes: string[]; // e.g. ["07:00 AM", "09:00 PM"]
  remindersEnabled: boolean;
  recentInsights?: string; // AI generated strengths and weaknesses
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  name: string;
  subject: string;
  coins: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Target {
  id: string;
  userId: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  progress: number; // 0 - 100
  weekBreakdown?: { week: string; goal: string; tasks: string[] }[];
  createdAt: string;
}

export interface StudyGuide {
  id: string;
  userId: string;
  subject: string;
  content: string; // Markdown
  icon?: string;
  lastUpdated: string;
}

export interface CoinHistory {
  id: string;
  userId: string;
  taskName: string;
  coinsEarned: number;
  timestamp: string;
}

export interface EmailLog {
  id: string;
  userId: string;
  recipientEmail: string;
  subject: string;
  body: string; // Markdown
  sentAt: string;
  status: "Sent" | "Simulated" | "Failed";
}
