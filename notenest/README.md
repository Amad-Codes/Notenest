# 📓 NoteNest

A fast, focused note-taking application with a clean modular architecture, JWT authentication, and a premium "paper & ink" UI. Built as a portfolio-quality full-stack project.

**Live demo login:** `demo@notenest.app` / `password123` (after seeding — see below)

---

## ✨ Features

- 🔐 **Authentication** — secure signup/login with hashed passwords (bcrypt) and JWT sessions
- 📝 **Rich text editor** — Tiptap-powered notes with bold/italic/underline, headings, bullet/numbered/checklist lists, blockquotes, inline+block code, links, and full undo/redo
- 📎 **File attachments** — upload images, PDFs, and documents to a note, with image previews, download, delete, upload progress, and file-size limits (10MB); stored on Cloudinary when configured, local disk otherwise
- 🎨 **7 note colors** — default, yellow, orange, blue, green, pink, purple
- 🏷️ **Tags** — multiple tags per note, filter by tag, search tags, and autocomplete suggestions while typing
- 🤖 **AI Note Assistant** — summarize, fix grammar, improve writing, extract action items, or rewrite professionally, right from the editor. Uses a real provider (OpenAI) when `OPENAI_API_KEY` is set, or a local heuristic fallback otherwise — fully testable either way
- ⏰ **Reminders** — set/edit/clear a date+time reminder per note, shown as a badge on the card (highlighted red once overdue)
- 📌 **Pin, archive, and trash** — soft-delete workflow with a recoverable Trash view
- 🔎 **Search** — instant search across note titles and content
- 🌗 **Dark mode** — persisted, respects system preference on first visit
- 📱 **Fully responsive** — mobile-first layout with a collapsible sidebar
- 💀 **Skeleton loading states, hover animations, toast notifications** — polished, modern feel throughout
- 🛡️ **Production-grade backend** — input validation (Zod), rate limiting, centralized error handling, structured logging (Winston), security headers (Helmet)

---

## 🧱 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Fast dev server, strong typing, modern React |
| Styling | Tailwind CSS + Typography plugin | Rapid, consistent, themeable UI; clean rich-text rendering |
| Rich text | Tiptap | Extensible, headless ProseMirror-based editor |
| Backend | Node.js + Express + TypeScript | Simple, well-understood, huge ecosystem |
| Database | SQLite (dev) via Prisma ORM | Zero-config local setup — no DB server to install |
| File storage | Cloudinary (optional) or local disk | Works out of the box; upgrades automatically if Cloudinary env vars are set |
| AI provider | OpenAI (optional) or local fallback | AI Assistant works with zero setup; swap in a real key anytime |
| Auth | JWT + bcrypt | Stateless, standard, easy to reason about |
| Validation | Zod | Runtime-safe request validation on the backend |
| Logging | Winston + Morgan | Structured logs, HTTP request logging |

> **Note on the database:** SQLite is used for local development so you can clone and run the project with **zero external setup** (no Postgres server required). The Prisma schema is written to be easily switched to PostgreSQL for production — see [Deployment](#-deployment) below.

---

## 📁 Project Structure

```
notenest/
├── backend/
│   ├── src/
│   │   ├── config/          # env validation, logger, Prisma client singleton
│   │   ├── middleware/      # auth, validation, rate limiting, error handling
│   │   ├── modules/
│   │   │   ├── auth/        # controller, service, routes, validation
│   │   │   ├── notes/       # controller, service, routes, validation (+ attachments)
│   │   │   ├── ai/          # AI Assistant: OpenAI provider + local fallback
│   │   │   └── uploads/     # multer middleware + Cloudinary/local storage service
│   │   ├── utils/           # ApiError, ApiResponse, asyncHandler
│   │   ├── app.ts           # Express app assembly
│   │   └── server.ts        # entrypoint + graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma    # User, Note, Tag, Attachment models
│   │   └── seed.ts          # demo account + sample notes
│   ├── uploads/              # local attachment storage (gitignored; auto-created)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # axios instance + typed API calls (notes, auth, ai)
│   │   ├── components/
│   │   │   ├── ui/          # Button, Input, Modal, Spinner, ConfirmDialog
│   │   │   ├── layout/      # Navbar, Sidebar (with tag search)
│   │   │   └── notes/       # NoteCard, NoteGrid, ComposeBox, NoteEditorModal,
│   │   │                    # RichTextEditor, EditorToolbar, AIAssistantMenu,
│   │   │                    # ReminderPicker, AttachmentSection, NoteGridSkeleton
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── hooks/           # useAuth, useTheme, useNotes
│   │   ├── pages/           # Login, Register, Dashboard
│   │   ├── routes/          # ProtectedRoute / PublicOnlyRoute
│   │   ├── types/           # shared TS interfaces
│   │   └── utils/           # note colors, time formatting, rich-text parsing,
│   │                        # file size formatting, attachment URL resolution
│   ├── .env.example
│   └── package.json
├── LICENSE
└── README.md
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js **18+**
- npm

### 1. Clone and install

```bash
git clone <your-repo-url> notenest
cd notenest

# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# In backend/
cp .env.example .env
```

Open `backend/.env` and set a real `JWT_SECRET` (any long random string is fine for local dev):

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional — see "Optional integrations" below
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
```

```bash
# In frontend/
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:5000/api` works out of the box.

### 3. Set up the database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed     # optional: adds a demo account + sample notes
```

### 4. Run both apps

```bash
# Terminal 1
cd backend
npm run dev        # http://localhost:5000

# Terminal 2
cd frontend
npm run dev         # http://localhost:5173
```

Open **http://localhost:5173** — sign in with the seeded demo account (`demo@notenest.app` / `password123`) or register a new one.

---

## 🧪 Useful Backend Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the API with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build |
| `npm run seed` | Seed demo user + sample notes |
| `npx prisma studio` | Visual database browser |

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (12 salt rounds) — never stored in plaintext
- JWTs are signed with a server-side secret and expire after 7 days by default
- All `/api/notes/*` routes require a valid `Authorization: Bearer <token>` header
- Every note query is scoped to `authorId`, so users can never read or modify each other's notes
- Login/register endpoints are rate-limited to slow down brute-force attempts
- All input is validated with Zod before it reaches business logic
- Security headers are set via Helmet; CORS is locked to `CLIENT_URL`
- File uploads are restricted to an allowlist of MIME types, capped at 10MB, renamed to random filenames on disk (no user-controlled paths), and every attachment is scoped to a note the requesting user owns
- The AI Assistant endpoint has its own rate limit, separate from the general API limit, since each call may hit a paid external provider once configured

---

## 🔌 Optional Integrations

Both of these work with **zero configuration** — they're built to fail over gracefully so the features are fully testable out of the box, and upgrade automatically once you add real credentials.

**File storage (Cloudinary):** without `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`, attachments are stored on local disk under `backend/uploads/` and served at `/uploads/<file>`. Set all three env vars and uploads automatically switch to Cloudinary — no code changes needed (`backend/src/modules/uploads/upload.service.ts` is the single place that decides which backend to use).

**AI Assistant (OpenAI):** without `OPENAI_API_KEY`, the AI Assistant uses a small local heuristic (`backend/src/modules/ai/ai.service.ts` → `runLocalFallback`) so summarize/grammar/improve/action-items/rewrite all return *something* sensible with no external calls. Set `OPENAI_API_KEY` and the same endpoint calls `gpt-4o-mini` instead — the frontend and routes never change. To use a different provider (Anthropic, a self-hosted model, etc.), replace the `runOpenAI` function with an equivalent call.

---

## ☁️ Deployment

### Option A — Railway / Render (backend + Postgres)

1. Push this repo to GitHub.
2. Create a new Postgres database on Railway/Render.
3. In `backend/prisma/schema.prisma`, change the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Deploy the `backend/` folder as a new service. Set environment variables (`DATABASE_URL` from your Postgres instance, `JWT_SECRET`, `CLIENT_URL` = your deployed frontend URL, and optionally `CLOUDINARY_*` / `OPENAI_API_KEY` — see [Optional Integrations](#-optional-integrations)).
5. Set the build command to `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`, and the start command to `npm start`.
6. **If you skip Cloudinary:** attachments fall back to local disk (`backend/uploads/`), which most container platforms wipe on redeploy. For production, either configure Cloudinary (recommended — it's the point of the fallback design) or mount a persistent volume at `backend/uploads`.

### Option B — Vercel / Netlify (frontend)

1. Import the `frontend/` folder as a new project.
2. Set the environment variable `VITE_API_URL` to your deployed backend's URL (e.g. `https://notenest-api.up.railway.app/api`).
3. Build command: `npm run build`. Output directory: `dist`.

### Option C — Docker (full stack)

A `Dockerfile` is included in `backend/` for containerized deployment to any provider that supports Docker (Render, Railway, Fly.io, AWS, etc.). Build and run:

```bash
cd backend
docker build -t notenest-api .
docker run -p 5000:5000 --env-file .env notenest-api
```

---

## 🔭 Architecture Readiness: Real-Time Collaboration

Real-time collaboration, sharing, notifications, and activity history are **not implemented** — building socket plumbing with nothing on the other end to test against isn't useful. What's already in place to make adding them straightforward later:

- **Modular routing** — each feature is its own `module/{controller,service,routes,validation}` set (see `auth/`, `notes/`, `ai/`, `uploads/`). A `collaboration/` module could be added the same way without touching existing ones.
- **`Note.updatedAt`** is already maintained by Prisma on every write, which is the minimum needed for last-write-wins conflict handling or as an input to a future CRDT (Yjs) merge.
- **Concrete next steps**, in order:
  1. Add a `NoteShare` model (`noteId`, `userId`, `permission: "view" | "edit"`) to `schema.prisma` for shared notes.
  2. Add a Socket.io (or Yjs `y-websocket`) server alongside the existing Express app in `server.ts`, with one room per note (`note:{id}`), authenticated via the same JWT already used for REST.
  3. Swap `RichTextEditor`'s plain Tiptap `Document`/`History` extensions for `@tiptap/extension-collaboration` + a Yjs provider once multi-user editing is needed.
  4. Add an `ActivityLog` model (`noteId`, `userId`, `action`, `createdAt`) and write to it from the existing `notes.service.ts` methods (they're already the single choke point for every note mutation).
  5. Add a `Notification` model + a lightweight polling or WebSocket push to surface reminders and share events.

## 🔭 Other Future Improvements

- Offline support with a service worker + local cache sync
- Bulk actions (select multiple notes to archive/delete/tag)
- Automated tests (Jest/Vitest + Supertest for the API, React Testing Library for the UI)
- Password reset via email
- Code-splitting the rich text editor bundle (it's the largest chunk in the production build)

---

## 📄 License

MIT — see [LICENSE](./LICENSE).
