# ExamHub

> A role-based online examination platform where teachers build courses, publish exams, and grade attempts, while students enroll, take exams, and review results in real time.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### For Teachers
- Create and manage courses (code, name, description).
- Approve or reject student enrollment requests from a unified inbox.
- Upload course materials (PDFs, docs, slides, images) — stored in **Cloudinary**.
- Create exams with auto-graded multiple-choice / true-false questions.
- Publish / unpublish exams per course.
- View per-exam results, export grade sheets as PDF.
- Manage enrolled students per course.

### For Students
- Browse available courses and submit enrollment requests.
- Track pending / approved / rejected enrollment status.
- View enrolled courses and access their materials.
- Take published exams with a countdown timer.
- Auto-graded submission with instant score feedback.
- Review past attempts and per-question correctness.
- Download results as PDF.

### Platform
- JWT-based session via **NextAuth v5 (Credentials provider)**.
- Role-based middleware protection for `/teacher-dashboard` and `/student-dashboard`.
- Server actions and API routes share a typed `db` wrapper that auto-camelCases Postgres identifiers.
- Responsive UI with framer-motion animations and a dark glassmorphic theme.

---

## Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Framework        | Next.js 16 (App Router, React 19, RSC)         |
| Language         | TypeScript 5                                   |
| Auth             | NextAuth v5 beta (Credentials + JWT)           |
| Database         | PostgreSQL 16                                  |
| DB Driver        | `postgres` (postgres-js) with camelCase helper |
| File Storage     | Cloudinary (raw + image resources)             |
| Styling          | Tailwind CSS v4 + custom glassmorphic CSS      |
| UI / Motion      | lucide-react icons, framer-motion, sonner      |
| PDF Export       | jspdf + jspdf-autotable                        |
| Deployment       | Vercel (serverless)                            |

---

## Architecture

```
examhub/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Sign-in / sign-up route group
│   ├── api/                  # 25 typed route handlers (REST)
│   ├── teacher-dashboard/    # Teacher-only pages
│   ├── student-dashboard/    # Student-only pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── error.tsx / not-found.tsx
├── components/               # Shared UI (navbar, light rays, ui/*)
├── lib/
│   ├── db.ts                 # postgres-js wrapper + camelCase helper
│   └── setup.ts              # `CREATE TABLE IF NOT EXISTS` migrations
├── models/types/             # TypeScript interfaces for each entity
├── public/uploads/           # Local dev uploads (replaced by Cloudinary in prod)
├── scripts/
│   └── initDB.ts             # Runs lib/setup.ts against DATABASE_URL
├── auth.ts                   # NextAuth config (Credentials + JWT)
├── middleware.ts             # Edge middleware for dashboard gating
├── next.config.ts
└── package.json
```

### Data Model

```
users               (id, name, email, password, role, createdAt, updatedAt)
courses             (id, code, name, description, teacherId → users)
course_enrollments  (id, courseId, status, studentId, approvedAt, createdAt)
materials           (id, courseId, title, fileUrl, type, uploadedBy)
exams               (id, courseId, title, description, durationMin, isPublished)
questions           (id, examId, text, options, correctAnswer, marks)
exam_attempts       (id, examId, studentId, score, startedAt, submittedAt)
student_answers     (id, attemptId, questionId, selectedAnswer, isCorrect)
```

### Identifier Case Handling

`postgres-js` lowercases every unquoted identifier. A `SELECT ... e.courseId` row comes back with the key `courseid`. The shared `db.query` / `db.execute` wrapper in `lib/db.ts` runs every result through `camelCaseKeys()`, so route handlers and components can keep using `row.courseId` without quoting SQL identifiers.

---

## Getting Started

### Prerequisites

- **Node.js** 20+ and **npm** 10+
- A **PostgreSQL** 14+ instance (local, Supabase, Neon, or Railway)
- A free **Cloudinary** account for material uploads

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/examhub.git
cd examhub
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your real values (see [Environment Variables](#environment-variables)).

### 3. Initialize the database

```bash
npm run init-db
```

This runs `lib/setup.ts`, which creates every table with `CREATE TABLE IF NOT EXISTS`.

### 4. Start the dev server

```bash
npm run dev
```

Open <http://localhost:3000> and sign up as a **TEACHER** or **STUDENT**.

---

## Environment Variables

All variables live in `.env.local` for local dev, and in **Vercel → Project Settings → Environment Variables** for production.

| Variable                   | Required | Description                                                                 |
| -------------------------- | -------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`             | ✅       | Postgres connection string. Use the **pooled** URL on Vercel (`?pgbouncer=true` for Supabase / Neon). |
| `AUTH_SECRET`              | ✅       | Long random string. Generate with `openssl rand -base64 32`.                |
| `AUTH_URL` / `NEXTAUTH_URL`| ⚠️       | Only required outside Vercel. Use `http://localhost:3000` locally.          |
| `CLOUDINARY_CLOUD_NAME`    | ✅       | From Cloudinary dashboard → Settings.                                       |
| `CLOUDINARY_API_KEY`       | ✅       | From Cloudinary dashboard → Settings.                                       |
| `CLOUDINARY_API_SECRET`    | ✅       | From Cloudinary dashboard → Settings.                                       |

> ⚠️ **Never commit `.env.local`** — it is already in `.gitignore`. If a secret ever leaks, **rotate it immediately** in the issuing dashboard and update the Vercel env var.

---

## Database Setup

The repo ships a `scripts/initDB.ts` that calls every `createXxxTable()` migration in `lib/setup.ts`. Run it once after every fresh Postgres database:

```bash
npm run init-db
```

To add a new table, append a `createXxxTable()` function to `lib/setup.ts` and call it from `createAllTables()`. Use `CREATE TABLE IF NOT EXISTS` so the script is idempotent.

---

## Available Scripts

| Script              | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Start Next.js dev server with HMR on port 3000.              |
| `npm run build`     | Production build (runs type-checking, lint, and bundling).   |
| `npm run start`     | Serve the production build.                                  |
| `npm run lint`      | Run ESLint across the project.                               |
| `npm run init-db`   | Create every table in the connected Postgres database.       |

---

## Project Structure

```
app/
├── (auth)/
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── api/                          # 25 route handlers, all auth-gated
│   ├── auth/[...nextauth]/route.ts
│   ├── auth/register/route.ts
│   ├── courses/teacher/route.ts
│   ├── student/                   # 11 student endpoints
│   └── teacher/                   # 12 teacher endpoints
├── teacher-dashboard/
│   ├── page.tsx
│   ├── layout.tsx
│   └── components/                # CreateCourseForm, ExamModal, ...
├── student-dashboard/
│   ├── page.tsx
│   ├── layout.tsx
│   └── components/                # MyCourses, AvailableCourses, ...
├── layout.tsx
├── page.tsx
├── error.tsx
└── not-found.tsx
components/
├── navbar.tsx
├── background-lights.tsx
├── LightRays.tsx
└── ui/                           # button, card, input, label
lib/
├── db.ts                         # postgres-js + camelCase wrapper
└── setup.ts                      # SQL migrations
models/types/                     # ICourse, IExam, IQuestion, ...
middleware.ts                     # Edge role-gating
```

---

## API Reference

All routes are under `/api` and require a valid session JWT unless noted. Teachers and students are gated by `session.user.role`.

### Auth
| Method | Path                       | Description                  |
| ------ | -------------------------- | ---------------------------- |
| POST   | `/api/auth/register`       | Create a TEACHER or STUDENT. |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler.            |

### Teacher (`role: TEACHER`)
| Method | Path                                              | Description                       |
| ------ | ------------------------------------------------- | --------------------------------- |
| GET / POST | `/api/courses/teacher`                         | List / create own courses.        |
| GET    | `/api/teacher/enrollmentRequests`                 | Pending requests for own courses. |
| PATCH / DELETE | `/api/teacher/enrollmentRequests/[id]`     | Approve / reject request.         |
| GET / POST | `/api/teacher/exams`                          | List / create exams.              |
| GET    | `/api/teacher/exams/[courseId]`                   | Exams for a course.               |
| GET    | `/api/teacher/examResults/[courseId]`             | All results for a course.         |
| GET    | `/api/teacher/examResults/byExam/[examId]`        | Results for one exam.             |
| GET / POST | `/api/teacher/materials`                      | List / upload (Cloudinary).       |
| DELETE | `/api/teacher/materials/[id]`                    | Remove a material.                |
| GET / POST | `/api/teacher/questions`                      | List / create questions.          |
| GET    | `/api/teacher/students/[courseId]`               | Enrolled students.                |

### Student (`role: STUDENT`)
| Method | Path                                            | Description                            |
| ------ | ----------------------------------------------- | -------------------------------------- |
| GET    | `/api/student/availableCourse/[id]`             | Joinable courses (excludes joined).    |
| GET    | `/api/student/myCourses`                        | Approved enrollments.                  |
| GET    | `/api/student/pendingRequests`                  | Status of outstanding requests.        |
| POST   | `/api/student/enrollmentsRequest`               | Request to join a course.              |
| DELETE | `/api/student/enrollmentsRequest/[id]`          | Cancel a pending request.              |
| GET    | `/api/student/exams`                            | Published exams for enrolled courses.  |
| GET    | `/api/student/questions/[examId]`               | Questions for an exam.                 |
| GET    | `/api/student/questions/count/[examId]`         | Number of questions on an exam.        |
| POST   | `/api/student/exam/submit`                      | Submit answers and auto-grade.         |
| GET    | `/api/student/examAttempts`                     | Past attempts.                         |
| GET    | `/api/student/examAttempts/[attemptId]`         | Single attempt detail.                 |
| GET    | `/api/student/materials/[courseId]`             | Materials for a course.                |

---

## Deployment

### Vercel (recommended)

1. **Push the repo to GitHub** (see below).
2. Go to <https://vercel.com/new> and import the repository.
3. Vercel auto-detects Next.js. Accept the defaults.
4. Open **Project Settings → Environment Variables** and add every variable from [Environment Variables](#environment-variables).
5. For `DATABASE_URL`, use a **pooled** connection string:
   - Supabase: `postgresql://...:6543/postgres?pgbouncer=true&sslmode=require`
   - Neon: copy the pooled URL from the Neon dashboard.
6. Click **Deploy**. Subsequent pushes to `main` auto-deploy.

### Other hosts

Any Node 20+ host works (Railway, Render, Fly.io, a VPS). Set the same env vars, expose port 3000, and run `npm run build && npm run start`.

---

## Security Notes

- **Never commit secrets.** `.env*` is in `.gitignore`. If you ever paste a key into chat or commit it by accident, **rotate the key immediately**.
- All API routes verify `auth()` and `session.user.role` server-side — middleware is a convenience layer, not the only line of defense.
- Passwords are hashed with `bcryptjs` (cost factor 10).
- SQL is parameterized via `?` placeholders that the `db` wrapper translates to `$1, $2, …` for postgres-js. Never string-concatenate user input into SQL.
- File uploads are sanitized (`[^a-zA-Z0-9._-]`) and content-typed before being stored in Cloudinary.

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/awesome-thing`
2. Commit your changes: `git commit -m "feat: add awesome thing"`
3. Push: `git push origin feat/awesome-thing`
4. Open a Pull Request describing the change and the testing you did.

Please run `npm run lint` and `npm run build` before submitting.

---

## License

[MIT](./LICENSE) — free to use, modify, and ship.
