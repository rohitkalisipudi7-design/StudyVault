# EduFind AI — Master UI Page Specification & Stitch Design Brief

> **Platform:** EduFind AI (Academic Resource Discovery & Verified Institutional Archive)  
> **Backend Architecture:** StudyBridge AI (Multi-Tenant Institutional RAG & Genkit Flows)  
> **Target Audience:** Undergraduate/Postgraduate University Students, Exam Crunch Learners, Faculty Contributors, Academic Reviewers  
> **Design Philosophy:** "Earthy Vintage / Natural Parchment & Scholarly Ink" — Tactile, distraction-free, academic reading room aesthetic  
> **Guiding Principle:** **The 3-Tap Rule** — Every student reaches any verified resource in 3 taps or fewer  

---

## 1. Visual Identity & Design System Specification

Before generating any individual page in Stitch, apply this foundational design system. It establishes the color tokens, typography scales, paper materiality, and shared components across all 14 screens.

### 1.1 Color Palette & Theme Tokens

#### Theme A: "Natural Parchment & Scholarly Ink" (Light Mode — Default)
A tactile academic environment reminiscent of archival manuscripts, university libraries, and letterpress ink.

| Design Token | Hex Code | Tailwind / CSS Variable | Purpose & Exact Application |
|---|---|---|---|
| `--background` | `#E4D7B0` | `bg-background` | Base page canvas (warm natural aged parchment) |
| `--foreground` | `#5C4B3E` | `text-foreground` / `text-ink` | Primary typography (deep scholarly ink brown) |
| `--card` | `#E7DBBF` | `bg-card` | Container surface, elevated panels, card containers |
| `--card-foreground` | `#5C4B3E` | `text-card-foreground` | Card body copy and title text |
| `--popover` | `#F3EAD2` | `bg-popover` | Dropdowns, tooltips, dialogs, hover popovers |
| `--popover-foreground` | `#5C4B3E` | `text-popover-foreground` | Dropdown text and labels |
| `--primary` | `#8D9D4F` | `bg-primary` / `text-primary` | Brand accent: muted olive / scholarly sage green |
| `--primary-foreground` | `#FDFBF6` | `text-primary-foreground` | Text on primary buttons (clean ivory cream) |
| `--secondary` | `#DECEA0` | `bg-secondary` | Filter tags, secondary buttons, subtle containers |
| `--secondary-foreground` | `#5C4B3E` | `text-secondary-foreground` | Secondary button and pill label text |
| `--muted` | `#DECEA0` | `bg-muted` | Dividers, deactivated areas, track backgrounds |
| `--muted-foreground` | `#85766A` | `text-muted-foreground` | Subtitles, metadata captions, timestamps, course codes |
| `--accent` | `#DBC894` | `bg-accent` | Interactive hover highlights, active chip fills |
| `--accent-foreground` | `#5C4B3E` | `text-accent-foreground` | Text on accented elements |
| `--destructive` | `#D98B7E` | `bg-destructive` | Dusty terracotta/coral: errors, sign-out, rejection |
| `--destructive-foreground` | `#FAF8F2` | `text-destructive-foreground` | White text on destructive alerts |
| `--border` | `#B19681` | `border-border` | Physical bookbinding paper borders, card outlines |
| `--input` | `#DBC894` | `border-input` | Form input field borders, active search bounds |
| `--ring` | `#9DB18C` | `ring-ring` | Focus rings, keyboard accessibility indicators |

#### WCAG AA-Safe Contrast Overrides (Mandatory for Text & Small Elements)
Standard `#8D9D4F` is used for decorative elements, badges, and progress bars. For buttons and small UI text, use these AA-compliant shades:
- **Primary Button Fill:** `#5F6F2E` with `#FDFBF6` ivory text (Contrast ratio ~5.4:1).
- **Muted Small Text / Captions:** `#64574C` against `#E4D7B0` background (Contrast ratio ~4.9:1).
- **Destructive Button Fill:** `#C85A48` with `#FAF8F2` text (Contrast ratio ~5.1:1).

#### Verification & Content Status Tokens
| Status Level | Badge Background | Badge Text / Icon | Icon Type | Context |
|---|---|---|---|---|
| **Verified** | `#DDE5C2` | `#3B5219` (Forest Sage) | `ShieldCheck` | Peer-reviewed by institutional faculty or verified academic domain (MIT OCW, NPTEL) |
| **Pending Review** | `#F3DFA8` | `#8A5A00` (Warm Amber) | `Clock` | Uploaded by faculty/contributor; awaiting moderation queue |
| **Outdated** | `#F2CFC7` | `#9A4A3C` (Terracotta) | `AlertTriangle` | Older regulation or revised curriculum version; shows banner link to current material |

#### Exam Relevance Urgency Indicators
- **High Relevance:** `bg-red-500/10 text-red-700 border-red-300` (Exam countdown $\le 3$ days or core syllabus anchor).
- **Medium Relevance:** `bg-amber-500/10 text-amber-700 border-amber-300` (Standard revision unit topic).
- **Low / Supplementary:** `bg-emerald-500/10 text-emerald-700 border-emerald-300` (Extended reading / reference).

---

#### Theme B: "Dark Study / Night Library" (Dark Mode)
A late-night collegiate aesthetic replicating dark mahogany wood and dim reading lamps.

| Token | Hex Value | Purpose |
|---|---|---|
| `--background` | `#1C1A17` | Deep obsidian & dark aged mahogany |
| `--foreground` | `#F0E9DB` | Aged cream parchment typography |
| `--card` | `#25221E` | Elevated dark card surfaces |
| `--card-foreground` | `#F0E9DB` | Cream text in cards |
| `--primary` | `#8A9F7B` | Muted sage green accent |
| `--primary-foreground` | `#1C1A17` | Dark obsidian text on primary buttons |
| `--secondary` | `#332F28` | Secondary action buttons, tag chips |
| `--muted-foreground` | `#A8A096` | De-emphasized timestamps & captions |
| `--border` | `#332F28` | Dark boundary lines |
| `--ring` | `#8A9F7B` | Muted green focus ring |

---

#### Theme C: "Royal Indigo & Academic Clarity" (Modern Tech Prototype)
*Design alternative preserved from `DOCS/blueprint.md`:*
- **Primary:** `#4D33CC` (Sophisticated Indigo Purple, HSL 250, 60%, 50%)
- **Background:** `#F2EFFB` (Desaturated Violet-Blue, HSL 250, 15%, 95%)
- **Accent:** `#33B7D9` (Clarity Cyan, HSL 220, 80%, 60%)

---

### 1.2 Typography Hierarchy

| Role | Font Family | Fallback | Sizing & Line Height | Usage in UI |
|---|---|---|---|---|
| **Headline / Display** | `Source Serif 4` | `serif` | H1: 40px/48px (Mobile: 30px/36px)<br/>H2: 28px/34px<br/>H3: 20px/28px | Hero titles, page headers, brand logotype, scholarly quotes |
| **Body / Interface** | `Merriweather` | `serif` | Body: 16px/26px<br/>UI Small: 14px/20px<br/>Caption: 13px/18px | Paragraphs, descriptions, button labels, search input |
| **Code / Metadata** | `JetBrains Mono` | `monospace` | Mono: 12px/16px | Course codes (`CS501PC`, `MIT 6.006`), URLs, tags, percentages, regulation tags |

- **Letter-spacing:** `-0.02em` on titles; `0.05em` on uppercase metadata and badges.
- **Minimum Tap Target:** `44px x 44px` on all mobile interactive elements.

---

### 1.3 Materiality, Texture & Micro-Interactions

1. **Tactile Paper Texture (`.bg-paper`):**
   - Inline SVG fractal noise (`<filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/></filter>`) rendered with `mix-blend-mode: multiply` at `0.04` opacity over the `#E4D7B0` background.
2. **Academic Box Shadow (`.shadow-academic`):**
   - `box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(93, 109, 61, 0.05), 0 12px 24px rgba(0,0,0,0.02);`
3. **Ink-Bleed Animation (`.animate-ink`):**
   - Entrance effect: `0.8s cubic-bezier(0.16, 1, 0.3, 1)` sliding up 8px while smoothly un-blurring from `blur(4px)` to `blur(0px)`.
4. **Border Radius:**
   - Cards and inputs: `0.425rem` (`~7px`) mimicking traditional trimmed book corners.
   - Primary action buttons and status badges: Full pill (`rounded-full`).

---

### 1.4 Shared Component Library

Every page in Stitch must reuse these standardized UI components:

```
+-----------------------------------------------------------------------------------+
|  [Type Icon]  RESOURCE TITLE (Source Serif 4, Semi-bold)             [Bookmark ★] |
|  Source: MIT OCW | NPTEL (JetBrains Mono)                                         |
|                                                                                   |
|  [Verified Badge ✓]  [Exam Relevance: High]  [Curriculum Match: 96%]  [Effort: 45m] |
|                                                                                   |
|  Description text explaining the exact mathematical/theoretical concepts covered. |
|                                                                                   |
|  Tags: #Dynamic-Programming  #Unit-3  #R22-Aligned                                |
|  -------------------------------------------------------------------------------  |
|  [Play / Read Online]                                   [Download Offline PDF ↓]  |
+-----------------------------------------------------------------------------------+
```

1. **ResourceCard (`src/components/discovery/ResourceCard.tsx`):**
   - Type Icon (Video: `Play`, Notes: `FileText`, PDF: `File`, Past Paper: `History`, Textbook: `BookOpen`).
   - Title in serif, source in mono uppercase.
   - Status Badge (`Verified`, `Pending`, or `Outdated`).
   - Urgency pill (High / Medium / Low).
   - Time-to-consume pill (`15 min`, `45 min`, `1 hr`, `3 hr`, `6 hr+`).
   - Bookmark toggle button with state persistence.
   - Action button: Direct link with anti-404 verification badge.
2. **Anchor Resource Card:**
   - Same as ResourceCard, highlighted with a gold border (`border-amber-500/50`), subtle gold background tint (`bg-amber-50/20`), and a `Core Curriculum Anchor` star badge.
3. **Global Navigation Bar (`src/components/Navigation.tsx`):**
   - Sticky top bar with logo, institutional subdomain badge (`JNTUH Archive`, `VTU Archive`, `MIT OCW Mirror`), quick navigation links, dynamic auth button (`Sign In` vs. `User Profile / Logout`), and faculty moderation link.
4. **Mobile Bottom Navigation Bar:**
   - 5-tab sticky bottom bar: `Home` (`/home`), `Search` (`/search`), `Library` (`/library`), `Exam` (`/exam`), `Me` (`/me`).
   - Floating Action Button (FAB): "Consult Tutor" (`/chat`) positioned 16px above the tab bar.

---

## 2. Complete Page Inventory (14 Pages)

| # | Page Name | Route Path | Access Role | Primary Purpose | Tap-to-Goal |
|---|---|---|---|---|---|
| **01** | **Landing Page** | `/` | Public | Value proposition, institutional metrics, public catalog entry | 1 tap to `/discover` |
| **02** | **Sign-In / Auth** | `/login` | Public | Institutional email or Google OAuth with student/faculty tab switching | 1 tap to authenticate |
| **03** | **Student Home** | `/home` | Student | Active learning dashboard, upcoming exam countdown, resume studying | 1 tap to resume |
| **04** | **AI Discovery Console** | `/discover` | All | Multi-modal query parsing (course code, text, syllabus) with 6-card curated grid & coverage report | 1 search + 1 tap |
| **05** | **Instant Search Results** | `/search` | All | Millisecond keyword search across 50,000+ indexed resources with multi-facet filters | 1 tap to open |
| **06** | **Structured Library** | `/library` | All | 3-tier hierarchical explorer: Institution > Department > Regulation > Course | 3 taps to resource |
| **07** | **Course Page** | `/courses/:id` | All | Unit-by-unit syllabus breakdown, topic checklists, lecture videos & downloadable notes | 2 taps to topic |
| **08** | **Resource Viewer** | `/resources/:id` | All | Distraction-free embedded player/PDF reader with verification banner and related topics | Direct view |
| **09** | **Exam Mode** | `/exam` | Student | Urgency-driven countdown planner, 48-hour crunch timeline, high-yield material | 2 taps to start |
| **10** | **Academic AI Tutor** | `/chat` | Signed-In | Multi-turn contextual chat grounding answers in verified institutional syllabi | Instant Q&A |
| **11** | **My Library / Profile** | `/me` | Student | Bookmarks, recently viewed history, topic completion bars, offline PDF tray | 1 tap to offline files |
| **12** | **Contributor Dashboard** | `/contribute` | Faculty | Submission tracker with tabs: Drafts, Pending Review, Approved, Needs Changes | 1 tap to upload |
| **13** | **Upload & Syllabus Tagger**| `/contribute/new` | Faculty | 4-step wizard: File upload, metadata, regulation & syllabus unit tagger, review | 4 steps |
| **14** | **Admin Review Queue** | `/admin/review` | Admin/Faculty | Split-screen moderation queue: PDF/video preview, syllabus alignment check, Approve/Reject | 1 tap decision |

---

## 3. Detailed Page-by-Page Content & Stitch Generation Prompts

---

### Page 01: Landing Page (`/`)

#### 1. Page Anatomy & Wireframe
- **Sticky Top Navigation:** Brand tile (graduation cap in sage box) + `EDUFIND AI` in uppercase serif, links to `Features` and `Institutions`, institutional switcher pill, Ghost `Log in` button, Pill `Get Started` button.
- **Hero Section:**
  - Badge: `Sparkles` icon + "ADVANCED LEARNING ARCHIVE" in mono.
  - Headline: "ACADEMIC DISCOVERY REDEFINED." (Source Serif 4, 72px bold).
  - Subtitle: "Access verified, high-authority resources from global institutions mapped precisely to your syllabus. Minimalist. Precise. Reliable."
  - Action Row: Primary button `Start Discovering` (Plus icon) + Secondary outline `Ask AI Tutor` (Message icon).
- **Institutional Metric Bar (4 Pillars):**
  - `500+` Colleges Linked
  - `12K+` Verified Resources
  - `99.8%` Anti-404 Link Reliability
  - `24/7` Neural Curriculum Mentorship
- **Bento Grid Feature Showcase (3 Cards):**
  - Card 1: **Anti-Hallucination Curation** (`ShieldCheck` icon) — Zero broken links, 100% verified academic sources.
  - Card 2: **Syllabus-to-Resource Sync** (`Zap` icon) — Direct mapping to R22, R20, CBCS, and global curriculums.
  - Card 3: **Elite Global Repositories** (`Globe` icon) — Pre-indexed MIT OCW, NPTEL, Stanford SEE, OpenStax.
- **Footer:** Archival imprint "EST. 2024 • STUDYBRIDGE ARCHITECTURE", privacy policy, institutional license.

#### 2. Stitch Generation Prompt
```text
Generate a modern academic landing page for "EduFind AI" using the "Natural Parchment & Scholarly Ink" aesthetic.
- Color tokens: Background #E4D7B0, Text #5C4B3E, Primary Accent #8D9D4F (Button fill #5F6F2E for AA contrast), Card surface #E7DBBF, Border #B19681.
- Typography: Headline Source Serif 4 bold uppercase; Body Merriweather; Metadata JetBrains Mono.
- Layout:
  1. Sticky top navigation with graduation cap logo, "EDUFIND AI", "Features", "Institutions", "Log in", and a pill button "Get Started".
  2. Hero section with a pill badge "ADVANCED LEARNING ARCHIVE", monumental headline "ACADEMIC DISCOVERY REDEFINED", italic subtitle on syllabus curation, and two CTAs ("Start Discovering" in olive green with plus icon, and "Ask AI Tutor" in outlined paper border).
  3. Four-metric stat bar: 500+ Colleges Linked, 12K+ Resources, 99.8% Link Reliability, 24/7 AI Mentorship.
  4. Three-column bento grid for Verified Uptime, Syllabus Sync, and Elite Repositories (MIT, NPTEL, Stanford).
  5. Minimal scholarly footer with archival copyright.
- Texture: Subtle paper noise overlay, gentle multi-layer shadow (shadow-academic), 7px rounded corners.
```

---

### Page 02: Sign-In / Authentication (`/login`)

#### 1. Page Anatomy & Wireframe
- **Top Bar:** Back link `← Return to Library` leading to `/`.
- **Centered Manuscript Login Card (`max-w-md`):**
  - Header: Scholarly seal emblem (`Scroll` + `GraduationCap`), Title `Scholar Sign-In`, Subtitle `Verify your institutional trajectory to continue.`
  - Role Tabs: `Student Access` | `Faculty & Contributor Access`.
  - Student Tab:
    - Input: Institutional Email (`name@university.edu` or `student@jntuh.ac.in`).
    - Input: Password with toggle visibility.
    - Button: `Enter Academic Archive` with spinner state.
    - Divider: "— OR CONTINUE WITH —"
    - Social Button: Outline `Sign in with Google` with institutional domain validation note.
  - Faculty Tab:
    - Same as student plus third field: `Institutional Authorization Key` (e.g. `INST-VERIFY-2026`).
  - Guest Access Link: "Browse as Guest (Read-Only Archive)" leading to `/discover`.
  - Toast Notifications: Success toast `Session Established: Welcome Scholar`, Error toast `Signal Rejected: Invalid institutional credentials`.

#### 2. Stitch Generation Prompt
```text
Generate an authentication page for "EduFind AI" in Natural Parchment (#E4D7B0) and Ink (#5C4B3E).
- Centered parchment card (#E7DBBF) with an embossed book-plate border (#B19681).
- Top back button: "← Return to Library".
- Seal emblem icon at card top, followed by serif title "Scholar Sign-In" and caption "Verify your institutional trajectory to continue".
- Two segmented tabs: "Student" and "Faculty".
- Form fields: Email input and Password input inside warm cream containers (#F3EAD2) with subtle focus ring (#9DB18C). Faculty tab adds "Institutional Secret Key" input.
- Primary CTA: Pill button in sage olive (#5F6F2E) with text "Enter Academic Archive".
- Divider "OR" with an outline button for "Sign in with Google" (with Google G logo).
- Footer link: "Browse as Guest (Read-Only Archive)".
- Include error state with dusty terracotta banner (#F2CFC7 with text #9A4A3C) for wrong credentials.
```

---

### Page 03: Student Home Dashboard (`/home`)

#### 1. Page Anatomy & Wireframe
- **Greeting Header:** "Good evening, Ananya." in Source Serif 4, with current date and university banner (`JNTUH • Computer Science & Engineering • Semester 5`).
- **Urgent Exam Countdown Banner:**
  - Highlighting nearest registered exam: "Operating Systems (CS501PC) in 3 days, 14 hours".
  - Quick button: `Launch Exam Mode Revision →` (links to `/exam`).
- **Quick Universal Search Bar:**
  - Large rounded input with placeholder `Search courses, topics, past questions, or unit formulas...`.
- **Continue Learning Carousel:**
  - 3 horizontal cards representing recently accessed topics:
    - `Virtual Memory & Paging` (CS501PC) — 70% completed with sage progress bar.
    - `B-Trees and Indexing` (CS502PC) — 40% completed.
    - `TCP Congestion Control` (CS503PC) — 90% completed.
- **My Registered Courses Grid (2x2):**
  - Course card with mono course code, full name, unit count, and % syllabus mastered.
- **Quick Action Pills:**
  - `AI Syllabus Discovery` | `Bookmarks Notebook` | `Ask AI Tutor` | `Past Exam Papers`.
- **Bottom Navigation Bar (Mobile):** 5-tab bar with Home highlighted.

#### 2. Stitch Generation Prompt
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

---

### Page 04: AI Discovery Console (`/discover`)

#### 1. Page Anatomy & Wireframe
- **Top Header:** Title `AI Discovery Console`, Subtitle `Synthesizing global academic archives against institutional syllabi.`
- **Multi-Modal Smart Search Input:**
  - Expansive textarea supporting: Course codes (`CS501PC`), free-text queries (`How does virtual memory work?`), or entire pasted syllabi.
  - Three prompt chips for instant demo queries:
    - Chip 1: `MIT 6.006 Algorithms & Data Structures`
    - Chip 2: `Operating Systems exam in 2 days (High Urgency)`
    - Chip 3: `Syllabus Mode: Unit 1 ER Model, Unit 2 Normalization, Unit 3 Transactions`
  - Action button: `Analyze & Discover Resources` (transforms to spinning brain icon with `Synthesizing Curriculum...`).
- **Query Analysis Metric Strip (4 Cards):**
  - Detected Institution (`JNTUH / MIT OCW`)
  - Course Domain (`Computer Science / Systems`)
  - Academic Level (`UG Semester 5`)
  - Curriculum Standard (`R22 Regulation Compliant`)
- **Syllabus Unit Map (Activated when full syllabus is detected):**
  - Accordion list of Units 1 to 5 with syllabus match percentage (e.g. `94% Syllabus Sync`).
  - Core Anchor Material card highlighted with a gold star badge.
- **Curated 6-Resource Precision Grid (3x2 Desktop, 1 Column Mobile):**
  - Exactly 6 verified items. No infinite scroll dump.
  - Card anatomy: Type badge (`Video`, `PDF Notes`, `Past Paper`), Verification Shield, Exam Relevance pill, Time-to-consume pill, Topic tags, Direct URL action button, Bookmark button.
- **Coverage & Gap Analysis Panel:**
  - Green checkmark pills for topics fully covered in the library.
  - Terracotta alert pills for topics with coverage gaps.
  - Recommendation banner: "Recommended starting point: Unit 2 Virtual Memory Lecture by Dr. Rao".
- **Floating Action Button:** Bottom-right `Ask AI Tutor about these resources`.

#### 2. Stitch Generation Prompt
```text
Generate the flagship AI Discovery Console for EduFind AI.
- Colors: Warm parchment #E4D7B0, card background #E7DBBF, sage primary #5F6F2E, ink text #5C4B3E, gold highlight #DBC894.
- Header: Academic title "AI Discovery Console" with subtitle "Synthesizing global academic archives against institutional syllabi".
- Input card: Multi-line query textarea with placeholder "Paste a syllabus, enter a course code (e.g. CS501PC), or type an exam question...". Below it, 3 quick-query pill buttons, and a prominent submit button "Analyze & Discover Resources".
- Analysis bar: 4 small parchment tiles showing Detected Institution, Subject Domain, Academic Level, and Regulation Standard.
- Main results section: Exactly 6 resource cards arranged in a 3x2 grid. One card is designated "Core Curriculum Anchor" with a gold star badge and thicker border. Each card displays: resource type icon (video/PDF), title in Source Serif 4, source institution in monospace, "Verified" badge with shield icon, exam relevance pill (High/Medium), time-to-consume pill (e.g. "45 min"), and action buttons for "View Resource" and "Bookmark".
- Bottom panel: "Curriculum Coverage & Gap Report" with green badges for covered topics, terracotta badges for missing topics, and an action button "Start Recommended Path".
```

---

### Page 05: Instant Search & Filter Results (`/search`)

#### 1. Page Anatomy & Wireframe
- **Persistent Sticky Search Header:**
  - Search input displaying active keyword with instant auto-complete suggestions.
  - Result meta caption: `48 verified resources found in 0.28 seconds`.
- **Multi-Facet Filter Strip (Desktop Rail / Mobile Bottom Sheet):**
  - Filter chips: `All Types` | `Video Lectures` | `Revision Notes` | `Past Papers` | `Textbooks`.
  - Regulation dropdown: `All Regulations` | `R22` | `R20` | `CBCS`.
  - Semester selector: `Sem 1` through `Sem 8`.
  - Toggle switch: `Verified Only` (enabled by default with a green shield).
  - Sort selector: `Relevance` | `Shortest Time` | `Most Recent` | `Exam Frequency`.
- **Search Result Stream:**
  - List of ResourceCards with keyword highlights in bold ink.
  - Typo correction notice: "Showing results for *thermodynamics*. Search instead for *thermodinamics*?"
- **Empty State:**
  - Friendly serif illustration: "No direct archival matches found."
  - Action button: `Launch AI Deep Discovery on this Query →` (redirects to `/discover`).

#### 2. Stitch Generation Prompt
```text
Generate an Instant Academic Search Results page for EduFind AI.
- Palette: Parchment background (#E4D7B0), Ink text (#5C4B3E), Olive accent (#5F6F2E), Card containers (#E7DBBF).
- Top sticky bar: Search input with typed query "Operating Systems Scheduling", clear button, and filter toggle button.
- Metadata line: "48 verified resources found in 0.28s • JNTUH R22 Aligned".
- Filter chip row: Horizontal scrollable pills for "All", "Videos", "Notes", "Past Papers", and a "Verified Only" toggle switch.
- Main stream: Vertical stacked list of academic resource cards. Each card has a left-hand type icon, serif title with highlighted matching search terms, institution badge (mono), verification status badge, effort estimate ("30 min"), and action buttons.
- Sidebar (desktop): Refine by Semester (1-8), Regulation (R22, R20), and Examination Year.
```

---

### Page 06: Structured Library Browser (`/library`)

#### 1. Page Anatomy & Wireframe
- **Breadcrumb Navigation:** `Global Archive > JNTU Hyderabad > Computer Science & Engineering > R22 Regulation`.
- **Step 1: Institution Selector Cards:**
  - Tiles with university seal, name, total courses, and tier badge (e.g. `JNTUH`, `VTU`, `Anna University`, `MIT OCW`).
- **Step 2: Department Directory:**
  - List of departments: `Computer Science (CSE)`, `Electronics (ECE)`, `Information Tech (IT)`, `Mechanical (MECH)`.
- **Step 3: Semester & Course Grid:**
  - Segmented control: `Year 1 (Sem 1-2)` | `Year 2 (Sem 3-4)` | `Year 3 (Sem 5-6)` | `Year 4 (Sem 7-8)`.
  - Course cards displaying: Course Code in JetBrains Mono (`CS501PC`), Course Title (`Operating Systems`), Total Verified Notes, Videos count, and Syllabus Completion %.
- **3-Tap Audit Check:** Tap 1: Select College → Tap 2: Select Dept & Semester → Tap 3: Tap Course Card to enter Course Page.

#### 2. Stitch Generation Prompt
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

---

### Page 07: Course Page (`/courses/:id`)

#### 1. Page Anatomy & Wireframe
- **Hero Banner:**
  - Course Code (`CS501PC`) in bold mono, Course Title `Operating Systems`, Department `CSE`, Regulation `R22`, Academic Credits `3 Credits`.
  - Quick CTAs: `Start Exam Mode Revision` (Pill button with flame icon) and `Download All Unit PDFs` (Folder download icon).
  - Overall Syllabus Mastery Progress Bar (e.g. `62% Completed`).
- **Tabs Strip:** `Units & Syllabus` | `All Resources (28)` | `Past Exam Papers (6)` | `Syllabus Blueprint`.
- **Unit Accordion List (Units 1 to 5):**
  - **Unit Header:** Unit Number (`Unit I: Overview & System Calls`), topic summary, progress indicator (`4/5 topics finished`).
  - **Topic Rows (inside expanded unit):**
    - Checkbox: Mark topic complete.
    - Topic Name: `Process Management & PCB Structure`.
    - Type Icons: Video (Play icon + "2 vids"), Notes (File icon + "1 PDF").
    - Expand Arrow: Reveals inline curated resources for that specific topic.
- **Desktop Sidebar:**
  - `Recommended Starting Point` card.
  - `Exam Alert`: Upcoming date and syllabus weightage distribution.
  - `Offline Bundle`: One-click button to save the entire course notes for offline use.

#### 2. Stitch Generation Prompt
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

---

### Page 08: Resource Viewer / Detail (`/resources/:id`)

#### 1. Page Anatomy & Wireframe
- **Top Bar:** Back button `← Back to Course CS501PC`, Breadcrumb, and Action Bar (`Bookmark`, `Mark Complete`, `Download PDF`, `Report Issue`).
- **Resource Header:**
  - Resource Title: `Complete Guide to Virtual Memory, Paging, and Page Fault Algorithms`.
  - Metadata Bar: Type pill (`PDF Notes`), Source (`NPTEL / IIT Madras`), Author (`Prof. P. Rao`), Last Updated (`March 2026`).
- **Verification Strip:**
  - Sage green badge: `Verified Academic Resource`.
  - Details: "Reviewed by Faculty Panel for JNTUH R22 Regulation compliance on 14 Feb 2026."
  - Outdated warning (if applicable): Terracotta banner "A newer R24 syllabus version is available [Click to view]".
- **Main Viewer Area:**
  - If Video: Embedded responsive video player with speed toggle (`1x`, `1.25x`, `1.5x`, `2x`), chapter timestamps, and transcript panel.
  - If PDF: Multi-page PDF viewer with search in document, zoom controls, and download button.
- **Bottom Related Knowledge Row:**
  - "Next Recommended Topic in Unit 2: Page Replacement Algorithms (FIFO vs LRU)".
  - 3 related resource recommendation cards.

#### 2. Stitch Generation Prompt
```text
Generate a distraction-free Academic Resource Viewer page for EduFind AI.
- Visuals: Warm parchment background (#E4D7B0), ink typography (#5C4B3E), paper container (#E7DBBF).
- Top navigation: Back button "← Back to Operating Systems", resource title, and action icons (bookmark star, download icon, share, report).
- Verification Banner: Subtle sage box (#DDE5C2 border #8D9D4F) with checkmark shield: "Verified Academic Resource • Aligned to JNTUH R22 Syllabus by Prof. Rao".
- Main viewport: PDF/Video document container with aged paper border and drop shadow. Shows page 1 of an academic lecture note with title, diagram, and structured formulas.
- Document controls bar: Page counter "Page 1 of 18", Zoom +/- controls, "Download for Offline Study" pill button.
- Bottom section: "Next Topic in this Unit" card with arrow button to continue studying.
```

---

### Page 09: Exam Mode & Countdown Revision Path (`/exam`)

#### 1. Page Anatomy & Wireframe
- **Urgent Countdown Hero:**
  - Large Serif Countdown: `3 Days : 14 Hours : 22 Minutes`.
  - Subject Name: `Operating Systems (CS501PC) — Final Semester Exam`.
  - Urgency Badge: `HIGH ALERT (CRUNCH MODE ACTIVATED)`.
- **Target Time Allocator:**
  - Selector: `I have: 6 Hours | 12 Hours | 24 Hours | 48 Hours`.
  - Mode switches dynamically to **Crunch Algorithm** (filtering out long 3-hour lectures, keeping only 15-minute concept summaries, high-weightage formulas, and past paper solutions).
- **Prioritized Revision Timeline (Vertical Path):**
  - **Phase 1: High-Yield Theory (Must-Pass Core):**
    - Card: Process Scheduling & CPU algorithms (15 min video summary).
    - Card: Deadlock Prevention & Banker's Algorithm (Cheatsheet PDF).
  - **Phase 2: Numerical & Algorithmic Problems:**
    - Card: Page Replacement FIFO/LRU Solved Problems (Past 5 Years).
  - **Phase 3: Last-Minute Cheatsheet:**
    - Card: 1-Page Formula & Definition PDF (Downloadable).
- **Completion Tracker:**
  - Sticky bottom/side card: `Today's Revision Goal: 4 of 6 topics completed (66%)`.

#### 2. Stitch Generation Prompt
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

---

### Page 10: Academic AI Tutor (`/chat`)

#### 1. Page Anatomy & Wireframe
- **Header:**
  - Bot Avatar: Owl/Graduation cap seal + `Academic AI Tutor`.
  - Status indicator: `Grounded in JNTUH R22 Curriculum Archive`.
  - Actions: `Reset Dialogue` (refresh icon) and `Select Course Context` dropdown.
- **Starter Prompt Cards (3 Grid):**
  - Card 1: `Deep Concepts` — "Explain Paging vs Segmentation with a diagrammatic breakdown."
  - Card 2: `Numerical Solver` — "Walk me through Banker's Algorithm with an example allocation matrix."
  - Card 3: `Exam Predictions` — "What are the most repeated 10-mark questions in Unit 3?"
- **Chat Message Stream:**
  - Student bubbles (Right-aligned): Sandy parchment background (`#DECEA0`), user avatar, clean typography.
  - Tutor bubbles (Left-aligned): Elevated paper card (`#E7DBBF`), bot avatar, mathematical formula rendering ($KaTeX$), bulleted steps, and **Verified Source Citations**.
  - Source Chips under Tutor answers: Clickable pills `[Source: NPTEL Lec 14]` linking directly to verified course resources.
- **Bottom Input Dock:**
  - Expanding multi-line text input with paperclip attachment (for pasting syllabus questions) and send button.
  - Disclaimer: "Verified against institutional syllabus standards. Zero hallucinations."

#### 2. Stitch Generation Prompt
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

---

### Page 11: My Library & Scholar Toolkit (`/me`)

#### 1. Page Anatomy & Wireframe
- **Profile Header:**
  - User name (`Ananya Rao`), University (`JNTU Hyderabad`), Degree (`B.Tech CSE, 3rd Year`), Subdomain (`jntuh.edufind.ai`).
  - Dark/Light Theme toggle switch and Settings icon.
- **Segmented Library Tabs:** `Bookmarks & Notes (14)` | `Recently Viewed (8)` | `Syllabus Progress` | `Offline Study Tray (5 PDFs)`.
- **Tab 1: Bookmarks:**
  - Grid of saved ResourceCards with quick `Remove from Bookmarks` action and student private notes.
- **Tab 2: Syllabus Progress:**
  - Per-course progress cards with circular completion percentage rings (e.g. Operating Systems: `62%`, DBMS: `85%`, Computer Networks: `40%`).
- **Tab 3: Offline Study Tray:**
  - Table of cached PDFs and notes with file size (`2.4 MB`, `1.8 MB`), date saved, and `Open Offline Reader` button.
  - Offline status pill: `5 Files Available Without Internet Connection`.

#### 2. Stitch Generation Prompt
```text
Generate a "My Library & Scholar Toolkit" personal profile page for EduFind AI.
- Style: Natural Parchment (#E4D7B0), dark ink typography (#5C4B3E), cards (#E7DBBF).
- Profile Header: Scholar avatar, name "Ananya Rao", institutional badge "JNTUH — CSE 3rd Year", and a theme toggle button (Sun/Moon).
- Tab Navigation: 4 tabs: "Pinned Bookmarks (14)", "Recently Studied", "Curriculum Progress", "Offline Storage (5 PDFs)".
- Main Content (Pinned Bookmarks view):
  - 3 saved resource cards showing type icon, title, course tag ("CS501PC"), and a private note snippet ("Revise this before Wednesday's mid-term").
- Offline Storage section: Card showing storage used ("18.4 MB of 50 MB offline quota") with a list of downloaded revision PDFs and a green "Ready Offline" badge.
```

---

### Page 12: Contributor Dashboard (`/contribute`)

#### 1. Page Anatomy & Wireframe
- **Top Header:** Title `Faculty & Contributor Portal`, Subtitle `Upload, organize, and submit verified academic materials for institutional moderation.`
- **Action CTA:** Primary pill button `+ Upload New Resource` leading to `/contribute/new`.
- **4 Status Metric Cards:**
  - `Drafts (2)` — Incomplete uploads.
  - `Pending Review (5)` — Awaiting faculty review panel.
  - `Approved & Verified (38)` — Published live in student archives.
  - `Needs Revision (1)` — Terracotta badge with feedback comments.
- **Resource Management Table:**
  - Columns: `Resource Title`, `Course & Regulation`, `Type`, `Upload Date`, `Status Badge`, `Actions`.
  - Actions: Edit, View Reviewer Feedback, Delete.

#### 2. Stitch Generation Prompt
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

---

### Page 13: 4-Step Resource Upload & Syllabus Tagger (`/contribute/new`)

#### 1. Page Anatomy & Wireframe
- **Step Indicator Header (1 to 4):**
  - Step 1: `File & Media`
  - Step 2: `Metadata & Description`
  - Step 3: `Syllabus & Regulation Tagging`
  - Step 4: `Review & Submit`
- **Step 1 View: File Upload Area:**
  - Drag-and-drop parchment target with cloud upload icon.
  - File restrictions: PDF or MP4, max 50MB. Shows instant virus/malware scan badge.
- **Step 2 View: Resource Metadata:**
  - Fields: Resource Title, Detailed Academic Description, Resource Type (`Revision PDF`, `Notes`, `Past Paper`, `Video Lecture`), Author/Faculty Name.
- **Step 3 View: Syllabus Alignment Engine:**
  - University dropdown (`JNTU Hyderabad`).
  - Regulation selector (`R22 Regulation`).
  - Course selector (`CS501PC Operating Systems`).
  - Target Unit selector (`Unit 1` to `Unit 5`).
  - Topic Tags: Auto-suggested chips from institutional syllabus database (e.g. `#Paging`, `#VirtualMemory`, `#DemandPaging`).
  - Exam Relevance estimate: `High` | `Medium` | `Low`.
- **Step 4 View: Summary & Submission:**
  - Card preview showing how the resource will look to students.
  - Buttons: `Save as Draft` and `Submit for Verification`.

#### 2. Stitch Generation Prompt
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

---

### Page 14: Admin Moderation & Review Queue (`/admin/review`)

#### 1. Page Anatomy & Wireframe
- **Header:**
  - Title `Institutional Moderation Desk`, Subtitle `Review, verify, or request changes on contributor submissions.`
  - Queue count badge: `12 Items Awaiting Verification`.
- **Split-Screen Moderation Layout (Desktop):**
  - **Left Pane (Queue List - 35% width):**
    - Filter tabs: `Oldest First` | `By Course` | `High Priority`.
    - Stack of submission cards showing contributor name, course, title, file size, and submission timestamp (`2 hours ago`).
    - Active selection indicator with green border.
  - **Right Pane (Verification Workbench - 65% width):**
    - Embedded Document / Video Preview pane.
    - Contributor & Tagging Inspector: Confirms university, department, regulation (`R22`), unit, and topics.
    - Anti-Hallucination & Link Health Audit: `URL Status: 200 OK (Live)` and `Syllabus Match Confidence: 94%`.
    - Moderation Action Bar:
      - Primary Button: `Approve & Mark Verified` (Sage green button with shield check).
      - Secondary Button: `Request Revisions` (Amber outline).
      - Destructive Button: `Reject Submission` (Terracotta button).
    - Feedback Modal / Textbox: Opens when rejecting or requesting changes, allowing the reviewer to provide specific guidance (e.g., "Please re-upload with Unit 2 diagrams included").

#### 2. Stitch Generation Prompt
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

## 4. Stitch Execution Playbook: Step-by-Step Prompting Strategy

To get the highest quality UI generation from Stitch when referencing the codebase, follow this sequence:

### Step 1: Initialize the Global Design System in Stitch
Copy and paste this master brief into Stitch before generating individual screens:

```text
You are generating screens for "EduFind AI", an academic discovery web app.
Follow these strict design tokens across all screens:
- Palette: Background #E4D7B0 (aged parchment), Foreground #5C4B3E (scholarly ink), Card surfaces #E7DBBF, Borders #B19681, Primary button #5F6F2E with #FDFBF6 text, Secondary #DECEA0, Accent #DBC894, Destructive #D98B7E.
- Typography: Display/Headlines in Source Serif 4 (bold); Body/UI in Merriweather; Codes/Tags in JetBrains Mono.
- Corners: 7px border radius on cards and inputs; full pill radius on primary action buttons and badges.
- Shadow: Academic soft multi-layer shadow (0 4px 12px rgba(93, 109, 61, 0.05)).
- Icons: Line icons only (Lucide style).
- Mobile-first: Design at 390px mobile viewport, then scale gracefully to 1280px desktop.
```

### Step 2: Generation Order (Core to Supporting)
Generate the pages in this order so Stitch builds upon shared UI patterns:
1. **Page 04 (Discovery Console)** — Defines the signature 6-card grid, query analysis, and coverage report.
2. **Page 07 (Course Page)** — Establishes unit accordions, topic checkboxes, and resource filters.
3. **Page 09 (Exam Mode)** — Introduces countdown timers and crunch timeline components.
4. **Page 05 (Search Results)** — Reuses the resource cards with filter chips and search header.
5. **Page 01 (Landing Page)** — Establishes public brand identity and bento feature blocks.
6. **Page 02 (Sign-In)** — Simple centered credential card with institutional tabs.
7. **Page 03 (Student Home)** — Brings together the search bar, countdown widget, and progress carousels.
8. **Page 08 (Resource Viewer)** — Dedicated PDF/video viewport with verification strip.
9. **Page 10 (AI Tutor)** — Contextual chat stream with mathematical formulas and source citations.
10. **Page 11 (My Library)** — Pinned bookmarks and offline storage tray.
11. **Pages 12, 13, 14 (Contributor & Admin Suite)** — Moderation tables, 4-step wizard, and split-screen review queue.

---

## 5. Summary Matrix: 14 Pages at a Glance

| Page # | Name | Route | Role | Key Components |
|---|---|---|---|---|
| **01** | Landing | `/` | Public | Hero, 4-Metric Bar, Bento Grid, Public Footer |
| **02** | Sign-In | `/login` | Public | Student/Faculty Tabs, Email/Password, Google OAuth, Guest Link |
| **03** | Student Home | `/home` | Student | Exam Countdown, Continue Learning Carousel, Registered Courses, Quick Pills |
| **04** | AI Discovery | `/discover` | All | Textarea, Quick Chips, 4 Metric Tiles, 6-Card Precision Grid, Gap Report |
| **05** | Search Results | `/search` | All | Live Filter Chips, Sort Dropdown, Highlighted Word Cards, Typo Hint |
| **06** | Library Browse | `/library` | All | 3-Tier Breadcrumbs, College Cards, Department List, Course Grid |
| **07** | Course Page | `/courses/:id` | All | Unit Accordions, Topic Checklists, Resource Badges, Offline Bundle Download |
| **08** | Resource Viewer | `/resources/:id` | All | Video Player / PDF Iframe, Verification Strip, Action Bar, Next Topic |
| **09** | Exam Mode | `/exam` | Student | Large Countdown, Time Allocator (6h/12h/24h/48h), Prioritized Timeline |
| **10** | AI Tutor | `/chat` | Signed-In | Starter Cards, Message Stream, KaTeX Math, Verified Citation Chips |
| **11** | My Library | `/me` | Student | Bookmarks, Progress Rings, Offline PDF Storage Quota |
| **12** | Contributor Portal| `/contribute` | Faculty | Metric Cards (Drafts/Pending/Live), Submission Table, Upload Action |
| **13** | Upload & Tag | `/contribute/new`| Faculty | 4-Step Wizard, File Drop, Metadata, Regulation/Unit Tagger |
| **14** | Admin Review | `/admin/review` | Admin | Split Pane, Document Preview, Live Audit Badges, Approve/Reject Bar |
