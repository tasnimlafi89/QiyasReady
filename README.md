# 🎯 QiyasReady — AI-Powered Qiyas Exam Preparation Platform

<div align="center">

![QiyasReady](https://img.shields.io/badge/QiyasReady-v1.0-8b4dff?style=for-the-badge)
![MERN](https://img.shields.io/badge/Stack-MERN-10b981?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Claude-f59e0b?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**منصة ذكية ومتقدمة للتحضير لاختبارات قياس**

*AI-powered adaptive learning platform for Qiyas exam preparation*

[العرض التجريبي](#demo) • [المميزات](#features) • [التثبيت](#installation) • [التقنيات](#tech-stack)

</div>

---

## 🌟 Overview

**QiyasReady** is a premium, AI-powered SaaS platform designed to help Saudi students achieve their highest potential scores on the Qiyas (قياس) standardized aptitude test — the gateway to university admission in Saudi Arabia.

The platform combines **adaptive learning algorithms (IRT)**, **AI-powered tutoring (Claude)**, **gamification**, and **real-time analytics** into a unified, premium experience available on both web and mobile.

---

## ✨ Features

### 🎯 Core Features
- **Adaptive Testing Engine** — IRT (Item Response Theory) based question selection
- **AI Study Plan Generator** — Personalized day-by-day study schedule
- **AI Tutor Chat** — Claude-powered 24/7 tutoring assistant
- **Mock Exams** — Realistic exam simulations with timer
- **Practice by Category** — Targeted practice on specific topics
- **Diagnostic Test** — Initial assessment to determine ability level

### 📊 Analytics & Tracking
- **Real-time Progress Dashboard** — Track scores, streaks, and XP
- **Weakness Detection** — AI identifies and targets weak areas
- **Score Prediction** — ML-based Qiyas score prediction
- **Performance Trends** — Visual progress over time

### 🏆 Gamification
- **XP & Levels** — Earn points for every action
- **Daily Streaks** — Maintain consistency motivation
- **Achievements & Badges** — Unlock rewards for milestones
- **Global Leaderboard** — Compete with other students

### 🔒 Anti-Cheat System
- **Tab Switch Detection** — Monitors window focus during exams
- **Copy-Paste Prevention** — Blocks clipboard during exams
- **Session Integrity** — Validates exam timing and submission
- **Trust Score** — Algorithmic trust assessment

### 🏗️ Platform
- **Multi-language** — Arabic-first with English support (RTL)
- **Dark Mode** — Premium dark theme by default
- **SaaS Subscription** — Free, Pro, and Premium plans
- **Admin Dashboard** — Full platform management
- **Mobile App** — React Native Expo (iOS + Android)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Auth** | Clerk (SSO, Social Login, JWT) |
| **AI** | Anthropic Claude API |
| **Mobile** | React Native Expo |
| **Algorithms** | IRT 3PL Model (adaptive testing) |
| **State** | Zustand |
| **Charts** | Recharts |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account
- Anthropic API key

### 1. Clone & Setup

```bash
git clone https://github.com/your-repo/qiyasready.git
cd qiyasready
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed    # Seed database with questions
npm run dev     # Start API server on port 5000
```

### 3. Web Frontend Setup

```bash
cd web
npm install
cp .env.example .env.local
# Edit .env.local with your Clerk keys
npm run dev     # Start web app on port 3000
```

---

## 📁 Project Structure

```
QiyasReady/
├── backend/          # Express.js API (Node.js)
│   ├── src/
│   │   ├── config/   # Database, AI, auth config
│   │   ├── middleware/# Auth, error handling
│   │   ├── models/   # Mongoose schemas (User, Question, Exam, etc.)
│   │   ├── routes/   # API endpoints
│   │   ├── services/  # Business logic (AI, adaptive, gamification)
│   │   ├── utils/    # IRT algorithm, scoring
│   │   └── seeds/    # Database seeders
│   └── server.js
├── web/              # Next.js Web App
│   └── src/
│       ├── app/      # Pages (landing, dashboard, exams, etc.)
│       └── lib/      # API client, utilities
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sync` | Sync Clerk user |
| GET | `/api/exams` | List exams |
| POST | `/api/exams/:id/start` | Start exam |
| POST | `/api/exams/:id/submit` | Submit answers |
| POST | `/api/ai/tutor` | AI tutor chat |
| POST | `/api/ai/predict-score` | Score prediction |
| GET | `/api/analytics/overview` | Dashboard analytics |
| GET | `/api/leaderboard` | Global leaderboard |
| POST | `/api/study-plans/generate` | AI study plan |

---

## 💰 Business Model

| Plan | Price | Target |
|------|-------|--------|
| **Free** | 0 SAR/mo | 20 questions/day, basic analytics |
| **Pro** | 49 SAR/mo | Unlimited practice, AI tutor, study plan |
| **Premium** | 99 SAR/mo | Full mock exams, anti-cheat, PDF reports |

**TAM:** 500,000+ Saudi students take Qiyas annually

---

## 🏆 Why QiyasReady Wins

1. **Real Problem** — 500K+ students need better Qiyas prep tools
2. **AI-First** — Every feature enhanced by Claude AI
3. **Adaptive** — IRT-based learning that adapts to each student
4. **Premium UX** — Startup-quality design (Stripe/Linear/Duolingo level)
5. **Full Stack** — Web + Mobile + Admin + API — all working
6. **Scalable** — SaaS architecture ready for 100K+ users
7. **Arabic-First** — Built for the Saudi market from day one

---

## 👥 Team

Built with ❤️ for the OpenCloud Hackathon 2026

---

## 📄 License

MIT License — © 2026 QiyasReady
