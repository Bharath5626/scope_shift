# ScopeAI — AI-Powered Project Scope Management Platform

A comprehensive project management tool that leverages artificial intelligence to detect scope creep, analyze project capacity, and provide actionable insights. Define your project scope, track feature additions, and get real-time risk analysis powered by Google Gemini AI with advanced what-if scenario modeling.

## 🚀 Key Features

### Project Management
- **Full Project Lifecycle**: Create, update, and manage projects with comprehensive metadata
- **Team & Timeline Configuration**: Define team size, working hours, methodology, and deadlines
- **Project Types**: Support for SaaS, E-commerce, Chatbot, Landing Page, and custom project types
- **Scope Versioning**: Track changes to project scope over time with version history
- **Deadline Tracking**: Automatic status updates based on project deadlines and capacity analysis
- **Project Sharing**: Share projects with team members with role-based access control
- **Audit Logging**: Comprehensive audit trail for all project changes and actions

### AI-Powered Analysis
- **Hybrid AI Architecture**: Google Gemini AI for feature-level analysis + deterministic backend calculations
- **Capacity Engine**: Advanced capacity calculations considering team size, working hours, and timeline
- **What-If Scenarios**: Model changes to team size, deadlines, and scope with instant impact analysis
- **Risk Assessment**: Detailed risk analysis with effort breakdown and actionable recommendations
- **Feature Generation**: AI-powered initial feature generation based on project context
- **Confidence Scoring**: AI confidence metrics based on complexity and risk factors

### User Experience
- **Modern Design System**: Consistent UI components with reusable Button, Input, and card components
- **Dark Mode**: Full dark mode support with theme persistence in database
- **Responsive Design**: Mobile-optimized interface with adaptive layouts
- **Accessibility**: WCAG-compliant with ARIA attributes, keyboard navigation, and screen reader support
- **Form Validation**: Real-time validation with clear error messages
- **Performance**: Lazy loading with React Suspense for optimal initial load times
- **Standardized Date Format**: Consistent "12 Jun 2026" format across all date displays

### Reporting & Export
- **PDF Export**: Download comprehensive analysis reports as formatted PDFs
- **CSV Export**: Export project data and analysis results to CSV spreadsheets
- **Interactive Reports**: Detailed report pages with visualizations and metrics
- **Dashboard Analytics**: Aggregated statistics across all projects
- **Effort Breakdown**: Detailed breakdown of development, testing, integration, and documentation hours

### User Management
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Profile Management**: User profiles with avatar upload functionality
- **Password Reset**: OTP-based password reset system
- **Session Management**: Automatic token expiry handling and secure session management
- **Theme Preferences**: User-specific theme preferences (light/dark mode)

## 🛠 Tech Stack

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

## 📁 Project Structure

```
/
├── frontend/                          # React + Vite app (port 5000)
│   └── src/
│       ├── pages/
│       │   ├── DashboardPage.tsx      # Main dashboard with analytics
│       │   ├── ProjectsPage.tsx       # Project listing and management
│       │   ├── CreateProjectPage.tsx  # Project creation wizard
│       │   ├── ProjectDetailPage.tsx  # Individual project view
│       │   ├── ScopeBuilder.tsx       # Feature scope definition with drag-and-drop
│       │   ├── AnalysisPage.tsx      # AI analysis initiation
│       │   ├── AnalyzingPage.tsx      # Analysis progress display
│       │   ├── AnalysisResultsPage.tsx # Analysis results view
│       │   ├── ReportsPage.tsx        # Reports listing with export
│       │   ├── ReportDetailPage.tsx   # Detailed report view with tabs
│       │   ├── ProjectHistoryPage.tsx # Project history with delete functionality
│       │   ├── UpcomingDeadlinesPage.tsx # Deadline tracking
│       │   ├── SharedProjectsPage.tsx # Shared projects management
│       │   ├── SharedProjectDetailPage.tsx # Shared project details
│       │   ├── LoginPage.tsx          # Authentication
│       │   └── SignupPage.tsx         # User registration
│       ├── context/
│       │   ├── AuthContext.tsx        # JWT auth state & user profile
│       │   ├── ProjectContext.tsx      # API-backed project state
│       │   ├── DashboardContext.tsx    # Dashboard analytics state
│       │   └── ThemeContext.tsx        # Dark mode theme state
│       ├── services/
│       │   └── api.ts                 # Enhanced fetch wrapper with retry logic
│       ├── components/
│       │   ├── layout/                # AppLayout, Sidebar, DashboardLayout, UserDropdown
│       │   ├── cards/                 # ProjectCard, AnalysisCard, StatsCard
│       │   ├── ui/                    # Reusable Button, Input components
│       │   ├── EmptyState.tsx         # Empty state component
│       │   ├── LoadingSkeleton.tsx    # Loading skeleton component
│       │   ├── ThemeToggle.tsx        # Theme toggle component
│       │   ├── Toast.tsx              # Toast notification component
│       │   └── UserProfileModal.tsx   # User profile modal with settings
│       ├── utils/
│       │   ├── constants.ts           # Project types, labels, status
│       │   ├── designSystem.ts        # Design system constants
│       │   └── formatters.ts          # Date and number formatting
│       ├── types/
│       │   └── index.ts               # TypeScript type definitions
│       └── routes/
│           └── AppRouter.tsx          # Route configuration with lazy loading
│
├── backend/                           # Express + Prisma API (port 3000)
│   └── src/
│       ├── modules/
│       │   ├── auth/                  # Register, login, password reset (JWT)
│       │   ├── users/                 # User profile, avatar upload, theme preferences
│       │   ├── projects/              # CRUD, status sync, metadata
│       │   ├── features/              # CRUD + reorder, scope tracking
│       │   ├── scopeVersions/         # Scope version history
│       │   ├── analysis/              # Analysis results, history
│       │   ├── auditLogs/             # Audit logging for project changes
│       │   ├── ai/                    # Gemini integration, capacity engine
│       │   │   ├── ai.service.ts      # AI analysis orchestration
│       │   │   ├── ai-utils.ts        # Error handling, validation
│       │   │   ├── scope-calculations.ts # Capacity calculations
│       │   │   ├── prompts/           # AI prompt templates
│       │   │   └── *.test.ts          # Comprehensive test suites
│       │   └── dashboard/             # Aggregated stats, analytics
│       ├── middlewares/
│       │   ├── auth.middleware.ts     # JWT verification
│       │   ├── error.middleware.ts    # Global error handling
│       │   ├── rateLimit.middleware.ts # API rate limiting
│       │   ├── upload.middleware.ts   # File upload handling
│       │   └── validate.middleware.ts # Request validation with Zod
│       ├── config/
│       │   ├── database.ts           # Prisma client
│       │   ├── env.ts                # Environment variables
│       │   └── swagger.ts             # API docs configuration
│       ├── routes/
│       │   └── index.ts              # Route aggregation
│       ├── app.ts                    # Express app configuration
│       └── server.ts                 # Server entry point
│
├── backend/prisma/
│   └── schema.prisma                 # Database schema with User, Project, Feature, Analysis, AuditLog, ProjectMember
│
└── docs/
    ├── api-spec.md                   # API specification
    ├── architecture.md               # System architecture documentation
    └── database-schema.md            # Database schema documentation
```

## 🗄 Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum UserTheme {
  light
  dark
}

model User {
  id            String   @id @default(uuid())
  name          String
  email         String   @unique
  password      String
  profileImage  String?
  theme         UserTheme @default(light)

  // OTP for password reset
  otpCode       String?
  otpExpiresAt  DateTime?

  projects      Project[]
  projectMembers ProjectMember[]
  auditLogs     AuditLog[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Project {
  id            String   @id @default(uuid())

  name          String
  description   String?  @db.Text
  type          String
  status        String   @default("draft") // draft | active | completed | at_risk

  startDate     DateTime?
  deadline      DateTime?

  teamSize      Int?
  techStack     String?  @db.Text
  projectType   String?
  methodology   String?
  workingHours  Int?
  logo          String?  @db.Text

  createdById   String
  createdBy     User @relation(fields: [createdById], references: [id])

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  features      Feature[]
  analyses      Analysis[]
  auditLogs     AuditLog[]
  projectMembers ProjectMember[]
}

model Feature {
  id          String @id @default(uuid())
  projectId   String
  title       String
  description String?
  category    String
  priority    String @default("medium") // low | medium | high
  order       Int    @default(0)
  type        String @default("original") // original | new

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model Analysis {
  id                   String @id @default(uuid())
  projectId            String
  analysisHash         String? // SHA256 hash of feature set for duplicate detection
  
  // Legacy fields (kept for backward compatibility)
  scopeIncreasePercent Float?
  additionalHours      Float?
  delayWeeks           Float?
  
  // Capacity engine metrics
  workingDays          Int?
  availableHours       Float?
  productiveHours      Float?
  rawDevelopmentHours  Float?
  testingHours         Float?
  integrationHours     Float?
  documentationHours   Float?
  reworkHours          Float?
  estimatedHours       Float?
  estimatedWeeks       Float?
  capacityUtilization  Float?
  bufferHours          Float?
  bufferPercent        Float?
  timelineFit          String?
  
  // Derived metrics
  scopeScore           Int?
  complexityLevel      String?
  complexityScore      Int?
  riskLevel            String?
  projectHealth        String?
  confidence           Int?
  
  // JSON fields for complex data
  effortBreakdown      Json?
  riskFactors          Json?
  recommendations      Json?

  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, analysisHash])
}

model AuditLog {
  id          String   @id @default(uuid())
  projectId   String
  action      String   // created, updated, deleted, status_changed, feature_added, feature_removed, etc.
  description String?  @db.Text
  changes     Json?    // JSON object with field changes { field: { from: value, to: value } }
  userId      String?
  features    Json?    // Snapshot of features at the time of this log

  createdAt   DateTime @default(now())

  project     Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User?   @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([projectId])
  @@index([createdAt])
  @@index([userId])
}

model ProjectMember {
  id        String   @id @default(uuid())
  projectId String
  userId    String
  role      String   @default("member") // owner, admin, member, viewer

  createdAt DateTime @default(now())

  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
}
```

## 🔄 Project Status Workflow

Projects automatically transition through the following statuses:

1. **Draft** (default): Project is created but not yet analyzed
2. **Active**: Analysis is completed, project is in progress
3. **Completed**: Project deadline has passed
4. **At Risk**: Project timeline at risk due to scope creep or capacity issues

Status transitions occur automatically:
- When an analysis is created → status changes to "active"
- When the deadline passes → status changes to "completed" (via cron job)
- When capacity utilization exceeds 90% → status changes to "at_risk"

## 🤖 AI Architecture

The system uses a hybrid AI approach combining Google Gemini AI with deterministic backend calculations:

### AI Responsibilities (Google Gemini)
- **Feature-Level Analysis**: Estimates complexity and effort for individual features
- **Risk Identification**: Provides specific technical risks tied to architecture and dependencies
- **Engineering Recommendations**: Suggests actionable strategies to reduce timeline or risk
- **Feature Generation**: Generates initial feature sets based on project context

### Backend Responsibilities (Deterministic)
- **Capacity Calculations**: Calculates available hours, productive hours, and timeline fit
- **Project-Level Metrics**: Computes total hours, estimated weeks, risk level, scope score
- **Effort Breakdown**: Distributes hours across development, testing, integration, documentation
- **Health Assessment**: Derives project health from buffer percent and capacity utilization

### What-If Scenarios
The capacity engine supports scenario modeling:
- Team size changes (e.g., "What if I increase team from 3 to 6?")
- Deadline changes (e.g., "What if I delay by 2 weeks?")
- Scope changes (e.g., "What if I remove authentication?")
- Tech stack changes (e.g., "What if I change React to Angular?")

## 📡 API Reference

Base URL: `http://localhost:3000/api`  
Interactive docs: `http://localhost:3000/api-docs`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account → returns user |
| POST | `/auth/login` | Sign in → returns `{ token }` |
| POST | `/auth/forgot-password` | Request password reset OTP |
| POST | `/auth/verify-otp` | Verify OTP and reset password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update user profile (including theme) |
| POST | `/users/me/avatar` | Upload profile avatar |
| GET | `/users` | List all users (for project sharing) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects (filtered by user) |
| POST | `/projects` | Create a project with full metadata |
| GET | `/projects/:id` | Get a single project |
| PUT | `/projects/:id` | Update project details |
| DELETE | `/projects/:id` | Delete project (cascades features & analyses) |
| GET | `/projects/analyzed` | Get projects with completed analyses |
| GET | `/projects/shared` | Get projects shared with user |

### Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/features` | List features for a project |
| POST | `/projects/:id/features` | Add a feature |
| PUT | `/projects/:projectId/features/:id` | Update a feature |
| DELETE | `/projects/:projectId/features/:id` | Delete a feature |
| PUT | `/projects/:id/features/reorder` | Reorder features (`{ orderedIds: string[] }`) |

### Scope Versions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/versions` | List scope versions |
| POST | `/projects/:id/versions` | Create a scope version snapshot |

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

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Get aggregated dashboard statistics |
| GET | `/dashboard/deadlines` | Get upcoming project deadlines |

### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/audit-logs` | Get audit logs for a project |

### Project Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/members` | List project members |
| POST | `/projects/:id/members` | Add member to project |
| DELETE | `/projects/:id/members/:userId` | Remove member from project |
| PUT | `/projects/:id/members/:userId` | Update member role |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- Google Gemini API key

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
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

## 🔐 Authentication Flow

1. User registers at `/signup` → account created in DB, auto-login fires
2. Login calls `POST /api/auth/login` → receives a signed JWT (24h expiry)
3. JWT is stored in `localStorage` as `scopeai_token`
4. All authenticated API requests include `Authorization: Bearer <token>`
5. `AuthContext` decodes the token client-side to display user name/email
6. Token expiry is checked on every page load — expired tokens are cleared automatically
7. Logout removes the token and redirects to `/login`
8. Password reset: User requests OTP → receives email → verifies OTP → resets password

## 🎨 Design System

The application uses a comprehensive design system defined in `frontend/src/utils/designSystem.ts`:

### Design Tokens
- **Border Radius**: Consistent rounded corners for buttons, cards, inputs
- **Typography**: Defined font sizes for page titles, headings, body, captions
- **Shadows**: Card shadows with hover effects
- **Transitions**: Smooth animations for interactive elements
- **Icon Sizes**: Consistent icon sizing across components
- **Spacing**: Standardized padding and margins

### Reusable Components
- **Button**: Primary, secondary, and danger variants with loading states
- **Input**: Text inputs with validation states and error messages
- **Cards**: Project cards, analysis cards, stats cards with consistent styling
- **Layout Components**: Sidebar, AppLayout, DashboardLayout for consistent page structure
- **Modal Components**: UserProfileModal with tabs for account, preferences, security
- **Feedback Components**: Toast notifications, LoadingSkeleton for async operations

### Accessibility
- ARIA attributes on interactive elements
- Keyboard navigation support
- Skip-to-content links
- Focus management
- Screen reader compatibility

### Date Formatting
All dates across the application use a standardized format: "12 Jun 2026" (day numeric, month short, year numeric) using the `en-GB` locale for consistency.

## 🔑 Key Design Decisions

- **Hybrid AI Architecture**: AI handles feature-level analysis while backend handles deterministic project-level calculations for consistency and reliability
- **Vite Proxy**: The frontend calls `/api/...` (relative). Vite forwards to `localhost:3000` in dev, avoiding CORS.
- **MySQL over PostgreSQL**: Uses MySQL for broader compatibility and simpler hosting options.
- **JSON Fields in Analysis**: Effort breakdown, risk factors, and recommendations stored as JSON for flexibility.
- **Cascade Deletes**: Deleting a project automatically removes all its features and analyses via Prisma's `onDelete: Cascade`.
- **Analysis Hashing**: SHA256 hash of feature set prevents duplicate analyses for identical scopes.
- **Lazy Loading**: All page components are lazy-loaded with React Suspense for optimal initial bundle size.
- **Design System**: Centralized design tokens ensure UI consistency across the application.
- **Error Handling**: Enhanced API error handling with retry logic, timeouts, and user-friendly error messages.
- **Rate Limiting**: API rate limiting middleware prevents abuse and ensures fair usage.
- **File Upload**: Multer middleware handles avatar uploads with size and type validation.
- **Theme Persistence**: User theme preferences stored in database and synced across devices.
- **Audit Logging**: Comprehensive audit trail for all project changes with feature snapshots.
- **Project Sharing**: Role-based access control for project collaboration.
- **Permission Checks**: Frontend permission checks prevent unauthorized actions (e.g., delete button only for project creator).

## 🧪 Testing

The backend includes comprehensive test coverage:

```bash
# Run all tests
cd backend
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

Test suites include:
- AI service tests
- Capacity engine tests
- Derivation logic tests
- Database integration tests
- Scope calculations tests

## 📝 Development Notes

### Adding New Features
1. Update database schema in `backend/prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Create backend module in `backend/src/modules/`
4. Add API routes and controllers
5. Create frontend page in `frontend/src/pages/`
6. Add route in `frontend/src/routes/AppRouter.tsx`
7. Update design system if needed

### AI Prompt Engineering
AI prompts are located in `backend/src/modules/ai/prompts/`. When modifying prompts:
- Test with various project types
- Validate JSON response structure
- Check for edge cases
- Monitor token usage

### Performance Optimization
- Use lazy loading for new pages
- Implement pagination for large lists
- Add loading skeletons for async operations
- Optimize database queries with Prisma
- Cache frequently accessed data

### Code Quality
- TypeScript for type safety across frontend and backend
- ESLint for code linting
- Consistent code formatting
- Comprehensive error handling
- Input validation with Zod

## 🚢 Deployment

### Backend Deployment
1. Set environment variables in production
2. Build TypeScript: `npm run build`
3. Start server: `npm start`
4. Ensure MySQL database is accessible
5. Configure CORS for production domain

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy `dist/` folder to static hosting
3. Update API base URL for production
4. Configure proper routing for SPA

## 📄 License

MIT
