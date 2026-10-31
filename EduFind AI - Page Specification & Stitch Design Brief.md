# EduFind AI — Page Specification & Stitch Design Brief

*Prepared from your Master Blueprint, End Design Specification, and PRD. Paste Section 3 into Stitch first as the global design system prompt, then one page prompt (Section 4) at a time.*

---

## 1. Assumptions and Reconciliations

Your project documents and PRD describe overlapping requirements. These choices unify them into one cohesive application:

| # | Issue | Decision used in this document |
| --- | --- | --- |
| 1 | Two palettes exist (Indigo in blueprint.md, Parchment in the End Design Spec) | **Parchment & Scholarly Ink is the default theme.** Indigo is kept as an optional alternate prototype theme (Section 3.1). |
| 2 | Design spec covers 4 screens (AI discovery); PRD needs a verified library, Exam Mode, contributor, and admin flows | Total is **14 pages**: 4 core AI discovery screens + 10 dedicated institutional library & moderation pages. |
| 3 | Spec says every result is an external link; PRD says content is stored with Verified/Pending/Outdated status | Resources can be **internal (hosted, verified)** or **external (whitelisted: MIT OCW, NPTEL, Stanford SEE, OpenStax)**. The AI only recommends Verified items. |
| 4 | Spec shows exactly 6 AI result cards | Kept for the Discovery Console (`/discover`). Library, Search Results, and Course pages use structured lists. |
| 5 | Spec stores a demo login in localStorage | Visual design is preserved. The production build uses institutional-email auth with roles (`student`, `faculty`, `admin`). |
| 6 | Stats such as "500+ Colleges" and "99.8% reliability" | Treated as **placeholder copy**. |
| 7 | Contrast: the palette's sage primary and muted text are below WCAG AA for small text | Section 3.1 adds **AA-safe overrides** (`#5F6F2E` for small text/buttons) to guarantee WCAG AA compliance. |

---

## 2. Page Inventory (14 Pages)

| # | Page Name | Route | Source | Roles | Primary Purpose | Tap Count |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **Landing Page** | `/` | Existing | Public | Explain value proposition, institutional stats, drive sign-up | 1 tap to `/discover` |
| 2 | **Sign-In / Auth** | `/login` | Existing | Public | Institutional email or Google OAuth with student/faculty tabs | 1 tap |
| 3 | **Student Home** | `/home` | PRD | Student | Continue learning, upcoming exams, quick search | 1 tap |
| 4 | **Discovery Console (AI)** | `/discover` | Existing | All | Free-text, course code or syllabus to 6-card curated resources + coverage report | 1 search + 1 tap |
| 5 | **Search Results** | `/search` | PRD | All | Instant filtered results with typo tolerance | 1 tap |
| 6 | **Library Browse** | `/library` | PRD | All | University > Department > Regulation > Course navigation | 3 taps |
| 7 | **Course Page** | `/courses/:id` | PRD | All | Units, topic checklists, lecture videos & downloadable notes | 2 taps |
| 8 | **Resource Detail / Viewer** | `/resources/:id` | PRD | All | Distraction-free embedded player/PDF reader, verification badge | Direct |
| 9 | **Exam Mode** | `/exam` | PRD | Student | Countdown clock + prioritized crunch revision path | 2 taps |
| 10 | **Academic AI Tutor** | `/chat` | Existing | Signed-in | Multi-turn academic chat grounded in verified syllabi | Instant |
| 11 | **My Library / Profile** | `/me` | PRD | Student | Bookmarks, recently viewed, curriculum progress, offline PDFs | 1 tap |
| 12 | **Contributor Dashboard** | `/contribute` | PRD | Faculty | My uploads tracker (Drafts, Pending, Verified, Needs Revision) | 1 tap |
| 13 | **Upload & Syllabus Tag** | `/contribute/new` | PRD | Faculty | 4-step wizard: File, details, regulation/unit tagging, review | 4 steps |
| 14 | **Admin Review Queue** | `/admin/review` | PRD | Admin | Split-screen queue: document preview, syllabus fit, Approve/Reject | 1 tap decision |

**3-Tap Rule Check:**
- Home → Course Card → Resource: **2 taps**
- Home → Exam Mode → Resource: **2 taps**
- Search → Result: **1 tap** (after typing)
- Library → College → Course → Resource: **3 taps**

---

## 3. Global Design System Specification (Paste into Stitch First)

**Style:** "Earthy Vintage / Natural Parchment & Scholarly Ink". A warm, tactile, distraction-free academic reading room. Serif display typography, aged-paper backgrounds, soft multi-layer shadows, subtle 7px book-corner radius. Mobile-first (design at 390px wide, adapt to 1280px). Line icons only (Lucide style).

### 3.1 Colour Palette

#### Light Theme (Default: "Natural Parchment & Scholarly Ink")
| Token | Hex Code | Use |
| --- | --- | --- |
| `background` | `#E4D7B0` | Base page background (aged natural parchment) |
| `foreground` | `#5C4B3E` | Main typography (deep scholarly ink brown) |
| `card` | `#E7DBBF` | Cards, elevated containers, input wrappers |
| `popover` | `#F3EAD2` | Dropdowns, menus, hover tooltips |
| `primary` | `#8D9D4F` | Brand accent: muted olive / scholarly sage |
| `primary-foreground` | `#FDFBF6` | Text on primary (clean ivory cream) |
| `secondary / muted` | `#DECEA0` | Tag pills, subtle dividers, disabled areas |
| `muted-foreground` | `#85766A` | Captions, metadata, course codes |
| `accent` | `#DBC894` | Interactive hover states, quick filters |
| `destructive` | `#D98B7E` | Dusty terracotta: errors, sign-out, rejected items |
| `destructive-foreground`| `#FAF8F2` | Text on destructive alerts |
| `border` | `#B19681` | Bookbinding paper borders |
| `input` | `#DBC894` | Input field borders |
| `ring` | `#9DB18C` | Focus rings & accessibility outlines |

#### WCAG AA-Safe Contrast Overrides (Mandatory for Text & Buttons)
- **Primary button fill:** `#5F6F2E` with `#FDFBF6` text (5.4:1 contrast ratio).
- **Muted small text:** `#64574C` against `#E4D7B0` (4.9:1 contrast ratio).
- **Destructive button fill:** `#C85A48` with `#FAF8F2` text (5.1:1 contrast ratio).

#### Verification Status Colours
| Status | Background & Text | Badge Visual |
| --- | --- | --- |
| **Verified** | Sage `#3B5219` on `#DDE5C2` | "Verified" with `ShieldCheck` icon |
| **Pending** | Amber `#8A5A00` on `#F3DFA8` | "Pending Review" with `Clock` icon |
| **Outdated** | Terracotta `#9A4A3C` on `#F2CFC7`| "Outdated Curriculum" with `AlertTriangle` icon |

#### Exam Urgency Badges
- **High Relevance:** `bg-red-500/10 text-red-700 border-red-300` (Exam $\le 3$ days or core syllabus anchor).
- **Medium Relevance:** `bg-amber-500/10 text-amber-700 border-amber-300` (Standard revision).
- **Low Relevance:** `bg-emerald-500/10 text-emerald-700 border-emerald-300` (Supplementary reading).

#### Dark Theme ("Dark Study / Night Library")
- `background`: `#1C1A17`
- `foreground`: `#F0E9DB`
- `card`: `#25221E`
- `primary`: `#8A9F7B`
- `border`: `#332F28`
- `muted-foreground`: `#A8A096`

#### Alternate Prototype Theme ("Royal Indigo & Academic Clarity")
- `primary`: `#4D33CC`
- `background`: `#F2EFFB`
- `accent`: `#33B7D9`

---

### 3.2 Typography Hierarchy

| Role | Font Family | Fallback | Sizing & Line Height | Usage |
| --- | --- | --- | --- | --- |
| **Headline / Display** | `Source Serif 4` | `serif` | H1 40/48 (Mobile 30/36), H2 28/34, H3 20/28 | H1 to H4 titles, brand logotype, scholarly quotes |
| **Body / Interface** | `Merriweather` | `serif` | Body 16/26, UI Small 14/20, Caption 13/18 | Paragraphs, descriptions, buttons, search input |
| **Code / Metadata** | `JetBrains Mono` | `monospace` | Mono 12/16 | Course codes (`CS501PC`), URLs, tags, percentages |

---

### 3.3 Materials, Shape, and Physics

- **Paper Texture:** SVG fractal-noise overlay (`feTurbulence`) on `#E4D7B0` background with `multiply` blend, `0.04` opacity.
- **Academic Shadow:** `0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(93,109,61,0.05), 0 12px 24px rgba(0,0,0,0.02)`.
- **Radius:** `0.425rem` (`~7px`) on cards and inputs; full pill on primary buttons and badges.
- **Ink-Bleed Entrance Animation:** `0.8s` ease-out, sliding up 8px while un-blurring into focus.
- **Iconography by Type:** Video = `Play`, Notes = `FileText`, PDF = `File`, Past Paper = `History`, Textbook = `BookOpen`, Course Page = `GraduationCap`.

---

## 4. Page-by-Page Stitch Prompts

### Page 01 — Landing (`/`)
```text
Generate a modern academic landing page for "EduFind AI" using the "Natural Parchment & Scholarly Ink" aesthetic.
- Colors: Background #E4D7B0, Text #5C4B3E, Primary Accent #8D9D4F (Button fill #5F6F2E for AA contrast), Card surface #E7DBBF, Border #B19681.
- Typography: Headline Source Serif 4 bold uppercase; Body Merriweather; Metadata JetBrains Mono.
- Layout:
  1. Sticky top navigation with graduation cap logo, "EDUFIND AI", "Features", "Institutions", "Log in", and a pill button "Get Started".
  2. Hero section with a pill badge "ADVANCED LEARNING ARCHIVE", monumental headline "ACADEMIC DISCOVERY REDEFINED", italic subtitle on syllabus curation, and two CTAs ("Start Discovering" in olive green with plus icon, and "Ask AI Tutor" in outlined paper border).
  3. Four-metric stat bar: 500+ Colleges Linked, 12K+ Resources, 99.8% Link Reliability, 24/7 AI Mentorship.
  4. Three-column bento grid for Verified Uptime, Syllabus Sync, and Elite Repositories (MIT, NPTEL, Stanford).
  5. Minimal scholarly footer with archival copyright.
- Texture: Subtle paper noise overlay, gentle multi-layer shadow, 7px rounded corners.
```

### Page 02 — Sign-In (`/login`)
```text
Generate an authentication page for "EduFind AI" in Natural Parchment (#E4D7B0) and Ink (#5C4B3E).
- Centered parchment card (#E7DBBF) with an embossed book-plate border (#B19681).
- Top back button: "← Return to Library".
- Seal emblem icon at card top, followed by serif title "Scholar Sign-In" and caption "Verify your institutional trajectory to continue".
- Two segmented tabs: "Student" and "Faculty".
- Form fields: Email input and Password input inside warm cream containers (#F3EAD2) with subtle focus ring (#9DB18C). Faculty tab adds "Institutional Secret Key" input.
- Primary CTA: Pill button in sage olive (#5F6F2E) with text "Enter Academic Archive".
- Divider "OR" with an outline button for "Sign in with Google".
- Footer link: "Browse as Guest (Read-Only Archive)".
```

### Page 03 — Student Home (`/home`)
```text
Generate a personalized Student Home Dashboard for EduFind AI.
- Palette: Parchment background (#E4D7B0), Ink text (#5C4B3E), Sage green (#8D9D4F), Warm card surfaces (#E7DBBF).
- Top bar: Institutional emblem, user avatar "Ananya R.", university subtitle "JNTUH — CSE Semester 5".
- Top hero widget: Amber-bordered Exam Countdown Card ("Operating Systems Exam in 3 Days, 14 Hours") with progress ring and button "Launch Exam Mode Revision".
- Search bar: Prominent rounded search input with magnifying glass and filter button.
- "Continue Learning" section: 3 horizontal topic cards with progress bars (e.g. "Virtual Memory & Paging - 70% complete").
- "My Registered Courses" 2-column grid showing course code in monospace (e.g. CS501PC), title, and verified resource count.
- Quick action pills: "AI Syllabus Discovery", "Bookmarks", "Ask AI Tutor".
- Mobile layout: Sticky bottom tab bar with 5 items (Home, Search, Library, Exam, Me) and a floating "Consult Tutor" circular action button.
```

### Page 04 — Discovery Console (`/discover`)
```text
Generate the flagship AI Discovery Console for EduFind AI.
- Colors: Warm parchment #E4D7B0, card background #E7DBBF, sage primary #5F6F2E, ink text #5C4B3E, gold highlight #DBC894.
- Header: Academic title "AI Discovery Console" with subtitle "Synthesizing global academic archives against institutional syllabi".
- Input card: Multi-line query textarea with placeholder "Paste a syllabus, enter a course code (e.g. CS501PC), or type an exam question...". Below it, 3 quick-query pill buttons, and a prominent submit button "Analyze & Discover Resources".
- Analysis bar: 4 small parchment tiles showing Detected Institution, Subject Domain, Academic Level, and Regulation Standard.
- Main results section: Exactly 6 resource cards arranged in a 3x2 grid. One card is designated "Core Curriculum Anchor" with a gold star badge and thicker border. Each card displays: resource type icon (video/PDF), title in Source Serif 4, source institution in monospace, "Verified" badge with shield icon, exam relevance pill (High/Medium), time-to-consume pill (e.g. "45 min"), and action buttons for "View Resource" and "Bookmark".
- Bottom panel: "Curriculum Coverage & Gap Report" with green badges for covered topics, terracotta badges for missing topics, and an action button "Start Recommended Path".
```

### Page 05 — Search Results (`/search`)
```text
Generate an Instant Academic Search Results page for EduFind AI.
- Palette: Parchment background (#E4D7B0), Ink text (#5C4B3E), Olive accent (#5F6F2E), Card containers (#E7DBBF).
- Top sticky bar: Search input with typed query "Operating Systems Scheduling", clear button, and filter toggle button.
- Metadata line: "48 verified resources found in 0.28s • JNTUH R22 Aligned".
- Filter chip row: Horizontal scrollable pills for "All", "Videos", "Notes", "Past Papers", and a "Verified Only" toggle switch.
- Main stream: Vertical stacked list of academic resource cards. Each card has a left-hand type icon, serif title with highlighted matching search terms, institution badge (mono), verification status badge, effort estimate ("30 min"), and action buttons.
- Sidebar (desktop): Refine by Semester (1-8), Regulation (R22, R20), and Examination Year.
```

### Page 06 — Library Browse (`/library`)
```text
Generate a 3-tier Structured Library Browser for EduFind AI adhering to the 3-tap discovery rule.
- Layout: Parchment background (#E4D7B0), deep ink typography (#5C4B3E), aged paper cards (#E7DBBF) with borders (#B19681).
- Header: Breadcrumb trail "Archive > JNTUH > Computer Science > Semester 5".
- Search & Filter bar: Typeahead search to filter departments and courses immediately.
- Grid: 6 course cards. Each card displays:
  - Top header: Monospace course code badge (e.g. "CS501PC") and regulation tag ("R22").
  - Title: Large serif font "Operating Systems".
  - Metadata: "5 Units • 24 Verified Resources • 8 Past Papers".
  - Progress bar: Sage green bar showing "75% Syllabus Mapped".
  - Bottom action: "Open Course Archive →".
```

### Page 07 — Course Page (`/courses/:id`)
```text
Generate a comprehensive Course Syllabus & Resource page for EduFind AI.
- Colors: Parchment background (#E4D7B0), dark ink text (#5C4B3E), olive green accents (#5F6F2E).
- Top header: Monospace badge "CS501PC • R22 REGULATION", giant serif title "Operating Systems", subtitle "JNTU Hyderabad • Department of Computer Science • 5th Semester". Action button "Start Exam Mode Revision" with flame icon.
- Progress card: "Your Syllabus Progress: 62% Mastered" with a clean sage progress bar.
- Tab bar: "Units & Syllabus (5)", "All Resources (28)", "Past Question Papers (6)".
- Accordion section: Unit 1 expanded. Shows topic checklist with checkboxes:
  - [x] Introduction to Kernel Architectures (1 Video, 1 Note)
  - [x] Process Scheduling & PCB (2 Videos, 1 PDF)
  - [ ] Inter-Process Communication (1 Video)
  - Under each topic, show compact resource cards with title, author/faculty name, "Verified" badge, and instant "View" button.
- Sidebar: "Core Recommended Reference Book" card and "Download Full Course Offline Bundle" button.
```

### Page 08 — Resource Viewer (`/resources/:id`)
```text
Generate a distraction-free Academic Resource Viewer page for EduFind AI.
- Visuals: Warm parchment background (#E4D7B0), ink typography (#5C4B3E), paper container (#E7DBBF).
- Top navigation: Back button "← Back to Operating Systems", resource title, and action icons (bookmark star, download icon, share, report).
- Verification Banner: Subtle sage box (#DDE5C2 border #8D9D4F) with checkmark shield: "Verified Academic Resource • Aligned to JNTUH R22 Syllabus by Prof. Rao".
- Main viewport: PDF/Video document container with aged paper border and drop shadow. Shows page 1 of an academic lecture note with title, diagram, and structured formulas.
- Document controls bar: Page counter "Page 1 of 18", Zoom +/- controls, "Download for Offline Study" pill button.
- Bottom section: "Next Topic in this Unit" card with arrow button to continue studying.
```

### Page 09 — Exam Mode (`/exam`)
```text
Generate a high-focus "Exam Mode" revision page for EduFind AI.
- Theme: Parchment background (#E4D7B0) with urgent amber and terracotta accent highlights.
- Top hero: Giant serif countdown clock "3 Days : 14 Hours : 20 Mins" enclosed in a circular sage-to-amber progress ring. Below it: "Operating Systems (CS501PC) Final Exam".
- Study budget selector: Segmented buttons "Revision Budget: 6 Hours | 12 Hours | 24 Hours | 48 Hours".
- Timeline section: A vertical dotted timeline showing "Prioritized Crunch Path (Sorted by Highest Exam Weightage)":
  - Step 1: "Banker's Algorithm & Deadlock Avoidance" (15 min read • High Frequency Question) with a checkbox and "Review Now" button.
  - Step 2: "Page Replacement Algorithms Solved Numericals" (20 min video).
  - Step 3: "Disk Scheduling FCFS/SSTF/SCAN Formula Sheet" (1-page PDF).
- Sticky floating card: "Estimated Score Boost: +25% • 3 topics remaining for tonight".
```

### Page 10 — Academic AI Tutor (`/chat`)
```text
Generate an Academic AI Tutor chat interface for EduFind AI.
- Design: Tactile manuscript reading room aesthetic. Background #E4D7B0, cards #E7DBBF, borders #B19681, text #5C4B3E.
- Header: Academic avatar icon, title "Academic AI Tutor", subtitle "Grounded in Institutional Knowledge Base • JNTUH R22 Aligned", and a "Clear Session" icon.
- Three starter cards at top: "Explain Deep Concepts", "Step-by-Step Numerical Breakdown", "Unit Exam Review".
- Message stream:
  - User message: Right-aligned bubble in sandy parchment (#DECEA0) asking "How does the Banker's Algorithm prevent deadlock?".
  - AI Tutor message: Left-aligned elevated paper container (#E7DBBF) with structured headings, clean numbered mathematical steps for safe state calculation, a formatted code/matrix block, and a footer chip "Verified Citation: Galvin OS Textbook Ch. 8".
- Input bar: Bottom-docked rounded input with placeholder "Ask a syllabus doubt, paste a theorem, or request a summary...", microphone icon, attachment icon, and olive green send button.
```

### Page 11 — My Library (`/me`)
```text
Generate a "My Library & Scholar Toolkit" personal profile page for EduFind AI.
- Style: Natural Parchment (#E4D7B0), dark ink typography (#5C4B3E), cards (#E7DBBF).
- Profile Header: Scholar avatar, name "Ananya Rao", institutional badge "JNTUH — CSE 3rd Year", and a theme toggle button (Sun/Moon).
- Tab Navigation: 4 tabs: "Pinned Bookmarks (14)", "Recently Studied", "Curriculum Progress", "Offline Storage (5 PDFs)".
- Main Content (Pinned Bookmarks view):
  - 3 saved resource cards showing type icon, title, course tag ("CS501PC"), and a private note snippet ("Revise this before Wednesday's mid-term").
- Offline Storage section: Card showing storage used ("18.4 MB of 50 MB offline quota") with a list of downloaded revision PDFs and a green "Ready Offline" badge.
```

### Page 12 — Contributor Dashboard (`/contribute`)
```text
Generate a Faculty Contributor Dashboard for EduFind AI.
- Theme: Archival parchment (#E4D7B0) with scholarly ink brown (#5C4B3E) and olive sage (#5F6F2E).
- Header: "Faculty Contributor Portal" with a large primary button "+ Upload New Resource".
- Top metrics row: 4 cards showing "Drafts (2)", "Pending Review (5)", "Live & Verified (38)", and "Needs Revision (1)".
- Filter bar: Search by title, filter by course dropdown (e.g. "CS501PC Operating Systems"), and filter by status tabs.
- Data table: Clean manuscript table listing uploads:
  - Row 1: "Unit 3 Memory Management Hand-Written Notes", CS501PC, PDF, Status: Sage "Live & Verified", Action: View stats.
  - Row 2: "Process Synchronization Solved Past Papers", CS501PC, PDF, Status: Amber "Pending Review", Action: Edit.
  - Row 3: "Thread Scheduling Video Lecture", CS501PC, Video, Status: Terracotta "Changes Requested", Action: "View Reviewer Note".
```

### Page 13 — Upload & Syllabus Tag (`/contribute/new`)
```text
Generate a 4-step Resource Upload & Syllabus Tagging wizard for EduFind AI.
- Colors: Parchment #E4D7B0, card containers #E7DBBF, borders #B19681, primary button #5F6F2E.
- Stepper: Horizontal line connecting 4 step circles: "1. File Upload" (Completed ✓), "2. Details" (Completed ✓), "3. Syllabus Tagging" (Active), "4. Submit".
- Step 3 Form Content:
  - Dropdown: "Target Institution" (e.g. JNTU Hyderabad).
  - Segmented selector: "Syllabus Regulation" (R22, R20, CBCS).
  - Dropdown: "Course" (CS501PC Operating Systems).
  - Radio pills: "Unit Alignment" (Unit 1, Unit 2, Unit 3, Unit 4, Unit 5).
  - Multi-select topic tagger with clickable suggestion chips ("#PageReplacement", "#DemandPaging", "#Thrashing").
  - Radio pills: "Estimated Exam Relevance" (High, Medium, Low).
- Action buttons: Ghost "← Back to Details" and Primary pill "Proceed to Final Review →".
```

### Page 14 — Admin Review Queue (`/admin/review`)
```text
Generate an Admin Moderation & Review Queue page for EduFind AI.
- Theme: Clean academic manuscript (#E4D7B0) with dark ink (#5C4B3E) and clear decision controls.
- Top bar: "Institutional Moderation Desk", subtitle "JNTUH Faculty Review Panel", and a badge "12 Pending Reviews".
- Split layout:
  - Left column (35%): List of pending submission cards. Active item highlighted with a sage border (#8D9D4F). Shows title "Unit 3 Virtual Memory Cheatsheet", author "Dr. A. Rao", course "CS501PC", and time "Submitted 2h ago".
  - Right column (65%): Review Workbench:
    - Top header: Submission title, course code, and regulation badge ("R22").
    - Preview box: Live document iframe preview showing page 1 of the uploaded PDF.
    - Automated audit strip: Green badge "Link Health: 200 OK" and "Curriculum Fit: 96%".
    - Decision bar: Three prominent buttons:
      1. Sage green pill button "✓ Approve & Publish as Verified"
      2. Amber outline button "Request Changes"
      3. Terracotta button "✗ Reject"
    - Comment box: "Feedback to contributor (mandatory if rejecting)..."
```

---

## 5. Stitch Workflow Playbook

1. **Global Prompt First:** Create a project in Stitch and paste Section 3 as the project design brief.
2. **Recommended Page Order:** Generate Page 04 (Discovery), Page 07 (Course), Page 09 (Exam), and Page 05 (Search) first to anchor the core student experience, then Pages 01, 02, 03, 08, 10, 11, and finally administrative workflows (12, 13, 14).
3. **Mobile-First Layout:** Ask Stitch for the mobile view (`390px`) first, then adapt to desktop (`1280px`).
4. **Contrast Adherence:** Ensure Stitch applies the `#5F6F2E` AA contrast override for buttons and `#64574C` for small captions.
