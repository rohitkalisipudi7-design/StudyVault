# Master Replicable Prompt Blueprint: EduFind AI / StudyBridge (Multi-Tenant Institutional Edition)

> **Purpose:** This document is an end-to-end master prompt template. You can copy and paste the Master Prompt section directly into any frontier AI coding assistant (Antigravity, Cursor, Claude, ChatGPT, etc.) to build, clone, or extend this application from scratch.  

---

```markdown
=== BEGIN MASTER PROMPT ===

# Role & Context
You are a Staff Full-Stack AI Engineer and Lead UI/UX Architect. Your goal is to build from scratch a high-precision, production-grade, multi-tenant academic resource discovery platform called "EduFind AI" (Backend code name: "StudyBridge AI").

# Core Problem & Philosophy
University students waste 30-60 minutes per study session searching for notes, past papers, syllabus mappings, and YouTube lectures scattered across WhatsApp groups, Telegram channels, Google Drives, and bloated search engine results. Furthermore, generic results often miss specific university syllabus regulations (e.g., R22, R20, CBCS).

EduFind AI solves this with five non-negotiable principles:
1. **Regulation-First Single-Page Organization:** Students input their specific Syllabus Regulation + Subject, and an AI Agent compiles YouTube videos, reference PDFs, and notes organized cleanly by unit onto a single, unified webpage.
2. **Multi-Tenant Institutional Subdomains:** Institutions can create dedicated subdomains (`[institution].edufind.ai`) and upload proprietary course materials that blend seamlessly with global open-access repositories.
3. **Dual Role-Based Access (Student vs. Admin):** Strictly separated authentication and workflows for Students (consumption, discovery, doubt resolution) and Institutional Admins (subdomain management, regulation mapping, resource uploads).
4. **Zero-Tolerance Anti-404 Integrity:** Every link must be an authentic, stable academic repository URL (YouTube Data API v3 verified links, MIT OCW, NPTEL, OpenStax, or institution-hosted cloud storage). No placeholder URLs (`example.com`).
5. **Scholarly Tactile Aesthetics:** A signature "Natural Parchment & Scholarly Ink" aesthetic designed for distraction-free, long-form academic focus.

---

# Tech Stack Architecture

### Frontend & AI Orchestration:
- **Framework:** Next.js 15 with App Router (Turbopack, TypeScript, React 19) + `middleware.ts` for wildcard subdomain routing (`*.edufind.ai`)
- **Styling:** Tailwind CSS + ShadCN UI + Custom CSS Variables
- **Icons:** `lucide-react`
- **GenAI Layer:** Google Genkit (`genkit` + `@genkit-ai/google-genai`) powered by `gemini-2.5-flash`
- **External APIs:** YouTube Data API v3 (for verified video lecture retrieval & embedding)
- **Auth & Storage:** Firebase Authentication (Dual Role: `student` | `admin`) + Firebase Storage / AWS S3 for institutional PDF/note uploads
- **State/Notifications:** React Hook Form, Zod validation, ShadCN Toaster

### Backend Engine (FastAPI RAG Service - Optional Hybrid Service):
- **Framework:** FastAPI (Python 3.10+) with async endpoints under `/api/v1`
- **Vector DB:** ChromaDB partitioned by `tenant_subdomain` and `regulation_code` for hybrid dense retrieval
- **Relational DB:** PostgreSQL or SQLite via SQLAlchemy async (storing Tenants, Regulations, Admin Uploads, and Users)

---

# Visual Design Tokens ("Natural Parchment & Scholarly Ink")

Configure `tailwind.config.ts` and `src/app/globals.css` with these exact tokens:

### Light Theme (Default):
- Background: `#e4d7b0` (Warm natural aged parchment)
- Foreground / Text: `#5c4b3e` (Deep scholarly ink brown)
- Card Surface: `#e7dbbf`
- Card Foreground: `#5c4b3e`
- Popover Surface: `#f3ead2`
- Primary Brand Accent: `#8d9d4f` (Muted olive / scholarly sage green)
- Primary Foreground: `#fdfbf6` (Ivory cream)
- Secondary Surface: `#decea0` (Sandy parchment)
- Muted Captions: `#85766a`
- Accent Highlight: `#dbc894`
- Destructive: `#d98b7e` (Dusty terracotta)
- Border Lines: `#b19681` (Aged bookbinding tan)
- Focus Ring: `#9db18c` (Herbal sage)
- Radius: `0.425rem`

### Dark Theme ("Dark Study / Night Library"):
- Background: `#1c1a17` (Deep mahogany obsidian)
- Foreground: `#f0e9db` (Cream parchment text)
- Card: `#25221e`
- Primary: `#8a9f7b`
- Border: `#332f28`

### Typography & Textures:
- Display/Headings: `"Source Serif 4", Georgia, serif`
- Body & Labels: `"Merriweather", serif`
- Code / Metadata: `"JetBrains Mono", monospace`
- Materiality: Add an SVG fractal noise filter overlay (`.bg-paper`) with `feTurbulence` and mix-blend mode `multiply`.

---

# Data Schemas & Contracts (Zod / JSON Schema)

```typescript
// User Role & Auth Schema
export const UserRoleEnum = z.enum(['student', 'admin']);

export const UserSessionSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: UserRoleEnum,
  institutionSubdomain: z.string().nullable(), // e.g., "jntuh", "vit", "mit"
  regulationCode: z.string().optional() // e.g., "R22", "R20"
});

// Institutional Tenant & Subdomain Schema
export const InstitutionTenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // e.g., "JNTU Hyderabad"
  subdomain: z.string().regex(/^[a-z0-9-]+$/), // e.g., "jntuh" -> jntuh.edufind.ai
  logoUrl: z.string().url().optional(),
  supportedRegulations: z.array(z.string()), // e.g., ["R18", "R22", "R24"]
  adminEmails: z.array(z.string().email()),
  createdAt: z.string().datetime()
});

// Resource Type Enum
export const ResourceTypeEnum = z.enum([
  'youtube_video', 'institutional_pdf', 'reference_notes', 'past_paper', 'textbook', 'course_page'
]);

// Core Resource Model
export const ResourceSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  type: ResourceTypeEnum,
  source: z.string(), // e.g., "YouTube (Gate Smashers)", "NPTEL", "Institution Admin Upload"
  url: z.string().url(),
  youtubeVideoId: z.string().optional(), // For inline video player embedding on the single webpage
  isInstitutionalUpload: z.boolean().default(false), // True if uploaded by college admin
  regulationTag: z.string(), // e.g., "R22"
  subjectCode: z.string().optional(),
  description: z.string().describe("2-3 sentences: what it covers and how it aligns with the regulation"),
  curriculumMatch: z.number().int().min(0).max(100),
  downloadable: z.boolean(),
  topics: z.array(z.string()),
  unit_number: z.number().int().min(1).max(10),
  anchor_resource: z.boolean().describe("True if this is the single best resource for the unit"),
  exam_relevance: z.enum(['high', 'medium', 'low']).optional(),
  time_to_consume: z.enum(['15 min', '1 hr', '3 hr', '6 hr+']).optional()
});

// Telemetry & Query Analysis
export const QueryAnalysisSchema = z.object({
  detected_institution: z.string().nullable(),
  detected_subdomain: z.string().nullable(),
  syllabus_regulation: z.string(), // e.g., "JNTUH R22", "Anna Univ R2021"
  subject_name: z.string(),
  detected_course_code: z.string().nullable(),
  academic_level: z.enum(['ug_1_2', 'ug_3_4', 'pg', 'unknown']),
  total_resources: z.number().default(6)
});

// Single-Webpage Unit Organizer Schema
export const SyllabusUnitOrganizerSchema = z.object({
  unit_number: z.number().int(),
  unit_title: z.string(),
  topics: z.array(z.string()),
  youtube_videos: z.array(ResourceSchema),
  reference_materials: z.array(ResourceSchema), // PDFs, notes, institutional uploads
  coverage_score: z.number().int().min(0).max(100)
});

// Full Discovery Payload
export const AcademicDiscoveryResponseSchema = z.object({
  query_analysis: QueryAnalysisSchema,
  units: z.array(SyllabusUnitOrganizerSchema),
  resources: z.array(ResourceSchema),
  coverage_report: z.object({
    topics_covered: z.array(z.string()),
    topics_missing: z.array(z.string()),
    weak_coverage_warning: z.string().nullable(),
    recommended_start: z.number().int()
  })
});