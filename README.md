# NoteVault - Verified College Academic Repository

A focused, multi-tenant academic resource platform built with Next.js 15, React 19, Node.js native SQLite (`node:sqlite` DatabaseSync), AES-256-GCM encryption, and an extensible Bring-Your-Own-Key (BYOK) AI provider layer (Google Gemini, OpenAI, Anthropic).

The platform does one thing: **gives students quick access to the study resources (files and links) of their own college, organized by branch and course, with an AI-assisted search and summarization capability.**

---

## 1. Core Purpose & Features

- **Strict College Multi-Tenancy**: Every student and admin belongs to exactly one institution. Backend queries strictly enforce `WHERE institution_id = ?` across all resources, courses, and branches; cross-college access returns HTTP 403 Forbidden.
- **Academic Hierarchy**: College → Branch → Course → Verified Resources (full-syllabus notes, question banks, lab manuals).
- **Admin Management Desk**: Institutional admins can create/manage branches, courses, and upload verified study resources (with file type and size validation). Uploaded files are stored on disk (`public/uploads`), never in the database.
- **Bring-Your-Own-Key (BYOK) AI Layer**:
  - Supports Google Gemini, OpenAI, and Anthropic through a unified provider interface.
  - User API keys are encrypted at rest with AES-256-GCM and never exposed or logged.
  - AI search and summarization index only resources belonging to the authenticated user's college.
  - Automatic 30-second request timeouts and clear error handling for rate limits, invalid keys, or outages.

---

## 2. Prerequisites & Environment Setup

### Prerequisites
- **Node.js**: `>=22.0.0` (required for native `node:sqlite` and built-in Web Crypto).
- **npm**: `>=10.0.0`

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8004` | Application port |
| `ENCRYPTION_KEY` | *(Built-in fallback for dev)* | 32-byte key for AES-256-GCM BYOK encryption at rest |
| `JWT_SECRET` | *(Built-in fallback for dev)* | Secret for RFC 7519 HMAC-SHA256 session tokens |
| `DATABASE_PATH` | `data/app.db` | Path to SQLite database file |
| `UPLOAD_DIR` | `public/uploads` | Path to uploaded resource files |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model name for AI features |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model name for AI features |
| `ANTHROPIC_MODEL` | `claude-3-haiku-20240307` | Anthropic model name for AI features |
| `NODE_ENV` | `development` | Node environment (`development` / `production`) |

---

## 3. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 8004 |
| `npm run build` | Build optimized production bundle |
| `npm start` | Start production server |
| `npm run db:init` | Seed database with initial institutions, branches, courses, and users |
| `npm test` | Run automated test suite |
| `npm run typecheck` | Run TypeScript compiler typecheck (`tsc --noEmit`) |
| `npm run lint` | Run Next.js ESLint checks |

---

## 4. Running Tests

Execute the automated test suite using Node's native test runner with `tsx`:
```bash
npm test
```
The test suite covers:
1. AES-256-GCM encryption, decryption, and authentication tag tamper detection.
2. Scrypt password hashing with unique salts and constant-time verification.
3. RFC 7519 JWT session issuance, signature verification, and expiration.
4. Strict multi-tenant cross-college isolation (HTTP 403 enforcement).
5. AI provider abstraction layer (Gemini, OpenAI, Anthropic).
6. Admin upload, modification, and resource deletion with disk file cleanup.
7. Admin branch and course management.
8. Student & Admin signup and authentication.
9. Format validation for academic resources and PDF generation.
10. Pan-India institution registration.
11. Database idempotent seeding and transaction atomicity.
12. AI layer input validation and tenant context scoping.

---

## 5. Pre-Configured Demo Accounts

For immediate evaluation, the database comes pre-seeded with sample institutions and credentials:

- **Andhra University (`inst-au`)**
  - Student: `student@andhrauniversity.edu.in` / `Password@123`
  - Admin: `admin@andhrauniversity.edu.in` / `Password@123`
- **Gayatri Vidya Parishad College of Engineering (`inst-gvpce`)**
  - Student: `student@gvpce.ac.in` / `Password@123`
  - Admin: `admin@gvpce.ac.in` / `Password@123`
- **GITAM Deemed to be University (`inst-gitam`)**
  - Student: `student@gitam.edu` / `Password@123`
  - Admin: `admin@gitam.edu` / `Password@123`

*(One-click demo buttons are available on the Sign-In page for instant testing).*
