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
  - AI Quiz Generator: Automated question generation, manual configuration, preview with correct answers, and email invitations.
  - Secure Quiz Access: Email-based access verification and strict time-window enforcement.
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

## AI Agents Architecture

The frontend provides a set of **AI agents** that off‑load heavy AI‑generated tasks to backend workers. All agents are built to be compatible with Claude (Anthropic) but can be swapped for other LLM providers by changing the `LLM_PROVIDER` environment variable.

### Core Agents

| Agent | Purpose | Trigger | Output |
|-------|---------|---------|--------|
| **QuizGenerator** | Generates a fresh set of quiz questions for a given topic/level. | Called from `api/quiz/generate` or from UI “Generate Quiz” button. | JSON array of `{question, options, correctAnswer}`. |
| **FlashcardCreator** | Produces spaced‑repetition flashcards from lecture notes. | `api/flashcards/create`. | JSON of `{front, back}` cards. |
| **TranscriptionSummarizer** | Summarises video/audio transcription. | `api/transcribe/summarize`. | Text summary + key takeaways. |
| **StudyGuideBuilder** | Compiles a study guide from multiple resources. | `api/studyguide/build`. | Markdown document. |

### Ensuring Uniqueness

* **Random seed injection** – each request receives a UUID (`X-Request-ID`) that is passed to the LLM prompt as `seed: <uuid>`. Claude respects the seed to vary completions.
* **Prompt pattern** – ask the model to *“create *N* distinct questions; avoid duplicates and ensure each question covers a different sub‑topic.*”
* **Post‑generation deduplication** – after receiving the raw list, the backend runs a lightweight similarity check (Levenshtein distance) and discards near‑duplicates before returning the result.
* **Rate‑limit per user** – a per‑user cooldown (e.g., 30 seconds) prevents rapid re‑generation that could otherwise produce identical outputs.

### Deployment & Runtime

1. **Worker process** – `npm run ai-worker` starts a Node worker that polls a Redis queue (`ai_tasks`). Each task contains `{agent, payload, requestId}`.
2. **Queue** – The backend API enqueues tasks via `enqueueAiTask(agent, payload, requestId)`.
3. **Environment** – Required variables:

   ```env
   LLM_PROVIDER=claude
   CLAUDE_API_KEY=your_anthropic_key
   REDIS_URL=redis://localhost:6379
   ```
4. **Error handling** – Workers retry up to 3 times; on permanent failure they push a `failed` status back to the API which returns a 502 with a helpful message.

### How to Run the Agents locally

```bash
# install deps (already done)
npm run dev          # starts Next.js
npm run ai-worker    # in a separate terminal
```

The UI components invoke the agents through the `lib/api.ts` helpers (`generateQuiz`, `createFlashcards`, etc.). These helpers automatically attach a UUID header (`X-Request-ID`) that the backend uses for uniqueness.

### Compatibility with Claude

* All prompts are written in plain English without proprietary OpenAI function calling syntax.
* The JSON schema for outputs is validated with `zod` before being sent back to the client.
* Switching to another provider only requires a different adapter in `src/ai/provider.ts` – no changes to the agents.md file.

---

*Keep this file under version control; any changes to agent names, payload shapes, or environment variables must be reflected here.*
## AI Agents Execution Flow

The frontend never talks to the LLM directly. All requests are routed through the **AI API** endpoints (`/api/v1/ai/quiz`, `/api/v1/ai/flashcards`, …).

1. **Enqueue** – The controller receives the request, generates a UUID (`X-Request-ID`) and pushes a job onto a Redis list `ai_tasks` via `enqueueAiTask(agent, payload, requestId)`.
2. **Worker** – A separate Node process started with `npm run ai-worker` continuously polls the queue, pulls jobs and calls the corresponding method on `AiService` (`generateQuiz`, `generateFlashcards`, …).
3. **Result** – When the LLM returns, the worker stores the JSON payload in Redis under `ai:result:{requestId}` and emits a `socket.io` event `aiResult` to the waiting client.
4. **Frontend** – The client library (`lib/api.ts`) posts to the API and listens for the socket event. Once the result arrives the promise resolves and the UI updates.

This decouples heavy inference work from the HTTP request‑response cycle, giving:
- **Scalability** – multiple workers can be run behind a load‑balancer.
- **Reliability** – failed jobs are retried up to 3 times before a `failed` status is stored.
- **Observability** – workers log start/end timestamps and error traces for monitoring.

### Required Environment Variables (add to `.env`)

```dotenv
# Redis connection for the task queue
REDIS_URL=redis://localhost:6379

# Ollama (or other LLM) configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
OLLAMA_API_KEY=your-ollama-api-key   # optional for hosted services

# Switch LLM provider (claude, openai, etc.)
LLM_PROVIDER=claude
```

### Running Locally

```bash
# Start the Next.js frontend
npm run dev

# In another terminal – start the AI worker
npm run ai-worker
```

The worker script is defined in `package.json`:
```json
"scripts": {
  "ai-worker": "node dist/ai/ai.processor.js"
}
```

---

## Ensuring Unique Quiz Generation

1. **Request‑level seed** – Every API call generates a UUID (`X-Request-ID`). The UUID is injected into the prompt as `seed: <uuid>`. Most LLMs (including Claude) treat the seed as part of the deterministic sampling context, producing different completions for each request.
2. **Prompt wording** – The generation prompt explicitly asks for `exactly N distinct questions` and adds the clause *"avoid duplicates"*.
3. **Post‑generation deduplication** – After the worker receives the JSON array, it runs a lightweight similarity check:
   - Normalise each question (`trim`, `toLowerCase`).
   - Compute Levenshtein distance between every pair.
   - If the distance is below a configurable threshold (default **10**), the later question is discarded and a replacement is generated on‑the‑fly (up to **3** attempts).
   - The final array is guaranteed to contain unique, non‑overlapping questions.
4. **Rate‑limit per user** – The backend enforces a 30‑second cooldown per user (stored in Redis) to prevent rapid re‑calls that could otherwise return the same cached answer.
5. **Mock fallback randomness** – The fallback mock generator already randomises question text and IDs using `Math.random()`, ensuring that even when the LLM is unavailable the output is not repetitive.

These layers together make the AI‑generated quizzes highly varied on every invocation while still respecting the requested topic and difficulty.
