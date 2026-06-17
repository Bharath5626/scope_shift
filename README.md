# ScopeAI — Scope Creep Analyzer

AI-powered project scope management tool that detects scope creep before it derails your timeline. Define your project scope, track feature additions, and get real-time risk analysis.

---

## Screenshots

| Login | Dashboard | Create Project |
|-------|-----------|----------------|
| Split-panel auth with indigo/violet gradient | Stats cards + recent projects grid | 3-column metadata form |

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Dev server & bundler |
| TypeScript | 6 | Type safety |
| Tailwind CSS | 4 | Styling |
| React Router | 7 | Client-side routing |
| @dnd-kit | 6/10 | Drag-and-drop feature reordering |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Express | 5 | HTTP server |
| TypeScript + ts-node-dev | 6 | Typed runtime with hot reload |
| Prisma | 6 | ORM & migrations |
| PostgreSQL | — | Primary database |
| jsonwebtoken | 9 | JWT authentication |
| bcryptjs | 3 | Password hashing |
| Zod | 4 | Request validation |
| @google/genai | 2 | Gemini AI integration |
| Swagger UI | 5 | Auto-generated API docs |

---

## Project Structure

```
/
├── frontend/                  # React + Vite app (port 5000)
│   └── src/
│       ├── pages/
│       │   ├── DashboardPage.tsx
│       │   ├── ProjectsPage.tsx
│       │   ├── CreateProjectPage.tsx
│       │   ├── ScopeBuilder.tsx
│       │   ├── LoginPage.tsx
│       │   └── SignupPage.tsx
│       ├── context/
│       │   ├── AuthContext.tsx    # JWT auth state
│       │   └── ProjectContext.tsx # API-backed project state
│       ├── services/
│       │   └── api.ts             # Fetch wrapper (proxied to backend)
│       ├── components/
│       │   ├── layout/            # AppLayout, Sidebar, DashboardLayout
│       │   └── cards/             # ProjectCard, StatsCard, AnalysisCard
│       └── routes/
│           └── AppRouter.tsx      # Protected routes
│
├── backend/                   # Express + Prisma API (port 3000)
│   └── src/
│       ├── modules/
│       │   ├── auth/              # Register, login (JWT)
│       │   ├── projects/          # CRUD
│       │   ├── features/          # CRUD + reorder
│       │   ├── analysis/          # Scope analysis
│       │   ├── ai/                # Gemini integration
│       │   └── dashboard/         # Aggregated stats
│       ├── middlewares/
│       │   ├── auth.middleware.ts  # JWT verify
│       │   └── error.middleware.ts
│       └── config/
│           └── swagger.ts
│
└── prisma/
    └── schema.prisma              # Database schema
```

---

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String     @id @default(uuid())
  name        String
  description String?
  type        String     // saas | ecommerce | chatbot | landing_page
  status      String     @default("draft") // draft | active | completed | at_risk
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  features    Feature[]
  analyses    Analysis[]
}

model Feature {
  id          String  @id @default(uuid())
  projectId   String
  title       String
  description String?
  category    String
  priority    String  @default("medium") // low | medium | high | critical
  order       Int     @default(0)
  type        String  @default("original") // original | new
  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Analysis {
  id                   String   @id @default(uuid())
  projectId            String
  scopeIncreasePercent Float
  additionalHours      Float
  delayWeeks           Float
  riskLevel            String   // low | medium | high | critical
  complexity           String   // low | medium | high
  createdAt            DateTime @default(now())
  project              Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

---

## API Reference

Base URL: `http://localhost:3000/api`  
Interactive docs: `http://localhost:3000/api-docs`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account → returns user |
| POST | `/auth/login` | Sign in → returns `{ token }` |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects |
| POST | `/projects` | Create a project |
| GET | `/projects/:id` | Get a single project |
| PUT | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project (cascades features & analyses) |

### Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/features` | List features for a project |
| POST | `/projects/:id/features` | Add a feature |
| PUT | `/projects/:projectId/features/:id` | Update a feature |
| DELETE | `/projects/:projectId/features/:id` | Delete a feature |
| PUT | `/projects/:id/features/reorder` | Reorder features (`{ orderedIds: string[] }`) |

### Analyses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/analyses` | List all analyses for a project |
| GET | `/projects/:id/analyses/latest` | Get most recent analysis |
| POST | `/projects/:id/analyses` | Save a new analysis result |
| DELETE | `/projects/:id/analyses/:analysisId` | Delete an analysis |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (Replit's built-in DB works out of the box)

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_jwt_secret_here
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

### Run Locally

**Backend** (port 3000):
```bash
cd backend
npm install
npm run dev
```

**Frontend** (port 5000):
```bash
cd frontend
npm install
npm run dev
```

The frontend proxies all `/api` requests to the backend via Vite's dev proxy, so no CORS setup is needed in development.

### Database Setup

```bash
# Apply schema to your database
npx prisma db push

# (Optional) Open Prisma Studio to browse data
npx prisma studio
```

---

## Authentication Flow

1. User registers at `/signup` → account created in DB, auto-login fires
2. Login calls `POST /api/auth/login` → receives a signed JWT (24h expiry)
3. JWT is stored in `localStorage` as `scopeai_token`
4. All authenticated API requests include `Authorization: Bearer <token>`
5. `AuthContext` decodes the token client-side to display user name/email
6. Token expiry is checked on every page load — expired tokens are cleared automatically
7. Logout removes the token and redirects to `/login`

---

## Key Design Decisions

- **Vite proxy** — The frontend always calls `/api/...` (relative). Vite forwards to `localhost:3000` in dev. This avoids CORS entirely and makes the base URL environment-agnostic.
- **Flat Analysis model** — Instead of nested sub-tables, analysis results are stored as a single flat row per run for simplicity and fast queries.
- **Cascade deletes** — Deleting a project automatically removes all its features and analyses via Prisma's `onDelete: Cascade`.
- **Lazy feature loading** — Features and analyses are fetched per-project when a project becomes active, keeping the initial dashboard load fast.
- **No auth on data routes** — Project/feature/analysis routes are currently open (no `verifyToken` middleware) to simplify the MVP. Auth can be enforced by adding the middleware back when user-scoped data isolation is needed.

---

## License

MIT
