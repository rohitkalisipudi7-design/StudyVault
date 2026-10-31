# NoteVault - College Academic Resource Platform

A focused, multi-tenant academic resource platform built with Next.js, Node.js native SQLite (`DatabaseSync`), AES-256-GCM encryption, and an extensible Bring-Your-Own-Key (BYOK) AI provider layer (Google Gemini, OpenAI, Anthropic).

The platform does one thing: **gives students quick access to the study resources (files and links) of their own college, organized by branch and course, with an AI-assisted search and summarization capability.**

---

## 1. Refactoring Plan & Removed Scope

### Purpose & Scope Cleanup
All features, demo pages, filler content, and decorative sections that did not directly serve the core purpose were systematically removed:

- **Removed Non-Essential Pages & Routes**:
  - `/about`, `/exam`, `/chat`, `/courses`, `/resources`, `/contribute`, `/discover`, `/library`, `/home`, `/search`
  - `/admin/dashboard`, `/admin/review`
- **Removed Fake & Decorative Content**:
  - Removed generic marketing copy ("World-class notes", "Top 1% students", fake MIT faculty personas `dr.thorne@mit.edu`, fake keys `INST-VERIFY-2026`).
  - Removed all hardcoded institutional catalogs (`src/lib/institutional-data.ts`, `placeholder-images.ts`).
  - College names only appear where functionally relevant: in the authenticated user's header badge, institutional archive header, or registration selector.
- **Removed Heavy & Fragmented Dependencies**:
  - Replaced legacy Google Genkit dependencies with a lean, server-side multi-provider abstraction layer (`src/server/ai/`).
  - Replaced mock client-side authentication with server-side RFC 7519 JWT HMAC-SHA256 sessions with scrypt password hashing and constant-time comparison.

---

## 2. Architecture & Refactored Code Structure

The backend follows a clean, layered architectural design:
`Routes (Next.js API) -> Middleware/Guards -> Services -> Data Access (node:sqlite)`

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # Authenticate user & issue HTTP-only JWT
│   │   │   ├── signup/route.ts      # Multi-tenant user registration
│   │   │   ├── logout/route.ts      # Clear auth session
│   │   │   └── me/route.ts          # Current authenticated user profile
│   │   ├── institutions/route.ts    # List registered institutions
│   │   ├── branches/route.ts        # Institution-scoped branches (GET / POST)
│   │   ├── courses/route.ts         # Branch-scoped courses (GET / POST)
│   │   ├── resources/
│   │   │   ├── route.ts             # List institution resources & upload (file/link)
│   │   │   └── [id]/route.ts        # Get, edit, delete resource (with 403 checks)
│   │   └── ai/
│   │       ├── config/route.ts      # BYOK key configuration & encryption at rest
│   │       ├── search/route.ts      # Scoped natural language AI search
│   │       ├── summarize/route.ts   # Resource exam prep digest
│   │       └── suggest/route.ts     # Course study guide & revision suggestions
│   ├── admin/
│   │   └── page.tsx                 # Institution admin management desk
│   ├── login/
│   │   └── page.tsx                 # Responsive login & signup portal
│   ├── page.tsx                     # Student study portal & hierarchy navigator
│   ├── layout.tsx                   # App root layout with academic fonts
│   └── globals.css                  # Natural Parchment & Scholarly Ink theme tokens
├── components/
│   ├── Navigation.tsx               # Institution-aware header with BYOK status & role
│   ├── AiSettingsModal.tsx          # Bring-Your-Own-Key modal (Gemini, OpenAI, Anthropic)
│   └── AiSummarizeModal.tsx         # AI exam prep digest & key points drawer
├── server/
│   ├── db/
│   │   └── index.ts                 # DatabaseSync connection, schema migrations, indexes, seed data
│   ├── security/
│   │   ├── encryption.ts            # AES-256-GCM cipher for BYOK keys at rest
│   │   └── auth.ts                  # Scrypt password hashing & JWT signing/verification
│   ├── middleware/
│   │   └── guard.ts                 # Auth extraction, institution isolation & 403 guards
│   ├── services/
│   │   ├── institution.service.ts   # Institutions, branches, and courses data operations
│   │   ├── resource.service.ts      # Resource operations with multi-tenant 403 enforcement
│   │   └── ai.service.ts            # BYOK lifecycle and scoped AI operations
│   └── ai/
│       ├── types.ts                 # AIProvider interface & scoped context types
│       ├── factory.ts               # Provider registry (Gemini, OpenAI, Anthropic)
│       ├── gemini-adapter.ts        # Google Gemini REST API adapter
│       ├── openai-adapter.ts        # OpenAI Chat Completions adapter
│       └── anthropic-adapter.ts     # Anthropic Messages API adapter
└── tests/
    └── app.test.ts                  # Automated security, access control & lifecycle tests
```

---

## 3. Database Schema & API Reference

### Database Schema (`data/app.db`)

All tables are indexed on foreign keys and tenant identifiers for fast queries and integrity:

1. **`institutions`**
   - `id` (TEXT PRIMARY KEY)
   - `name` (TEXT NOT NULL)
   - `code` (TEXT UNIQUE NOT NULL)
   - `created_at` (TEXT)
2. **`branches`**
   - `id` (TEXT PRIMARY KEY)
   - `institution_id` (TEXT NOT NULL REFERENCES `institutions(id)`)
   - `name` (TEXT NOT NULL)
   - `code` (TEXT NOT NULL)
   - `created_at` (TEXT)
3. **`courses`**
   - `id` (TEXT PRIMARY KEY)
   - `institution_id` (TEXT NOT NULL REFERENCES `institutions(id)`)
   - `branch_id` (TEXT NOT NULL REFERENCES `branches(id)`)
   - `name` (TEXT NOT NULL)
   - `code` (TEXT NOT NULL)
   - `description` (TEXT)
   - `created_at` (TEXT)
4. **`users`**
   - `id` (TEXT PRIMARY KEY)
   - `institution_id` (TEXT NOT NULL REFERENCES `institutions(id)`)
   - `branch_id` (TEXT REFERENCES `branches(id)`)
   - `course_id` (TEXT REFERENCES `courses(id)`)
   - `name` (TEXT NOT NULL)
   - `email` (TEXT UNIQUE NOT NULL)
   - `password_hash` (TEXT NOT NULL)
   - `password_salt` (TEXT NOT NULL)
   - `role` (TEXT CHECK (role IN ('student', 'admin')) NOT NULL)
   - `created_at` (TEXT)
5. **`resources`**
   - `id` (TEXT PRIMARY KEY)
   - `institution_id` (TEXT NOT NULL REFERENCES `institutions(id)`)
   - `branch_id` (TEXT NOT NULL REFERENCES `branches(id)`)
   - `course_id` (TEXT NOT NULL REFERENCES `courses(id)`)
   - `title` (TEXT NOT NULL)
   - `type` (TEXT CHECK (type IN ('file', 'link')) NOT NULL)
   - `description` (TEXT)
   - `file_path` (TEXT) - Stored in `public/uploads`, not database blobs
   - `file_name` (TEXT)
   - `file_size` (INTEGER)
   - `mime_type` (TEXT)
   - `url` (TEXT)
   - `uploader_id` (TEXT NOT NULL REFERENCES `users(id)`)
   - `uploader_name` (TEXT NOT NULL)
   - `created_at` (TEXT)
   - `updated_at` (TEXT)
6. **`user_api_keys`**
   - `user_id` (TEXT PRIMARY KEY REFERENCES `users(id)`)
   - `provider` (TEXT NOT NULL) - `gemini` | `openai` | `anthropic`
   - `encrypted_key` (TEXT NOT NULL) - AES-256-GCM cipher
   - `iv` (TEXT NOT NULL)
   - `auth_tag` (TEXT NOT NULL)
   - `key_hint` (TEXT NOT NULL) - e.g. `••••••••1234`
   - `created_at` (TEXT)
   - `updated_at` (TEXT)

---

### Strict Multi-Tenant Isolation & Access Control (HTTP 403)

- **Backend Enforcement**:
  Every database query in `ResourceService` applies `WHERE institution_id = ?`.
  Direct lookup via `getResourceById(id, requestingUserInstitutionId)` verifies tenant ownership. If a student or admin from College A attempts to view, edit, or delete a resource from College B, an `AuthError` (HTTP 403 Forbidden: `Cross-college access forbidden`) is thrown and returned.
- **AI College Boundary**:
  All AI queries (`/api/ai/search`, `/api/ai/summarize`, `/api/ai/suggest`) build context strictly from `ResourceService.getResources(user.institutionId)`. The AI prompt forbids indexing or answering from any materials outside the authenticated user's institution.

---

### API Endpoints Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register student or admin with institution & branch | Public |
| `POST` | `/api/auth/login` | Authenticate with email/password; returns JWT cookie | Public |
| `POST` | `/api/auth/logout` | Clears authentication cookie | Authenticated |
| `GET` | `/api/auth/me` | Returns current user profile and institution context | Authenticated |
| `GET` | `/api/institutions` | List registered academic institutions | Public / Authenticated |
| `GET` | `/api/branches` | List branches for an institution | Public (with query) / Authenticated |
| `POST` | `/api/branches` | Create new branch in admin's institution | Admin Only |
| `GET` | `/api/courses` | List courses filtered by branch | Public (with query) / Authenticated |
| `POST` | `/api/courses` | Create new course in admin's institution | Admin Only |
| `GET` | `/api/resources` | List resources within user's institution | Authenticated |
| `POST` | `/api/resources` | Upload file (multipart/form-data) or add link | Admin Only |
| `GET` | `/api/resources/:id` | Get resource details (enforces 403 across institutions) | Authenticated |
| `GET` | `/api/resources/:id/download` | Authenticated download for valid academic PDFs & verified links | Authenticated |
| `PUT` | `/api/resources/:id` | Update resource title/description/link | Admin Only |
| `DELETE` | `/api/resources/:id` | Delete resource and disk file | Admin Only |
| `GET` | `/api/ai/config` | Get configured BYOK status and masked hint | Authenticated |
| `POST` | `/api/ai/config` | Save and AES-256-GCM encrypt user API key | Authenticated |
| `DELETE` | `/api/ai/config` | Delete user API key | Authenticated |
| `POST` | `/api/ai/search` | Natural language AI search over institution resources | Authenticated (BYOK) |
| `POST` | `/api/ai/summarize` | AI-generated exam prep digest for a resource | Authenticated (BYOK) |
| `POST` | `/api/ai/suggest` | AI-generated course study roadmap | Authenticated (BYOK) |

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js version 22+ (for native `node:sqlite` and built-in Web Crypto APIs).

### Installation & Execution

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   The application uses default values if `.env` is omitted:
   - Port: `8004`
   - Master Encryption Key: AES-256-GCM key derivation
   - Database Path: `data/app.db`

3. **Run Automated Tests**:
   ```bash
   npm test
   ```
   Runs the test suite verifying:
   - AES-256-GCM encryption at rest & tamper detection
   - Password hashing with scrypt and unique salts
   - JWT session issuance & expiration
   - Multi-tenant cross-college isolation (strict 403 checks)
   - AI provider abstraction factory
   - Admin upload, update, and delete resource lifecycle
   - Admin branch and course management
   - Student & Admin registration flows

4. **Start the Application Server on Port 8004**:
   ```bash
   npm run dev
   ```
   Access the web application at:
   **`http://localhost:8004`**

---

## 5. Pre-Configured Demo Accounts

For immediate evaluation, the database initializes with three institutions across Visakhapatnam and 35+ premier colleges across India:

### Andhra University (`inst-au`)
- **Student**: `student@andhrauniversity.edu.in` / `Password@123`
- **Admin**: `admin@andhrauniversity.edu.in` / `Password@123`

### Gayatri Vidya Parishad College of Engineering (`inst-gvpce`)
- **Student**: `student@gvpce.ac.in` / `Password@123`
- **Admin**: `admin@gvpce.ac.in` / `Password@123`

### GITAM Deemed to be University (`inst-gitam`)
- **Student**: `student@gitam.edu` / `Password@123`
- **Admin**: `admin@gitam.edu` / `Password@123`

*(You can also use the one-click demo login buttons on the Sign-In page to immediately test student and admin perspectives across all institutions, or register any college in India on the signup page).*

*(You can also use the one-click demo login buttons on the Sign-In page to immediately test student and admin perspectives across both institutions.)*
