# LMS Frontend - AI Development Guide

## Build & Run Commands
- **Install Dependencies**: `npm install`
- **Run Development**: `npm run dev`
- **Build Project**: `npm run build`
- **Run Production**: `npm start`
- **Lint Code**: `npm run lint`

## Development Guidelines
- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4.0 (using `@tailwindcss/postcss`)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-time**: Socket.io-client
- **Video**: VideoSDK.live

## Coding Standards
- **Component Pattern**: Use Functional Components with TypeScript interfaces for props
- **Client vs Server**: Default to Server Components; use `'use client'` at the top of files that require interactivity or hooks
- **File Naming**: kebab-case for filenames; PascalCase for component folder names or main component files
- **Styling**: Use utility-first Tailwind classes. Use `cn()` utility for merging classes
- **State Management**: Keep local state with `useState`; shared state in `stores/` using Zustand
- **Icons**: Import only necessary icons from `lucide-react`
- **Responsiveness**: Always implement mobile-first responsive design

## Directory Structure
- `app/`: Routing and layouts (App Router)
- `components/`: UI components (e.g., `dashboard/`, `ui/`, `shared/`)
- `hooks/`: Custom React hooks
- `lib/`: Shared configurations (e.g., API clients, constants)
- `stores/`: Global state management
- `types/`: Global TypeScript definitions
- `utils/`: Pure helper functions

## Feature Roadmap

### 🟢 Implemented Features
- **Auth System**: Login, Signup, Role-based redirects, Persistent sessions.
- **Admin Dashboard**: User management, Course creation, Global stats.
- **Tutor Dashboard**: My Courses, Live Quiz session hosting, Content management.
- **Learner Dashboard**: Course enrollment, Study tools, Assessment taking.
- **Real-time Features**:
  - Live Kahoot-style quiz lobby and leaderboard.
  - Interactive code editor for challenges.
  - Video streaming/Live sessions interface.
- **AI-Powered Tools**:
  - Quiz generator interface.
  - Flashcard study mode.
  - Transcription viewer.
  - Admin performance insight cards.
- **Media Hub**:
  - Podcast player and playlist management.
  - Premium blog/article reader.

### 🟡 Planned / To be Developed
- **Mobile PWA**: Enhanced offline support and mobile-optimized layouts.
- **Notification Center**: Real-time push notifications for course updates/messages.
- **Achievement Gallery**: Visual badges and progress tracking for learners.
- **Interactive Code Review**: Peer review system for code challenges.
- **Dark Mode / Themes**: Premium theme customization.
- **Course Marketplace**: UI for browsing and purchasing premium courses.
