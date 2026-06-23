# StudyQuest 🎮📚

A gamified study tracker that turns daily learning into a game — earn coins, unlock badges, climb the leaderboard, and stay consistent with AI-powered guidance.

## Why I built this

Most study trackers feel like glorified to-do lists. I wanted something that actually keeps you motivated day after day — so I added game mechanics (coins, badges, leaderboard) on top of a real task & progress system, and used the Gemini API to give students contextual study guidance instead of generic tips.

## Features

- 🎯 **Task Manager** — create tasks, complete them, earn coin rewards
- 🏆 **Badges & Leaderboard** — unlock achievements and compete with others
- 📊 **Dashboard** — visual progress tracking across all your subjects
- 🤖 **AI Study Guide** — Gemini-powered suggestions tailored to what you're studying
- 🔔 **Daily Reminders** — Gmail-based nudges so you don't break your streak

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend/Auth | Firebase (Authentication + Firestore) |
| AI | Google Gemini API |

## Architecture

- **Firestore** stores user profiles, tasks, coins, and badge progress in real time
- **Firebase Auth** handles secure sign-up/login
- **Gemini API** is called from the study guide module to generate personalized study tips based on user input
- Daily reminder emails are triggered via Gmail integration to re-engage users

## Getting Started

```bash
git clone https://github.com/sneha0421/Study_quest.git
cd Study_quest
npm install
```

Create a `.env` file (use `.env.example` as reference) and add your keys:
