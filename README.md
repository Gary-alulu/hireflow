# HireFlow — AI-Powered Recruitment Platform

HireFlow is a full-stack SaaS platform that covers the complete hiring journey — from job posting and candidate sourcing to application tracking, interview scheduling, and AI-assisted candidate matching.

Built on **Next.js 16** (App Router) with **MongoDB + Mongoose**, **JWT-based authentication**, and the **Google Gemini API** for AI features.

## Features

### Recruiter
- Post, publish, and manage job listings (draft / active)
- Review applicants per job with a status pipeline
- Candidate list and AI match insight
- Interview scheduling
- Recruiting analytics dashboard
- Company + personal settings

### Candidate
- Browse and search public job listings
- Submit applications
- Build and edit a professional profile (skills, experience, education, CV link)
- Track applications and upcoming interviews

### AI
- AI-assisted candidate matching / application scoring (Gemini via `lib/ai.js`)

### Platform
- Role-based access control (recruiter vs. candidate) enforced server-side
- JWT session cookies (httpOnly, 24h) + bcrypt password hashing
- Email-style public pages: Home, About, Services
- View Transition page motion (CSS-driven, no animation library required)

> **Building phase scoping:** Authentication is currently **login + signup only**.
> There is intentionally **no email verification** and no password-reset flow in
> this phase — accounts are activated on registration.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.3.8 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Lucide icons |
| Database | MongoDB (local or Atlas) via Mongoose 9 |
| Auth | jose JWT (httpOnly cookie) + bcryptjs |
| AI | @google/generative-ai (Gemini) |
| Linting | ESLint (eslint-config-next) |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally (or a MongoDB Atlas connection string)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

| Variable | Description | Required |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret used to sign session JWTs | Yes (a fallback is used in dev only) |
| `NEXTAUTH_URL` | Base URL of the app | Optional |
| `AI_API_KEY` | Google AI (Gemini) API key | For AI features |

```bash
cp .env.example .env.local
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. (Optional) Seed sample data

```bash
npm run seed
```

This creates demo users (password: `password123`), companies, jobs, applications, and interviews.

## Production Build

```bash
npm run build
npm run start
```

`next start` serves the production build (no on-demand compilation — the fast preview used during development runs on port 3100).

## Project Structure

```
app/
  (auth)/            Sign in / Sign up pages (shared layout with logo)
  api/               Backend route handlers
    auth/            register, login, logout
    candidates/      candidate search (recruiter)
    candidate/profile  candidate profile get/save (requires candidate role)
    jobs/            job listing + detail APIs
    applications/    application submit + management
    interviews/      interview scheduling
    analytics/       recruiter analytics
    settings/        account + company settings
  about/             Public About page
  services/          Public Services page
  dashboard/
    recruiter/       Recruiter dashboard, jobs, applicants, candidates, interviews, analytics, settings
    candidate/       Candidate dashboard, applications, interviews, profile
  jobs/              Public job board
components/          Sidebars, PageTransition (View Transition), ViewTransitionGuard
lib/                 auth (JWT), db (Mongoose), ai (Gemini), pipeline (statuses), utils
models/              Mongoose models (User, Job, Application, Interview, Company, CandidateProfile)
scripts/seed.js      Database seed script
proxy.js            Middleware: auth + role-based access control
```

## How Authentication Works

1. **Register / Login** (`/api/auth/register`, `/api/auth/login`) verify credentials and return a signed JWT in an httpOnly `session` cookie (24h).
2. **Middleware** (`proxy.js`) decrypts the cookie on every request and:
   - redirects unauthenticated visitors to `/login`,
   - redirects users who visit `/login` or `/register` while logged in to their dashboard,
   - enforces **role-based access control** — a candidate is redirected away from `/dashboard/recruiter` and vice versa.
3. **Logout** (`/api/auth/logout`) clears the session cookie.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server on :3000 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed the database with demo data |

## Deployment

HireFlow is ready to deploy on [Vercel](https://vercel.com). Configure the three `MONGODB_URI`, `NEXTAUTH_SECRET`, and `AI_API_KEY` environment variables on the host, and remember to add `NEXTAUTH_URL` if your auth setup requires it. `.env.local` is git-ignored — never commit real credentials.