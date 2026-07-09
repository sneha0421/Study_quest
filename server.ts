/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gemini API
const apiKey = process.env.GEMINI_API_KEY;
console.log("Key loaded:", apiKey ? apiKey.slice(0, 8) + "..." : "MISSING");
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// ==========================================
// 1. API: DASHBOARD INSIGHTS
// ==========================================
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { taskSummary, streak, targetProgress } = req.body;
    
    const prompt = `
      You are the StudyQuest Gamification Coach. Analyze the user's progress:
      - Tasks completed per subject in the last 7 days: ${JSON.stringify(taskSummary || {})}
      - Current study day streak: ${streak || 0} days
      - Academic target progress (active targets completion rates): ${JSON.stringify(targetProgress || [])}
      
      Generate a strengths and weaknesses panel summary.
      Provide:
      1. One positive strength (highly motivational, highlighting their active subject or streak).
      2. One or two explicit areas to improve (concrete study advice on laggy subjects or targets close to due date).
      
      You must respond with raw JSON in this exact structure:
      {
        "positiveStrength": "string description",
        "areasToImprove": "string description of things to focus on next"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: error.message || 'Failed to generate insights' });
  }
});

// ==========================================
// 2. API: TASK SUGGESTER
// ==========================================
app.post('/api/gemini/suggest-tasks', async (req, res) => {
  try {
    const { activeTargets, subjects } = req.body;

    const prompt = `
      You are an expert student tutor. Suggest 4 actionable study micro-tasks to help the student achieve their targets.
      - Student's current academic targets: ${JSON.stringify(activeTargets || [])}
      - Student's custom subjects: ${JSON.stringify(subjects || ['General'])}
      
      For each suggested task, propose:
      - name: clear task action (e.g., "Solve Chapter 3 kinematics questions", "Read 5 pages of biology notes")
      - subject: match one of the student's subjects or choose a relevant one.
      - coins: an integer coin value between 10 and 100 representing task difficulty.
      
      You must return a raw JSON array matching this structure:
      [
        { "name": "Task name", "subject": "Subject tag", "coins": 45 }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const text = response.text || '[]';
    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error('Error suggesting tasks:', error);
    res.status(500).json({ error: error.message || 'Failed to suggest tasks' });
  }
});

// ==========================================
// 3. API: TARGET BREAKDOWN
// ==========================================
app.post('/api/gemini/break-target', async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    const prompt = `
      You are an academic planner. Break down the user's major study target into a clean 4-week roadmap action plan.
      - Target Goal: "${title}"
      - Due Date: ${dueDate}
      
      For each of the 4 weeks, provide:
      - week: name of the week (e.g., "Week 1: Fundamentals", "Week 2: Deep Dive")
      - goal: major goal for this week
      - tasks: a JSON array of 3 actionable items to do.
      
      Return raw JSON matching this structure:
      [
        {
          "week": "Week 1: Title",
          "goal": "Week 1 objective",
          "tasks": ["Task 1", "Task 2", "Task 3"]
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '[]';
    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error('Error breaking down target:', error);
    res.status(500).json({ error: error.message || 'Failed to break down target' });
  }
});

// ==========================================
// 4. API: STUDY GUIDE GENERATOR
// ==========================================
app.post('/api/gemini/generate-guide', async (req, res) => {
  try {
    const { subject, examType } = req.body;

    const prompt = `
      Create an immersive and comprehensive study guide for the subject "${subject}"${examType ? ` preparing for "${examType}"` : ''}.
      Format the content beautifully in Markdown format complete with headers, bullet points, key equations, or review notes.
      Also pick a single word representing a Lucide React icon that represents the subject (e.g., "Book", "Atom", "Brain", "Calculator", "Globe", "Music", "Palette", "Languages" etc.).
      
      You must respond with raw JSON in this exact format:
      {
        "title": "Study Guide for ${subject}",
        "icon": "LucideIconName",
        "content": "detailed study guide markdown content here..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error('Error generating guide:', error);
    res.status(500).json({ error: error.message || 'Failed to generate guide' });
  }
});

// ==========================================
// 5. API: EMAIL GENERATOR (DAILY REMINDER)
// ==========================================
app.post('/api/reminders/generate-email', async (req, res) => {
  try {
    const { userName, pendingTasks, upcomingDeadlines, streak } = req.body;

    const prompt = `
      You are the personal StudyQuest gamified bot. Write an encouraging daily digest study reminder email to student user "${userName}".
      
      Student Status:
      - Pending Today's Study Tasks: ${JSON.stringify(pendingTasks || [])}
      - Upcoming Academic Targets / Deadlines: ${JSON.stringify(upcomingDeadlines || [])}
      - Current streak: ${streak || 0} days
      
      Guidance:
      - Keep it short, highly motivational, and under 150 words.
      - Mention their streak and coins potential.
      - Choose a friendly, academic greeting and an inspirational closing.
      - Use standard email formatting with clear sections.
      
      You must return raw JSON in this structure:
      {
        "subject": "StudyQuest Reminder: Keep your ${streak || 0}-day streak alive! 🔥",
        "body": "Markdown text for email body..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error('Error generating reminder email:', error);
    res.status(500).json({ error: error.message || 'Failed to generate reminder email' });
  }
});

// ==========================================
// Serve Vite frontend & Start Server
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyQuest server is running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to bootstrap StudyQuest server:', err);
});
