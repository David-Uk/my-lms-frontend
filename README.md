# LMS Frontend

A comprehensive Learning Management System (LMS) frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Features

### Authentication & Authorization

- JWT-based authentication with secure token storage
- Role-based access control (SuperAdmin, Admin, Tutor, Learner)
- Protected routes with automatic redirects
- Login, Signup, Forgot/Reset Password flows

### User Management (Admin/SuperAdmin)

- User list with pagination and search
- Create, edit, deactivate users
- Role assignment

### Course Management

- Course catalog with difficulty filters
- Course creation and editing
- Content tree structure (Sections, Lessons, Assessments)
- Tutor assignment
- Learner enrollment

### Assessments

- Quiz creation and management
- Code challenges with test cases
- Live quiz/Kahoot-style sessions with PIN
- Real-time leaderboards

### AI Features

- AI-powered quiz generation
- Audio transcription
- Flashcard generation
- Performance analysis (Admin only)

## Tech Stack

- **Framework**: Next.js 16.2.2 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **HTTP Client**: Native fetch with caching layer

## Project Structure

```
app/
  (auth)/           # Auth routes (login, signup, forgot-password, reset-password)
  (dashboard)/       # Protected dashboard routes
    admin/          # Admin-only pages
    tutor/          # Tutor pages
    learner/        # Learner pages
    profile/        # Profile page (all roles)
components/
  ui/               # Reusable UI components (Button, Input, Card)
  layout/           # Layout components (Sidebar, Header, DashboardLayout)
  courses/          # Course-specific components (ContentTree)
  forms/            # Form components
  ai/               # AI feature components
lib/
  api.ts            # API client with native fetch, caching, interceptors
hooks/
  use-auth.ts       # Auth-related hooks (useRequireAuth, useRequireRole)
stores/
  auth-store.ts     # Zustand auth store with persistence
types/
  index.ts          # TypeScript type definitions
utils/
  cn.ts             # Tailwind class merging utility
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Integration

The frontend communicates with a REST API at `http://localhost:3000`. All protected routes require a JWT Bearer token.

### Key Features

- **Native Fetch**: Uses Next.js native fetch with custom interceptors
- **Caching**: In-memory caching for GET requests (5-minute duration)
- **Token Management**: Automatic token injection and expiration handling
- **Error Handling**: Structured error responses with automatic 401 redirects

## User Roles & Routes

| Role       | Dashboard            | Key Features                          |
| ---------- | -------------------- | ------------------------------------- |
| SuperAdmin | `/admin/dashboard`   | Full system access                    |
| Admin      | `/admin/dashboard`   | Users, Courses, AI Performance        |
| Tutor      | `/tutor/dashboard`   | My Courses, Quiz Sessions, AI Tools   |
| Learner    | `/learner/dashboard` | My Courses, Join Quiz, AI Study Tools |

## Optimization Features

- Server-side rendering for initial page loads
- Client-side navigation with Next.js App Router
- In-memory API response caching
- Image optimization with Next.js Image component
- Persistent auth state with Zustand
- Role-based code splitting through route groups

## License

MIT
