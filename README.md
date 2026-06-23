# ScopeAI — Scope Creep Analyzer

AI-powered project scope management tool that detects scope creep before it derails your timeline. Define your project scope, track feature additions, and get real-time risk analysis powered by Google Gemini AI.

## Features

- **Project Management**: Create, update, and manage projects with deadlines
- **Feature Tracking**: Add and organize project features with drag-and-drop reordering
- **AI-Powered Analysis**: Automatic scope creep detection using Google Gemini AI
- **Risk Assessment**: Get detailed risk analysis with effort breakdown and recommendations
- **Project Status Workflow**: Track project status through draft → active → completed lifecycle
- **PDF Export**: Download comprehensive analysis reports as PDF
- **Excel Export**: Export project data to Excel spreadsheets
- **Deadline Tracking**: Automatic status updates based on project deadlines
- **Authentication**: Secure JWT-based user authentication

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
| jsPDF | 4.2 | PDF generation |
| jspdf-autotable | 5.0 | PDF table generation |
| xlsx | 0.18 | Excel export |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Express | 5 | HTTP server |
| TypeScript | 6 | Type safety |
| Prisma | 6 | ORM & migrations |
| MySQL | — | Primary database |
| jsonwebtoken | 9 | JWT authentication |
| bcryptjs | 3 | Password hashing |
| Zod | 4 | Request validation |
| @google/genai | 2.8 | Gemini AI integration |
| node-cron | 4.5 | Scheduled tasks |
| Swagger UI | 5 | API documentation |

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
│       │   ├── AnalysisPage.tsx
│       │   ├── AnalysisResultsPage.tsx
│       │   ├── ReportsPage.tsx
│       │   ├── ReportDetailPage.tsx
│       │   ├── LoginPage.tsx
│       │   └── SignupPage.tsx
│       ├── context/
│       │   ├── AuthContext.tsx    # JWT auth state
│       │   └── ProjectContext.tsx # API-backed project state
│       ├── services/
│       │   └── api.ts             # Fetch wrapper
│       ├── components/
│       │   ├── layout/            # AppLayout, Sidebar
│       │   └── cards/             # ProjectCard, StatsCard
│       └── utils/
│           └── constants.ts       # Project types, labels
│
├── backend/                   # Express + Prisma API (port 3000)
│   └── src/
│       ├── modules/
│       │   ├── auth/              # Register, login (JWT)
│       │   ├── projects/          # CRUD, status sync
│       │   ├── features/          # CRUD + reorder
│       │   ├── analysis/          # Scope analysis, cron job
│       │   ├── ai/                # Gemini integration
│       │   └── dashboard/         # Aggregated stats
│       ├── middlewares/
│       │   ├── auth.middleware.ts  # JWT verify
│       │   └── error.middleware.ts
│       └── config/
│           ├── database.ts        # Prisma client
│           └── swagger.ts         # API docs config
│
└── backend/prisma/
    └── schema.prisma              # Database schema
```

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  projects  Project[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?  @db.Text
  type        String   // saas | ecommerce | chatbot | landing_page
  status      String   @default("draft") // draft | active | completed | at_risk
  deadline    DateTime?

  createdById String
  createdBy   User @relation(fields: [createdById], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  features Feature[]
  analyses Analysis[]
}

model Feature {
  id          String @id @default(uuid())
  projectId   String
  title       String
  description String?
  category    String
  priority    String @default("medium") // low | medium | high | critical
  order       Int    @default(0)
  type        String @default("original") // original | new

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Analysis {
  id                   String @id @default(uuid())
  projectId            String
  scopeIncreasePercent Float
  additionalHours      Float
  delayWeeks           Float
  riskLevel            String   // low | medium | high | critical
  complexity           String   // low | medium | high
  effortBreakdown      Json?    // { development, testing, integration, documentation }
  riskFactors          Json?    // string[]
  recommendations      Json?    // string[]

  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

## Project Status Workflow

Projects automatically transition through the following statuses:

1. **Draft** (default): Project is created but not yet analyzed
2. **Active**: Analysis is completed, project is in progress
3. **Completed**: Project deadline has passed
4. **At Risk**: (future) Project timeline at risk due to scope creep

The status is updated automatically:
- When an analysis is created → status changes to "active"
- When the deadline passes → status changes to "completed" (via cron job every 10 minutes)

## API Reference

Base URL: `http://localhost:3000/api`  
Interactive docs: `http://localhost:3000/api-docs`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account → returns user |
| POST | `/auth/login` | Sign in → returns `{ token }` |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects (filtered by user) |
| POST | `/projects` | Create a project (includes deadline) |
| GET | `/projects/:id` | Get a single project |
| PUT | `/projects/:id` | Update project (name, description, type, deadline, status) |
| DELETE | `/projects/:id` | Delete project (cascades features & analyses) |
| GET | `/projects/analyzed` | Get projects with completed analyses |

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

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/projects/:id/ai/analyze` | Run AI scope analysis (updates project status to "active") |
| POST | `/projects/:id/ai/generate-features` | Generate initial project features using AI |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- Google Gemini API key

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your_jwt_secret_here
GOOGLE_AI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### Installation

**Backend** (port 3000):
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

**Frontend** (port 5000):
```bash
cd frontend
npm install
npm run dev
```

The frontend proxies all `/api` requests to the backend via Vite's dev proxy.

### Database Setup

```bash
# Apply schema to your database
cd backend
npx prisma db push

# (Optional) Open Prisma Studio to browse data
npx prisma studio
```

## Authentication Flow

1. User registers at `/signup` → account created in DB, auto-login fires
2. Login calls `POST /api/auth/login` → receives a signed JWT (24h expiry)
3. JWT is stored in `localStorage` as `scopeai_token`
4. All authenticated API requests include `Authorization: Bearer <token>`
5. `AuthContext` decodes the token client-side to display user name/email
6. Token expiry is checked on every page load — expired tokens are cleared automatically
7. Logout removes the token and redirects to `/login`

## Key Design Decisions

- **Vite proxy** — The frontend calls `/api/...` (relative). Vite forwards to `localhost:3000` in dev, avoiding CORS.
- **MySQL over PostgreSQL** — Uses MySQL for broader compatibility and simpler hosting options.
- **JSON fields in Analysis** — Effort breakdown, risk factors, and recommendations stored as JSON for flexibility.
- **Cascade deletes** — Deleting a project automatically removes all its features and analyses via Prisma's `onDelete: Cascade`.
- **Cron job for status sync** — A background job runs every 10 minutes to update project statuses based on deadlines.
- **AI integration** — Google Gemini AI provides intelligent scope analysis and feature generation.
- **PDF/Excel export** — jsPDF and xlsx libraries enable report generation and data export.

## License

MIT
