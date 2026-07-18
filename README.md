<div align="center">

# ScopeAI

**AI-powered scope creep detection and capacity risk analysis for software projects**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-full--stack-3178C6)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Express](https://img.shields.io/badge/Express-5-000000)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)

<!-- 🔗 Add your live demo link here, e.g.: -->
<!-- **[Live Demo →](https://scope-shift.vercel.app/)** · **[API Docs →](https://scopeai-backend-24ug.onrender.com/api-docs/)** -->

</div>

---

## The problem

Scope creep is one of the most common — and most quietly destructive — reasons projects miss their deadlines. Features get added one at a time, each seeming small, until the team is committed to far more work than the timeline can absorb. By the time it's obvious, it's too late to course-correct cheaply.

**ScopeAI** tracks feature additions against real team capacity and answers the question teams usually ask too late: *"Can we actually still hit this deadline?"* It runs "what-if" scenarios — changing team size, deadline, or scope — and returns a capacity-based risk analysis instantly, instead of everyone doing the math on a whiteboard.

> **Design note:** the risk numbers are never left entirely to the LLM. ScopeAI uses a **hybrid architecture** — Gemini AI reasons about individual features (complexity, technical risk, recommendations), while a **deterministic backend engine** computes all project-level math (available hours, capacity utilization, timeline fit). This keeps the numbers reproducible and auditable instead of subject to AI variance — a distinction that matters a lot once you're using this to make real scheduling decisions.

---

## Demo

<!--
  Replace this section with:
  - A GIF/screen recording of: create project → add features → run AI analysis → view risk report
  - 2-3 screenshots (dashboard, what-if scenario modal, report page)
  A README with zero visuals is the #1 thing that makes reviewers bounce before reading further.
-->

| Dashboard | Scope Builder | Risk Analysis |
|---|---|---|
| _screenshot here_ | _screenshot here_ | _screenshot here_ |

---

## Highlights

- **Hybrid AI + deterministic engine** — Gemini handles feature-level reasoning; a rules-based capacity engine handles all project-level math, keeping results consistent and explainable
- **What-if scenario modeling** — instantly re-run risk analysis against changes to team size, deadline, or scope, without mutating the live project
- **Duplicate-analysis prevention** — SHA-256 hashing of the current feature set avoids redundant AI calls for scope states already analyzed
- **Full project lifecycle** — draft → active → at-risk → completed, with automatic status transitions driven by a scheduled capacity check
- **Role-based project sharing** with a complete audit log (every change, snapshotted, per project)
- **20+ REST endpoints**, documented live via Swagger UI, validated end-to-end with Zod
- **Report export** to PDF and CSV, including full effort breakdowns (dev / testing / integration / documentation hours)
- Comprehensive backend test suite covering the AI service, capacity engine, and derivation logic

---

## Tech Stack

**Frontend** — React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router 7 (lazy-loaded routes) · @dnd-kit (drag-and-drop scope builder) · jsPDF / xlsx for exports

**Backend** — Express 5 · TypeScript · Prisma ORM · MySQL · JWT auth (bcrypt-hashed passwords) · Zod validation · Google Gemini AI (`@google/genai`) · node-cron for scheduled status checks · Swagger UI for live API docs

<details>
<summary>Full dependency table</summary>

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.2.6 | UI framework with hooks |
| Vite | 8.0.12 | Dev server & bundler |
| TypeScript | 6.0.2 | Type safety |
| Tailwind CSS | 4.3.1 | Utility-first styling |
| React Router | 7.18.0 | Client-side routing with lazy loading |
| @dnd-kit | 6.3.1/10.0.0 | Drag-and-drop feature reordering |
| jsPDF | 4.2.1 | PDF generation |
| jspdf-autotable | 5.0.8 | PDF table generation |
| xlsx | 0.18.5 | Excel/CSV export |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Express | 5.2.1 | HTTP server framework |
| TypeScript | 6.0.3 | Type safety |
| Prisma | 5.22.0 | ORM & database migrations |
| MySQL | — | Primary database |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcryptjs | 3.0.3 | Password hashing |
| Zod | 4.4.3 | Request validation |
| @google/genai | 2.8.0 | Gemini AI integration |
| node-cron | 4.5.0 | Scheduled tasks |
| Swagger UI | 5.0.1 | API documentation |
| multer | 2.2.0 | File upload handling |

> ⚠️ Double-check these version numbers before publishing — a couple (React 19.2.6, Vite 8, TS 6.0) look ahead of current stable releases and may be placeholders that got left in.

</details>

---

## How the AI/backend split works

**Google Gemini handles:**
- Estimating complexity and effort for individual features
- Identifying specific technical risks tied to architecture and dependencies
- Suggesting engineering strategies to reduce timeline or risk
- Generating an initial feature set from project context

**The deterministic backend handles:**
- Available hours, productive hours, and timeline fit
- Total estimated hours/weeks, risk level, scope score
- Effort distribution across development, testing, integration, documentation
- Project health, derived from buffer percent and capacity utilization

This split exists because AI-generated numbers drift between runs even for identical input — fine for qualitative judgment ("this feature adds real risk because of the auth dependency"), not fine for a number someone will schedule sprints around. Keeping the arithmetic in deterministic code means two analyses of the same scope always agree, and the reasoning stays inspectable.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- Google Gemini API key

### Environment Variables

Create a `.env` file in `backend/`:

```env
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Install & Run

```bash
# Backend (port 3000)
cd backend
npm install
npx prisma db push
npm run dev

# Frontend (port 5000), in a second terminal
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to the backend via Vite's dev proxy, so no CORS setup is needed locally.

Interactive API docs (Swagger): `http://localhost:3000/api-docs`

### Tests

```bash
cd backend
npm test               # full suite
npm run test:coverage  # with coverage report
```

Covers the AI service, capacity engine, derivation logic, and scope calculations.

---

## Architecture & Reference Docs

The project structure, full Prisma schema, and complete API reference are kept in `/docs` rather than inline here, to keep this README skimmable:

- [`docs/architecture.md`](docs/architecture.md) — system architecture, module layout
- [`docs/database-schema.md`](docs/database-schema.md) — full Prisma schema (User, Project, Feature, Analysis, AuditLog, ProjectMember)
- [`docs/api-spec.md`](docs/api-spec.md) — complete endpoint reference (auth, projects, features, analyses, AI, dashboard, audit logs, project members)

Quick orientation, if you're browsing the code:

```
frontend/src/
  pages/        # route-level views (dashboard, scope builder, reports, ...)
  context/      # auth, project, dashboard, theme state
  services/api.ts   # fetch wrapper with retry logic
  components/    # layout, cards, ui primitives

backend/src/
  modules/
    auth/ users/ projects/ features/ scopeVersions/
    analysis/ auditLogs/ dashboard/
    ai/        # Gemini integration + capacity engine + prompt templates
  middlewares/  # auth, error handling, rate limiting, upload, validation
```

---

## Key Design Decisions

- **Hybrid AI architecture** for reproducible numbers (see above)
- **Vite dev proxy** — frontend calls relative `/api/...` paths; no CORS config needed in dev
- **Analysis hashing** — SHA-256 of the current feature set avoids re-analyzing an unchanged scope
- **Cascading deletes** — removing a project cleans up its features and analyses via Prisma's `onDelete: Cascade`
- **Audit logging with feature snapshots** — every project change is logged with the full feature state at that point in time, not just a diff
- **Role-based project sharing** (owner/admin/member/viewer) with frontend permission checks matching backend authorization

---

## License

MIT
