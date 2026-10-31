# EduFind AI – Master Project Blueprint

*Single source of truth built from your Blueprint, End Design Specification and PRD. Covers deliverables 1–7: brief, architecture, stack, wireframes, API, roadmap and scaffold plan.*

## 1. Vision and Scope

**EduFind AI** is a mobile-first academic platform that gives university students fast access to *verified* study material. It combines two layers:

| Layer | What it does | Source |
| --- | --- | --- |
| **Structured Library** | University > Department > Course > Unit/Topic > Resource, with verification status, search, Exam Mode, student tools | PRD |
| **AI Discovery Layer** | Parses free text, course codes or a pasted syllabus, curates and ranks resources, reports coverage gaps, answers questions as a tutor | Blueprint + Design Spec |

**Guiding rule:** the AI never invents resources. It only selects from the verified knowledge base and whitelisted domains. Every student reaches any resource in **3 taps or fewer**.

## 2. Assumptions and Reconciliations

| # | Assumption | Why |
| --- | --- | --- |
| A1 | One codebase serves students, faculty and admins (role-based UI) | PRD roles |
| A2 | Launch with one pilot university and 3–5 departments, designed multi-tenant from day one | Keeps MVP small |
| A3 | Resources are either **internal** (uploaded, hosted) or **external** (link to a whitelisted source such as MIT OCW, NPTEL, Stanford SEE, OpenStax) | Design Spec uses external links; PRD needs uploads |
| A4 | External resources also carry a verification status and verifier | Consistency |
| A5 | The 6-card AI result grid stays; library lists are paginated | Design Spec |
| A6 | Parchment theme is default; Indigo theme is optional | See Page Spec doc |
| A7 | Institutional email domains are allow-listed per university; Google sign-in is accepted only for allow-listed domains; guests may browse Verified content but cannot save progress | PRD + Design Spec |
| A8 | Demo credentials and localStorage sessions in the prototype are **replaced** by real auth | Security |
| A9 | Marketing stats (500+ colleges, 99.8% reliability) are placeholders | Honesty |
| A10 | "Faculty" can contribute; students cannot upload in MVP | PRD roles |

## 3. Product Brief

### 3.1 Personas

| Persona | Goal | Pain today | Key needs |
| --- | --- | --- | --- |
| **Ananya, 2nd-year UG** | Find the right videos and notes per unit | Scattered links, unsure what is reliable | Course browsing, verified badge, progress tracking |
| **Rahul, exam crammer** | Revise in 2 days | Too much material, no priority | Exam Mode, short items, countdown |
| **Dr. Rao, faculty contributor** | Share vetted material with students | No clear place or review loop | Upload, tag, status, feedback |
| **Meera, admin / reviewer** | Keep quality high | Unreviewed, outdated content | Review queue, bulk approve, audit trail |
| **Kiran, low-bandwidth student** | Study on a weak mobile connection | Heavy pages and video | Lazy loading, adaptive video, offline PDFs |

### 3.2 Key User Journeys

| Journey | Steps | Taps |
| --- | --- | --- |
| Find a resource | Home > Course card > Resource | 2 |
| Search | Type query > result | 1 (+typing) |
| Exam prep | Home > Exam Mode (course and date pre-filled) > first item | 2 |
| AI discovery | Discover > paste syllabus > Submit > anchor resource | 3 |
| Contribute | Contribute > Upload > tag > submit | 3 steps, then review |
| Review | Admin queue > item > Approve / Reject with feedback | 2 |
| Offline use | Resource > Download > later My Library > Offline | 1 + 2 |

### 3.3 Success Metrics

| Metric | Definition | MVP target |
| --- | --- | --- |
| Time-to-find-resource | Median seconds from app open to resource view | under 20 s |
| Taps-to-resource | Median taps | 3 or fewer for 95% of sessions |
| % verified content | Verified resources / all published | at least 90% (visible content 100%) |
| Weekly active students (WAU) | Distinct students per week | 40% of enrolled in pilot |
| Search latency | p95 server response | under 1 s |
| Exam Mode adoption | Students who open Exam Mode within 14 days of an exam | 30% |
| Review turnaround | Median submit-to-decision time | under 48 h |
| Link health | Active external links that resolve | at least 98% |

## 4. Features (MVP) and Mapping

| # | PRD feature | Where it lives | Notes |
| --- | --- | --- | --- |
| 1 | Structured library | `/library`, `/courses/:id` | Resource types: Video, Notes, Revision PDF, Past Paper |
| 2 | Verified content | Status on every resource | Pending / Verified / Outdated; verifier name; last-updated date; default filter = Verified |
| 3 | Instant search and filters | `/search`, search bar | Course, topic, type, semester, exam date; typo tolerance; under 1 s |
| 4 | Exam Mode | `/exam` | Course + date > prioritized path + countdown |
| 5 | Contributor workflow | `/contribute`, `/admin/review` | Upload, tag, submit, approve or reject with feedback |
| 6 | Student tools | `/me` | Bookmarks, recently viewed, topic progress, offline PDFs |
| 7 | Auth | `/login` | Student, faculty, admin via institutional email |
| 8 | AI Discovery (Blueprint) | `/discover` | Query parsing, curation, syllabus mode, coverage report |
| 9 | AI Tutor (Design Spec) | `/chat` | Multi-turn, 10-message window |

## 5. Information Architecture

**Hierarchy:** University > Department > Course > Unit > Topic > Resource.

**Sitemap (14 pages):** `/` Landing, `/login`, `/home`, `/discover`, `/search`, `/library`, `/courses/:id`, `/resources/:id`, `/exam`, `/chat`, `/me`, `/contribute`, `/contribute/new`, `/admin/review`.

**Navigation:** mobile bottom tabs (Home, Search, Library, Exam, Me) plus floating Tutor button; desktop top bar. Contributor and Admin links appear by role.

## 6. Data Model

### 6.1 Entities

| Entity | Key fields |
| --- | --- |
| **University** | id, name, slug, email\_domains\[\], country, tier (Tier 1 Global / Tier 1 National / Regional) |
| **Department** | id, university\_id, name |
| **Course** | id, department\_id, code (e.g. `CS229`), title, semester, level (UG 1-2, UG 3-4, PG), syllabus\_text |
| **Unit** | id, course\_id, order, title |
| **Topic** | id, unit\_id, order, title, keywords\[\] |
| **Resource** | id, topic\_id (nullable) , course\_id, type (video, notes, revision\_pdf, past\_paper, textbook, course\_page, study\_guide), title, description, source\_kind (internal / external), url or file\_key, source\_domain, duration\_min, file\_size, exam\_year, language, exam\_relevance (high / medium / low), status, verified\_by, verified\_at, updated\_at, version, uploaded\_by |
| **User** | id, email, name, role (student / faculty / admin), university\_id, department\_id, created\_at |
| **Review** | id, resource\_id, reviewer\_id, decision (approved / rejected / changes\_requested), feedback, created\_at |
| **Bookmark** | user\_id, resource\_id, created\_at |
| **ViewHistory** | user\_id, resource\_id, viewed\_at |
| **TopicProgress** | user\_id, topic\_id, state (not\_started / in\_progress / done), updated\_at |
| **Exam** | id, user\_id, course\_id, exam\_date |
| **DomainWhitelist** | id, domain, trust\_tier, added\_by |
| **AuditLog** | id, actor\_id, action, entity, entity\_id, created\_at |
| **QueryLog** | id, user\_id (nullable), raw\_query, mode (general / exam / syllabus), detected\_json, latency\_ms |

### 6.2 Relationships

- University 1–N Department 1–N Course 1–N Unit 1–N Topic 1–N Resource.
- Resource N–1 User (uploader); Resource 1–N Review.
- User N–N Resource through Bookmark and ViewHistory.
- User N–N Topic through TopicProgress.
- User 1–N Exam; Exam N–1 Course.

### 6.3 Resource Status Workflow

**Draft** > (submit) > **Pending** > (approve) > **Verified** | (reject or request changes) > back to **Draft** with feedback. A Verified resource becomes **Outdated** when an admin flags it, when a newer version is approved, or when its external link fails 3 health checks. Only **Verified** resources appear by default. Resources change state only through the review API, and every change is written to AuditLog.

## 7. AI Layer

### 7.1 Flows

| Flow | Trigger | Output |
| --- | --- | --- |
| `academicResourceDiscoveryFlow` | Default query | Parsed query + top 6 resources + coverage report |
| `examSpecificResourcePrioritizationFlow` | Exam intent | Same, ranked by short effort and high exam relevance |
| `syllabusBasedStudyPlanningFlow` | Long text or syllabus | Unit map: topics, unit sync score, anchor resource, references, plus 6-card summary |
| `academicChatFlow` | `/chat` | Tutor answer using the last 10 messages |

### 7.2 Router Logic (from the spec, with fixes)

| Rule | Spec | Recommended refinement |
| --- | --- | --- |
| Syllabus | length > 300 or contains "unit", "module", "syllabus" | Keep, but require at least two unit/module markers, or length > 300 |
| Exam | contains "exam", "tomorrow", "days", "tonight" | Match "exam" or a date phrase (regex such as `in \d+ days`); the bare word "days" gives false hits |
| Default | everything else | Keep |
| Priority | not stated | Syllabus first, then Exam, then Default; if both apply, run syllabus mode with exam ordering |

### 7.3 Query Parsing Output

`institution`, `course_code`, `domain`, `academic_level`, `curriculum_standard`, `exam_proximity_days`, `topics[]`, `mode`. Unknown values return "Global Search" or "General" instead of guesses.

### 7.4 Curation and Ranking

1. **Retrieve** candidates from the verified knowledge base (search index) using parsed course, topics and level.
2. **Filter** to Verified status and whitelisted domains; drop dead links.
3. **Score** = 0.45 curriculum match + 0.25 exam relevance + 0.15 source trust tier + 0.10 freshness + 0.05 effort fit (effort weight rises to 0.25 in exam mode).
4. **Select exactly 6**, balanced across types; mark one **Anchor** (highest score).
5. **Safety notice:** confidence 70–89% shows "Manual verification advised"; below 70% is not shown.
6. **Coverage report:** topics covered, gaps (parsed topics with no resource), weak-coverage warning when 2 or more gaps, and a Recommended Start (the anchor).

### 7.5 Guardrails

- Retrieval-grounded: every URL in an answer must exist in the database. Anything else is dropped before display.
- Tutor answers cite verified resources as source chips; precision over verbosity, analogies, step-by-step logic, LaTeX-style notation.
- No guesses on unknown institutions; no personal data in prompts; 10-message rolling window; rate limits per user.

## 8. Search

| Requirement | Design |
| --- | --- |
| Under 1 s | Dedicated search engine with an index synced from the database on every status change |
| Typo tolerance | Engine-level fuzzy matching (1–2 typos) plus synonyms (e.g. DBMS = Database Management Systems) |
| Filters | Facets: course, topic, type, semester, exam year/date, status (default Verified) |
| Ranking | Text relevance, then verified recency, then user's enrolled courses boosted |
| Resilience | CDN-cached popular queries; fallback to database `ILIKE` search if the index is down |

## 9. Exam Mode Algorithm

Inputs: course, exam date. Compute `days_left`.

| Window | Path composition | Item rule |
| --- | --- | --- |
| 14+ days | Key videos > summary notes > revision PDFs > past papers, spread across days | All high and medium relevance |
| 3–13 days | Weak topics first (from TopicProgress), then summary notes, past papers | Skip low relevance |
| 0–2 days (crunch) | Last-minute PDFs and past papers, one short video per unit | High relevance only, ordered by shortest time |

The plan is split into daily blocks of the student's available minutes (default 120). Output: countdown, ordered list, total minutes, and completion tracking.

## 10. Roles and Permissions

| Capability | Guest | Student | Faculty | Admin |
| --- | --- | --- | --- | --- |
| Browse Verified content | Yes | Yes | Yes | Yes |
| AI Discovery | Yes (rate-limited) | Yes | Yes | Yes |
| AI Tutor | No | Yes | Yes | Yes |
| Bookmarks, progress, offline | No | Yes | Yes | Yes |
| View Pending / Outdated | No | No | Own only | All |
| Upload and submit | No | No | Yes | Yes |
| Approve / reject | No | No | No | Yes |
| Manage users, whitelist, taxonomy | No | No | No | Yes |

## 11. Recommended Tech Stack

| Layer | Choice | Justification |
| --- | --- | --- |
| Frontend | **Next.js (App Router) + TypeScript** | Matches the existing prototype (`src/app/actions`); SSR for fast first paint |
| UI | **Tailwind CSS + shadcn/ui + Lucide** | Token-based theming for Parchment / Dark / Indigo; accessible primitives |
| Auth | **Firebase Auth** (email link / password, Google) with custom claims for role and allowed domain | Already used in the prototype; faster than building auth |
| Database | **PostgreSQL** (Neon or Supabase) + **Prisma** | Strongly relational hierarchy and review workflow |
| Search | **Meilisearch** (or Typesense) | Typo tolerance and sub-100 ms queries; simple to run |
| File storage | **Cloud object storage** with signed URLs + CDN | Cheap, scalable, supports range requests |
| Malware scan | **ClamAV** worker triggered on upload | Required by PRD; file stays quarantined until clean |
| Video | HLS adaptive streaming via a managed video service; external videos are embedded | Low-bandwidth handling |
| AI | **Genkit flows + Gemini** (server-side only) | Prototype flow names already match Genkit |
| Offline | **Service worker + Cache Storage** (PDFs only) | PRD scope |
| Queue / cache | Redis (rate limits, cached queries) and a job queue for scans, link checks, indexing | Exam-week spikes |
| Hosting | Serverless (Vercel or Cloud Run) with autoscaling, CDN in front | Traffic spikes |
| Observability | Sentry, uptime checks, structured logs | Reliability |
| Testing | Vitest, Playwright, axe-core | WCAG AA gate |

## 12. API Endpoint List

All routes are prefixed `/api/v1`. Auth = bearer session token; role in claims.

### Auth and Users

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/session` | Public | Exchange Firebase token for session, validate email domain |
| POST | `/auth/logout` | Any | End session |
| GET | `/me` | Any | Profile and role |
| PATCH | `/me` | Any | Update profile, theme |
| GET | `/admin/users` | Admin | List users |
| PATCH | `/admin/users/:id/role` | Admin | Change role |

### Library

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/universities` | List |
| GET | `/universities/:id/departments` | Departments |
| GET | `/departments/:id/courses` | Courses |
| GET | `/courses/:id` | Course with units and topics |
| GET | `/courses/:id/resources?type=&status=verified` | Resources in a course |
| GET | `/topics/:id/resources` | Resources in a topic |
| GET | `/resources/:id` | Detail with verification info |

### Search and Discovery

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/search?q=&course=&topic=&type=&semester=&exam=` | Instant search |
| GET | `/search/suggest?q=` | Typo-tolerant autocomplete |
| POST | `/discover` | AI discovery (router picks flow) |
| POST | `/chat` | Tutor (last 10 messages) |

### Exam Mode

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/exams` | Save course and date |
| GET | `/exams` | My exams |
| GET | `/exams/:id/plan` | Prioritized path and countdown |
| DELETE | `/exams/:id` | Remove |

### Student Tools

| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST / DELETE | `/bookmarks`, `/bookmarks/:resourceId` | Bookmarks |
| GET | `/history` | Recently viewed |
| POST | `/history` | Log a view |
| GET / PUT | `/progress`, `/progress/:topicId` | Topic progress |
| GET | `/resources/:id/download` | Signed URL for PDF (offline) |

### Contributor and Review

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/uploads/sign` | Faculty | Get signed upload URL (type and size validated) |
| POST | `/resources` | Faculty | Create draft |
| PATCH | `/resources/:id` | Faculty (owner) | Edit tags and details |
| POST | `/resources/:id/submit` | Faculty | Submit for review |
| GET | `/contribute/resources` | Faculty | My uploads and statuses |
| GET | `/admin/review-queue` | Admin | Pending list |
| POST | `/admin/resources/:id/approve` | Admin | Verify |
| POST | `/admin/resources/:id/reject` | Admin | Reject with feedback |
| POST | `/admin/resources/:id/outdate` | Admin | Mark outdated |
| GET / POST | `/admin/whitelist` | Admin | Manage domains |

### System

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Uptime |
| POST | `/internal/reindex` | Rebuild search |
| POST | `/internal/linkcheck` | Scheduled link health |

## 13. Wireframe Summary (6 required screens)

Full prompts for all 14 pages are in the *Page Specification & Stitch Design Brief*. Core layouts:

| Screen | Structure (top to bottom) |
| --- | --- |
| **Home** | Greeting, search bar, exam countdown card, continue-learning cards, my courses grid, recently viewed, tab bar |
| **Course page** | Header (code, title, verified %), progress bar, tabs (Units / All / Past Papers), unit accordion with topic checkboxes and resource chips |
| **Exam Mode** | Course and date picker, countdown ring, phased timeline (videos, notes, PDFs, papers), today's plan card |
| **Search results** | Sticky search with count and time, filter chips, verified-only toggle, result cards, pagination |
| **Contributor dashboard** | Status summary cards, upload button, table of uploads with status badges and feedback links |
| **Admin review queue** | Queue list on left, preview and metadata on right, Approve / Request changes / Reject bar, feedback textbox, bulk approve |

## 14. Non-Functional Requirements

| Area | Requirement | Approach |
| --- | --- | --- |
| Responsive and accessible | Mobile-first, WCAG AA | AA-safe colour overrides, 44 px tap targets, keyboard navigation, alt text, axe-core in CI |
| Low bandwidth | Fast on weak networks | Lazy loading, HLS adaptive video, compressed PDFs, image `srcset`, skeletons |
| Traffic spikes | Exam weeks | Autoscaling, CDN, cached search, rate limits, load tests before each exam season |
| Upload security | Validate type and size, malware scan | Allow-list (PDF, MP4, DOCX), size caps, magic-byte check, quarantine until ClamAV passes, private bucket with signed URLs |
| Privacy | Data compliance | Collect minimum data, consent for analytics, delete-my-data endpoint, region-appropriate data storage, no student data sent to AI beyond the query |
| Reliability | High uptime | Health checks, backups, graceful fallbacks |

## 15. Phased Roadmap

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| **MVP (weeks 1–10)** | Auth with roles, library browsing, search, upload > review > verify, Exam Mode, bookmarks / history / progress, PDF offline, AI Discovery (general, exam, syllabus), Tutor, 14 screens | One pilot university live; 90% verified; p95 search under 1 s |
| **v2** | Student suggestions and upvotes, multi-university onboarding, notifications (exam reminders, review results), analytics dashboards, personalised study plans, video offline | 3+ universities; WAU target met |
| **v3** | Native apps, faculty analytics, peer groups and Q&A, LMS integrations, multilingual UI, institution-managed content licenses | Sustained growth; revenue or funding model |

### Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Not enough verified content at launch | Empty library | Seed from open sources (OCW, NPTEL, OpenStax); faculty onboarding drive; show "coming soon" |
| Review bottleneck | Slow publishing | Reviewer pool per department, bulk approve, SLA alert at 48 h |
| AI hallucinated or wrong resources | Loss of trust | Retrieval-only recommendations, URL validation, confidence thresholds |
| External links break | Dead ends | Daily link checks, auto-flag Outdated, replacement suggestions |
| Exam-week traffic spike | Downtime | Autoscaling, CDN, caching, pre-season load test |
| Malicious uploads | Security breach | Allow-list, scan, quarantine, private storage |
| Copyright of uploaded material | Legal risk | Contributor declaration, takedown flow, prefer open licenses |
| Low faculty adoption | No supply | Simple upload (3 steps), recognition on profiles, dept champions |
| Accessibility failures from the warm palette | Excludes users | AA overrides, automated contrast tests |
| Scope creep from AI features | Delay | Ship library first, AI behind feature flags |

## 16. Code Scaffold Plan (MVP)

**Build order:** 1) Auth, 2) Library browsing, 3) Search, 4) Upload > review > verify. AI Discovery and Exam Mode follow.

```
edufind/
  prisma/schema.prisma          # entities in Section 6
  src/
    app/
      (public)/page.tsx, login/page.tsx
      (app)/home, library, courses/[id], resources/[id], search, exam, chat, me, discover
      (contribute)/contribute, contribute/new
      (admin)/admin/review
      api/v1/...                 # route handlers from Section 12
      actions/discovery.ts       # router -> flows
    components/                  # ResourceCard, VerificationStrip, FilterChips, SearchBar, ...
    ai/flows/                    # discovery, exam, syllabus, chat
    lib/                         # auth, db, search, storage, scan, rbac
    styles/tokens.css            # Parchment / Dark / Indigo variables
  workers/                       # scan, reindex, linkcheck
  tests/                         # unit, e2e, a11y
```

**Per-step definition of done**

- **Auth:** institutional domain check, role claims, route guards, no demo credentials.
- **Library:** pages for university to resource, Verified-only default, server-rendered.
- **Search:** index sync on status change, typo tolerance, filters, p95 under 1 s.
- **Upload and verify:** signed upload, type and size validation, scan, tags, submit, queue, approve / reject with feedback, audit log.

## 17. Open Items for You

1. Confirm the pilot university and its email domain(s).
2. Confirm Postgres plus Firebase Auth (versus a fully Firebase stack).
3. Confirm whether students may suggest resources in MVP (currently deferred to v2).

*Next step available: generate the working code scaffold (Section 16) starting with auth and library browsing.*
