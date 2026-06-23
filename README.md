# StudyQuest 🎮

I built StudyQuest because most study trackers I tried were basically glorified to-do lists — you check a box, nothing happens, motivation dies in a week. So I added a layer of game mechanics on top: coins for completing tasks, badges for milestones, a leaderboard to keep things competitive, and an AI study guide powered by Gemini that actually gives you direction instead of just tracking what you did.

It's built with React + TypeScript on the frontend, Firebase for auth and data, and Tailwind for styling. I kept the stack intentionally simple so I could focus on getting the gamification logic and AI integration right.

## What it does

When you sign up, you land on a dashboard that shows your progress across subjects. You add tasks, and completing them earns you coins — which feed into badges and your leaderboard rank. If you're stuck on what to study next or how to approach a topic, the AI study guide (Gemini API) gives you a tailored suggestion based on what you tell it. There's also a daily reminder system over Gmail so people don't just forget about their streak.

## How it's built

Firestore handles all the real-time data — user profiles, tasks, coin balances, badge progress. Firebase Auth takes care of sign-up and login. The study guide module calls the Gemini API directly with the user's input and returns a study suggestion in response. Styling is all Tailwind, kept minimal on purpose.

React + TypeScript + Vite on the frontend, Firebase (Auth + Firestore) on the backend, Gemini API for the AI piece.

## Running it locally

\`\`\`bash
git clone https://github.com/sneha0421/Study_quest.git
cd Study_quest
npm install
\`\`\`

You'll need your own Firebase project and a Gemini API key. Copy `.env.example` to `.env` and drop your keys in:

\`\`\`
VITE_FIREBASE_API_KEY=your_key
VITE_GEMINI_API_KEY=your_key
\`\`\`

Then run:

\`\`\`bash
npm run dev
\`\`\`
## What's next

I'm planning to add group study rooms, friend-based leaderboards, and streak bonuses next.
