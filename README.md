# CATalyze

### Elite Competitive Examination Preparation Cockpit & Aspirant Operating System

[![Version](https://img.shields.io/badge/version-1.0.85-38bdf8.svg?style=flat-square)](package.json)
[![React](https://img.shields.io/badge/React-19.2.7-61dafb.svg?style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646cff.svg?style=flat-square)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-v12.16.0-ffca28.svg?style=flat-square)](https://firebase.google.com)
[![Vitest](https://img.shields.io/badge/Vitest-54%20Passed-4ade80.svg?style=flat-square)](https://vitest.dev)
[![Status](https://img.shields.io/badge/Production-Live-38bdf8.svg?style=flat-square)](https://cat-tracker-1538d.web.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Live Deployment

- **Production Web Application**: [https://cat-tracker-1538d.web.app](https://cat-tracker-1538d.web.app)
- **Primary Focus**: Common Admission Test (CAT) & Premier Management / Engineering Entrance Aspirants

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [1. Executive Cockpit & Metrics](#1-executive-cockpit--metrics)
  - [2. Multi-Exam Curriculum Engine](#2-multi-exam-curriculum-engine)
  - [3. Pomodoro Focus & Deep Work Suite](#3-pomodoro-focus--deep-work-suite)
  - [4. Daily Drills & Habit Engine](#4-daily-drills--habit-engine)
  - [5. Mock Test Analytics & Percentile Tracking](#5-mock-test-analytics--percentile-tracking)
  - [6. Systematic Error & Mistake Audit Log](#6-systematic-error--mistake-audit-log)
  - [7. Study Lounge & Peer Network](#7-study-lounge--peer-network)
  - [8. Prestige Achievements & Customization](#8-prestige-achievements--customization)
- [Architecture & Data Flow](#architecture--data-flow)
- [Directory Structure](#directory-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development](#local-development)
- [Available Scripts](#available-scripts)
- [Firebase Configuration & Deployment](#firebase-configuration--deployment)
- [Iconography & Design Guidelines](#iconography--design-guidelines)
- [License](#license)

---

## Overview

**CATalyze** is a comprehensive preparation operating system built for high-stakes competitive examinations. While traditional preparation relies on fragmented spreadsheets, disconnected timers, and disorganized notes, CATalyze unifies syllabus roadmaps, daily practice quotas, mock percentile analytics, mistake auditing, and peer accountability into a cohesive, responsive cockpit.

Designed with an offline-first architecture, CATalyze persists state instantly to browser storage while seamlessly synchronizing with Firebase Cloud Firestore when authenticated.

---

## Key Features

### 1. Executive Cockpit & Metrics
- **Aspirant Readiness Index**: Algorithmic scoring that dynamically aggregates syllabus completion, mock test score trends, consistency streaks, and drill quotas.
- **Exam Countdown**: Live day, hour, and minute counters calibrated against national exam schedules.
- **Daily Quotas Meter**: Visual progress tracking across Quantitative Aptitude (QA), Data Interpretation & Logical Reasoning (DILR), and Verbal Ability & Reading Comprehension (VARC).
- **Activity Heatmap**: Year-round GitHub-style contribution grid capturing active study sessions and completed problem sets.

### 2. Multi-Exam Curriculum Engine
- **Pre-Configured Syllabus Blueprints**:
  - **CAT (Common Admission Test)**: QA (Arithmetic, Algebra, Geometry, Modern Math, Number Systems), DILR (Arrangements, Matrices, Games, Venns, Charts), VARC (RC Passages, Parajumbles, Summary, Para-completion).
  - **Engineering & Sciences**: JEE Main & Advanced, NEET-UG, GATE.
  - **Civil Services & Management**: UPSC CSE, GRE, and GMAT Focus Edition.
- **Adaptive Timeline Horizons**: Select between 3 Months Crash Sprint, 16 Weeks Standard Balanced, 6 Months Intensive, or 1 Year Comprehensive schedules with dynamically scaled daily targets.

### 3. Pomodoro Focus & Deep Work Suite
- **Configurable Work Intervals**: Classical 25/5 Pomodoro cycles, 50/10 deep sessions, or custom durations.
- **Subject & Topic Tagging**: Associate active focus sessions directly with specific syllabus chapters.
- **Ambient Soundscapes**: Built-in procedural audio engine providing white noise, rain, and concentration hums.
- **Floating PIP Widget**: Minimize the study timer to a floating micro-widget while navigating study plans or reviewing error logs.
- **Distraction-Free Mode**: Fullscreen GSAP focus transition portal dimming peripheral elements.

### 4. Daily Drills & Habit Engine
- **Target Tracking**: Log daily questions solved, time spent, and sectional distribution.
- **Streak Safeguards**: Daily streak counter with automated streak freeze mechanisms for planned rest days.
- **Japanese Hanko Stamp Rally**: Gamified milestone card awarding collectible red Hanko ink stamps for hitting daily quotas, redeemable for exclusive visual themes.

### 5. Mock Test Analytics & Percentile Tracking
- **Multi-Series Support**: Benchmarking tailored for IMS SimCAT, TIME AIMCAT, Career Launcher Prime, and Cracku mock series.
- **Sectional Diagnostics**: Separate scoring, accuracy rates, and percentile calculations for QA, DILR, and VARC.
- **Score vs. Percentile Trajectory**: Interactive trend analysis highlighting score plateaus, negative marking leaks, and percentile velocity over time.

### 6. Systematic Error & Mistake Audit Log
- **Root-Cause Classification**: Tag every error as Conceptual Flaw, Calculation Slip, Silly Mistake, Time Crunch, or Trap Question.
- **Actionable Takeaways**: Capture question summaries, key formulas missed, and recommended revisit dates.
- **Filterable Question Vault**: Filter by exam section, difficulty tier, and recurrence to eliminate repetitive errors prior to mock tests.

### 7. Study Lounge & Peer Network
- **Real-Time Presence**: See active peers studying concurrently in the virtual lounge via Cloud Firestore listeners.
- **Study Arena Leaderboards**: Daily and weekly rankings comparing verified focus hours and problem counts.
- **Peer Inspector**: View peer study plans, syllabus progress milestones, and public contribution heatmaps to benchmark pacing.
- **Study Buddy System**: Send and accept peer requests using unique aspirant identifiers (#ASP-XXXXXX).

### 8. Prestige Achievements & Customization
- **Tiered Badges**: Unlock Bronze, Silver, Gold, Platinum, and Obsidian emblems for milestones such as 30-day streaks, 100+ mock questions analyzed, or night-owl sessions.
- **Theming Engine**: Curated themes including Cyberpunk Bento, Midnight Obsidian, Cat Cafe, Matcha Green, Solar Flare, and Neo Tokyo.
- **Secret Code Redemption**: Unlock hidden themes and developer easter eggs through redemption codes.

---

## Architecture & Data Flow

```text
+-----------------------------------------------------------------------+
|                             USER CLIENT                               |
|                                                                       |
|  [ React 19 Root ] <---> [ GSAP / Lenis Motion ] <---> [ Audio Engine]|
|         |                                                             |
|         v                                                             |
|  [ Central State Controller (App.jsx) ]                               |
|         |                                                             |
|         +---> localStorage (Immediate Local Persistence)              |
|         |                                                             |
|         +---> Manual Backup (JSON Import / Export Pipeline)           |
+-----------------------------------------------------------------------+
                                  |
                   Cloud Sync Layer (Optional Auth)
                                  v
+-----------------------------------------------------------------------+
|                         FIREBASE CLOUD INFRA                          |
|                                                                       |
|  [ Firebase Auth ]            --> Google OAuth & Email/Password       |
|  [ Cloud Firestore ]          --> User Profiles, Progress, Lounge     |
|  [ Security Rules ]           --> Strict Owner-Based Read/Write       |
|  [ Firebase Hosting (CDN) ]   --> Static Bundle & Version Registry    |
+-----------------------------------------------------------------------+
```

---

## Directory Structure

```text
Tracker/
├── .agents/                    # Agent customizations and rules
├── .firebaserc                 # Firebase project mapping
├── firebase.json               # Firebase hosting, headers & firestore rules
├── firestore.rules             # Firestore security rules
├── index.html                  # HTML5 entrypoint with PWA meta tags
├── package.json                # Project dependencies & automation scripts
├── vite.config.js              # Vite bundler configuration
│
├── public/
│   ├── favicon.svg             # Vector brand icon
│   ├── manifest.json           # Web app manifest
│   └── version.json            # Deployment build metadata & version tracking
│
├── scripts/
│   └── release.js              # Automated release, version bump & deployment pipeline
│
└── src/
    ├── main.jsx                # Application DOM mounting point
    ├── App.jsx                 # Master application controller, navigation & layout
    ├── App.css                 # Core application styles
    ├── index.css               # Design tokens, themes, typography & utility classes
    │
    ├── components/             # Reusable UI views & modular widgets
    │   ├── DashboardView.jsx   # Executive overview & readiness score
    │   ├── TimelineView.jsx    # 16-week structured syllabus curriculum
    │   ├── DailyTrackerView.jsx# Daily drills & target counters
    │   ├── MockTrackerView.jsx # Mock test logs & percentile charts
    │   ├── StudyTimerView.jsx  # Pomodoro focus session suite
    │   ├── StudyLounge.jsx     # Live peer study room & leaderboard
    │   ├── ErrorLogView.jsx    # Mistake audit & classification log
    │   ├── AchievementsView.jsx# Prestige milestone badges
    │   ├── ProfileView.jsx     # User identity & study buddy system
    │   ├── SettingsView.jsx    # Themes, typography, schedule & data controls
    │   ├── AspirantIcons.jsx   # Bespoke animated vector SVG icon collection
    │   ├── ComicPeekingCatBuddy.jsx # Interactive vector mascot companion
    │   └── animations/         # GSAP & canvas motion primitives (Dock, Spark, etc.)
    │
    ├── config/
    │   └── examConfig.js       # Dynamic syllabus registry for CAT, JEE, NEET, etc.
    │
    ├── data/
    │   ├── catSyllabusRoadmap.js # Granular CAT chapter database
    │   └── leaderboardData.js    # Mock & baseline competitor profiles
    │
    └── utils/
        ├── storage.js          # LocalStorage abstractions & state migrations
        ├── firebase.js         # Firebase Auth, Firestore sync & lounge listeners
        ├── dateUtils.js        # Date normalization & streak computation
        ├── audioUtils.js       # Procedural audio generator & sound effects
        ├── badgeUtils.js       # Milestone evaluation & prestige badges
        ├── themeRedemption.js  # Theme registry & redemption codes
        ├── versionCheck.js     # Live client-side update detector
        └── textUtils.js        # Text sanitization & emoji stripping utilities
```

---

## Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Core Framework** | React 19 (`19.2.7`) | Component-driven architecture using modern hooks |
| **Bundler & Tooling** | Vite (`8.1.1`) | High-speed ESM development server and Rollup optimizer |
| **Styling** | Vanilla CSS | CSS variables, responsive containers, glassmorphism, zero Tailwind dependency |
| **Animations & Motion** | GSAP 3 + Lenis | Hardware-accelerated transitions and inertial smooth scrolling |
| **Animated Numbers** | `@number-flow/react` | Accessible, layout-safe rolling numeric displays |
| **Cloud & Backend** | Firebase (`12.16.0`) | Authentication, Cloud Firestore real-time synchronization, and Hosting |
| **Testing** | Vitest (`4.1.10`) | Unit and integration test runner with JSDOM environment |
| **Linting** | Oxlint (`1.71.0`) | High-performance JavaScript/JSX linter |

---

## Getting Started

### Prerequisites
- Node.js version 18.x or higher
- npm (bundled with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/IO720/CAT-PREP-TRACKER.git
   cd CAT-PREP-TRACKER
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

### Local Development

Launch the Vite local development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts the local Vite development server with Hot Module Replacement. |
| `npm run build` | Compiles the production bundle into the `dist/` directory. |
| `npm test` | Runs the Vitest test suite in headless mode (54 unit and component tests). |
| `npm run lint` | Analyzes code quality using Oxlint. |
| `npm run preview` | Previews the production build locally before deployment. |
| `npm run deploy` | Builds the project and deploys hosting and Firestore rules to Firebase. |
| `npm run release` | Runs the automated version bumper (`scripts/release.js`), rebuilds, and pushes live. |

---

## Firebase Configuration & Deployment

### 1. Configure Firebase Credentials
Firebase parameters are defined in `src/utils/firebase.js`. To connect your own Firebase project:
1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** (Google Sign-In and Email/Password).
3. Create a **Cloud Firestore** database.
4. Replace the `firebaseConfig` object in `src/utils/firebase.js` with your application keys.

### 2. Firestore Security Rules
Production security rules are located in `firestore.rules`. Deploy rules directly:
```bash
npx firebase deploy --only firestore:rules
```

### 3. Deploy to Hosting
Deploy the static application bundle:
```bash
npm run deploy
```

---

## Iconography & Design Guidelines

CATalyze adheres to strict visual design standards:

- **Zero Unicode Emoji Standard**: In accordance with project design policy, raw Unicode emojis (e.g., smileys, rocket symbols, flags) are prohibited in UI strings, templates, and JSX components.
- **Vector-First Assets**: All visual emblems, indicators, and status badges are rendered using animated SVGs from `src/components/AspirantIcons.jsx` or inline `<svg>` elements with defined `viewBox` attributes and CSS variable stroke bindings.
- **Mascots**: Companion characters (such as the study cat mascot) are rendered via vector illustrations (`ComicPeekingCatBuddy.jsx`) paired with CSS keyframe micro-animations.
- **Sanitization**: Legacy or external user-inputted strings containing emojis are sanitized via `stripEmojis()` in `src/utils/textUtils.js`.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-analytics-view`).
3. Ensure all tests pass (`npm test`).
4. Ensure lint checks pass (`npm run lint`).
5. Commit your changes with clear, descriptive commit messages.
6. Push to your branch and submit a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).
