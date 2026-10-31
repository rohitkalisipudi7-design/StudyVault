# EduFind AI — Simple 14-Page Specification & Stitch Prompts

> **Visual Style:** Minimal Academic  
> **Three Primary Colours:**  
> • **Soft White:** `#FDFBF7` (Canvas background, card surfaces, clean spacing)  
> • **Sage Green:** `#8A9D6A` (Badges, tags, progress bars, active indicators)  
> • **Deep Olive:** `#2D3822` (Headings, primary text, buttons, borders)  

---

## Global Stitch Design System (Paste into Stitch First)

```text
Global design instructions for EduFind AI:
- Three primary colours only:
  1. Soft White (#FDFBF7): Base background and cards.
  2. Sage Green (#8A9D6A): Accents, tags, progress indicators, active highlights.
  3. Deep Olive (#2D3822): Headings, body text, buttons, subtle borders (15% opacity).
- Typography: Classic serif for titles (Source Serif 4), clean readable font for body, monospace for course codes.
- Corners: 8px radius on cards and containers; full rounded pills for buttons and badges.
- Style: Minimal, uncluttered, distraction-free academic layout with generous whitespace.
- Viewport: Mobile-first (390px) responsive to desktop (1280px).
```

---

## All 14 Pages: Concise Breakdown & Stitch Prompts

---

### Page 01: Landing Page (`/`)
* **Role & Purpose:** Public. Explains the platform and directs students to search.
* **Key Content:** Top navbar with logo & "Get Started" button, serif headline *"Academic Discovery, Simplified"*, search bar, 3 metric cards (*500+ Verified Courses*, *Zero Broken Links*, *Exam Countdown Mode*), and minimal footer.

```text
Generate a clean, minimal landing page for "EduFind AI".
- Palette: Soft White (#FDFBF7) background, Deep Olive (#2D3822) text/buttons, Sage Green (#8A9D6A) accents.
- Navbar: Brand title "EduFind AI" in serif, navigation links ("Library", "AI Tutor"), and a solid Deep Olive pill button "Get Started".
- Hero:
  - Sage Green pill tag: "VERIFIED INSTITUTIONAL ARCHIVE".
  - Serif headline: "Academic Discovery, Simplified."
  - Subtitle: "Lecture notes, video lectures, and past exam questions mapped directly to university syllabi."
  - Large rounded search bar with placeholder "Search course code or topic..." and a Deep Olive "Discover" button.
- Three Metric Cards:
  1. "500+ Verified Courses" (with book icon)
  2. "Zero Broken Links" (100% verified URLs)
  3. "Exam Mode Countdown" (48-hour prioritized revision)
- Minimal footer with archival copyright.
```

---

### Page 02: Sign-In / Login (`/login`)
* **Role & Purpose:** Public. Institutional login for students and faculty.
* **Key Content:** Back link, centered white card, Student/Faculty toggle tabs, email and password inputs, primary sign-in button, Google login button, guest browse link.

```text
Generate a minimal, distraction-free login page for "EduFind AI".
- Palette: Soft White (#FDFBF7) background, Deep Olive (#2D3822) text, Sage Green (#8A9D6A) accents.
- Centered card: Clean white container with a subtle Deep Olive border.
- Card Header: Academic graduation cap icon, title "Scholar Sign-In", subtitle "Access your institutional archive".
- Segmented tab switch: "Student" and "Faculty".
- Inputs: Institutional email and password fields inside Soft White boxes with Sage Green focus rings.
- Primary CTA: Solid Deep Olive pill button "Enter Archive".
- Divider "or" with outline button "Continue with Google".
- Bottom link: "Browse as Guest (Read-Only)".
```

---

### Page 03: Student Home Dashboard (`/home`)
* **Role & Purpose:** Student. Personalized hub to continue studying and track upcoming exams.
* **Key Content:** Student greeting, urgent exam countdown card, search bar, "Continue Learning" topic cards with progress bars, and registered course grid.

```text
Generate a clean Student Home Dashboard for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Top Header: Greeting "Good evening, Ananya" with university badge "JNTUH • CSE Semester 5".
- Exam Countdown Card: Bordered card with a Sage Green ring: "Operating Systems Exam in 3 Days, 14 Hours" and a Deep Olive button "Open Exam Mode".
- Universal Search Bar: Rounded input with magnifying glass icon.
- "Continue Learning" Row: 3 horizontal topic cards with Sage Green progress bars (e.g. "Virtual Memory — 70% complete").
- "My Courses" Grid: 2-column cards showing course code in monospace (e.g. CS501PC), title, and progress.
- Bottom mobile navigation bar with 5 icons (Home, Search, Library, Exam, Me).
```

---

### Page 04: AI Discovery Console (`/discover`)
* **Role & Purpose:** All users. Paste syllabus text, course codes, or questions to get 6 verified resources.
* **Key Content:** Query textarea with 3 demo query chips, 4 detected criteria pills, 6 curated resource cards (1 highlighted Anchor card), and a curriculum coverage checklist.

```text
Generate the AI Discovery Console for "EduFind AI".
- Palette: Soft White (#FDFBF7) background, Deep Olive (#2D3822) text/buttons, Sage Green (#8A9D6A) badges.
- Top Query Box: Multi-line textarea with placeholder "Paste a syllabus, course code (e.g. CS501PC), or topic...". Below it, 3 quick pill buttons for demo queries, and a Deep Olive button "Analyze & Discover".
- Detection Strip: 4 Sage Green pills: [JNTUH] [Computer Science] [Semester 5] [R22 Aligned].
- Curated 6-Card Resource Grid (2x3):
  - Card 1 (Anchor): Highlighted with Sage Green border, title "Complete Guide to Virtual Memory", source "NPTEL / IIT Madras", "Verified ✓" badge, "High Yield" pill, and "Open Resource" button.
  - Cards 2 to 6: Clean cards for videos, lecture PDFs, and past question papers with estimated time ("30 min").
- Bottom Panel: "Curriculum Coverage Report" with green checkmarks for covered topics and an alert pill for gaps.
```

---

### Page 05: Instant Search Results (`/search`)
* **Role & Purpose:** All users. Filtered keyword search across indexed resources.
* **Key Content:** Sticky search bar with query, result count (*"48 verified resources"*), horizontal filter chips (All, Videos, Notes, Past Papers, Verified Only), and vertical result cards.

```text
Generate a clean Academic Search Results page for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Top Bar: Search input showing "Process Scheduling Algorithms" with a clear button and result count "48 verified resources in 0.3s".
- Filter Chip Row: Horizontal pills for "All Types", "Videos", "Lecture Notes", "Past Papers", and a "Verified Only" toggle switch.
- Result Stream: Vertical list of resource cards. Each card displays:
  - Left type icon (Play icon for video, File icon for PDF).
  - Serif title with matching keywords in bold Deep Olive.
  - Source tag in monospace ("MIT OCW" or "NPTEL").
  - Sage Green "Verified ✓" pill and time pill ("25 min").
  - Bookmark and download icons.
```

---

### Page 06: Structured Library Browser (`/library`)
* **Role & Purpose:** All users. Hierarchical 3-tap browsing: College → Department → Regulation → Course.
* **Key Content:** Breadcrumb navigation trail, college cards, department selector pills, and course cards with syllabus completion percentage.

```text
Generate a 3-tier Structured Library Browser for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Breadcrumb: "Archive > JNTU Hyderabad > Computer Science > Semester 5".
- Search Input: Quick filter to find departments or courses.
- Department Selector: Row of pills (CSE, ECE, IT, MECH) with active department highlighted in Deep Olive.
- Course Grid: 6 clean cards showing:
  - Monospace code badge: "CS501PC • R22".
  - Serif course title: "Operating Systems".
  - Stats: "5 Units • 24 Verified Notes • 6 Past Papers".
  - Progress bar in Sage Green showing "75% Syllabus Mapped".
  - Action link: "Open Course Archive →".
```

---

### Page 07: Course Page (`/courses/:id`)
* **Role & Purpose:** All users. Complete unit syllabus, topic checklists, and organized files.
* **Key Content:** Course title header, "Start Exam Revision" button, overall progress bar, Units 1–5 accordions with topic checkboxes, and downloadable PDF links.

```text
Generate a Course Syllabus & Unit Hub page for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Header:
  - Monospace code: "CS501PC • R22 REGULATION".
  - Large Serif Title: "Operating Systems".
  - Subtitle: "JNTUH • Department of Computer Science • Semester 5".
  - Button: Deep Olive pill with flame icon "Start Exam Revision".
  - Progress bar: "62% Syllabus Mastered" in Sage Green.
- Unit Accordions (Units 1 to 5):
  - Unit 1 (Expanded): Title "Process Management & Scheduling".
    - Topic checklist:
      [✓] Process Control Blocks & Lifecycle (1 Video, 1 Note)
      [✓] CPU Scheduling Algorithms (2 Videos, 1 Solved PDF)
      [ ] Inter-Process Communication & Pipes (1 Note)
    - Under each topic: compact cards with "View" and "Download PDF" links.
  - Units 2 to 5 (Collapsed).
```

---

### Page 08: Resource Viewer / Detail (`/resources/:id`)
* **Role & Purpose:** All users. Distraction-free embedded document or video player.
* **Key Content:** Back to course link, verification status banner, video player or PDF reader container, action buttons (Bookmark, Download, Share), and "Next Topic" recommendation.

```text
Generate a distraction-free Resource Viewer page for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Top Navigation: Back button "← Back to Operating Systems", title, and action icons (bookmark, download, report).
- Verification Banner: Sage Green box with checkmark shield: "Verified Academic Resource • Aligned to JNTUH R22 Syllabus by Prof. Rao".
- Main Content Box: Embedded PDF/Video document container with a clean Deep Olive border (15% opacity). Displays lecture notes with clear diagrams and formulas.
- Viewer Controls: Page counter "Page 1 of 16", Zoom controls, and a Deep Olive pill button "Download Offline PDF".
- Bottom Card: "Next Topic in this Unit: Page Replacement Algorithms →".
```

---

### Page 09: Exam Mode Countdown & Crunch Path (`/exam`)
* **Role & Purpose:** Student. Urgent countdown planner showing only high-yield topics.
* **Key Content:** Big countdown timer ("3 Days : 14 Hours"), revision time budget pills (6h, 12h, 24h, 48h), vertical prioritized timeline of high-frequency exam questions, and score boost indicator.

```text
Generate an "Exam Mode" revision page for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Top Hero Widget:
  - Large serif countdown clock: "3 Days : 14 Hours Remaining" inside a Sage Green circular progress ring.
  - Exam Title: "Operating Systems (CS501PC) Final Exam".
  - Budget Selector: 4 pill buttons ["6 Hours", "12 Hours", "24 Hours", "Full Review"].
- Prioritized Timeline (Vertical numbered list):
  - Step 1: "Banker's Algorithm & Deadlock Avoidance" (15 min summary • High Frequency Exam Question) with a "Review Now" button.
  - Step 2: "Page Replacement Algorithms Solved Numericals" (20 min video).
  - Step 3: "Disk Scheduling Formula Cheatsheet" (1-page downloadable PDF).
- Sticky bottom pill: "3 of 5 high-yield topics completed • Estimated Score Boost +20%".
```

---

### Page 10: Academic AI Tutor (`/chat`)
* **Role & Purpose:** Signed-in students. Contextual doubt resolution with institutional curriculum grounding.
* **Key Content:** Header with curriculum status badge, 3 starter prompt cards, chat bubble stream with comparative tables and formulas, verified citation pills, bottom input bar.

```text
Generate an Academic AI Tutor chat page for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Header: Academic seal icon, title "Academic AI Tutor", subtitle "Grounded in JNTUH R22 Curriculum Archive", and a "Clear Chat" button.
- Three Starter Prompt Cards: "Explain Core Concepts", "Solve Numerical Problem", "Unit Exam Questions".
- Message Stream:
  - User Bubble (Right-aligned, Soft White card with Deep Olive outline): "Explain Paging vs Segmentation in simple terms."
  - AI Tutor Bubble (Left-aligned, clean white card with Deep Olive text):
    - Heading: "Paging vs Segmentation: Key Architectural Differences".
    - 2-column comparison table.
    - Bulleted step-by-step summary.
    - Citation Pill: "Source: Silberschatz OS Textbook Ch. 8 • Verified ✓" (Sage Green badge).
- Bottom Input Dock: Rounded input box with paperclip icon, placeholder "Ask a syllabus doubt...", and solid Deep Olive send button.
```

---

### Page 11: My Library & Scholar Toolkit (`/me`)
* **Role & Purpose:** Student. Personal repository of bookmarks, study progress, and offline PDFs.
* **Key Content:** User profile banner, 3 tabs (Bookmarks, Curriculum Progress, Offline Storage), list of saved resources, and offline storage quota bar.

```text
Generate a "My Library" personal dashboard for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Profile Header: Avatar icon, student name "Ananya Rao", university badge "JNTUH — CSE 3rd Year".
- Tabs: "Pinned Bookmarks (14)", "Curriculum Progress", "Offline Storage (5 PDFs)".
- Bookmarks View:
  - 3 saved resource cards showing resource type, title, course tag ("CS501PC"), personal study note, and an "Open" button.
- Offline Storage Section:
  - Progress bar: "18.4 MB of 50 MB offline quota used".
  - List of downloaded revision PDFs with green "Ready Offline" badges and remove buttons.
```

---

### Page 12: Contributor Dashboard (`/contribute`)
* **Role & Purpose:** Faculty. Track uploaded resources and moderation status.
* **Key Content:** Portal header, "+ Upload New Resource" button, 4 status metric cards (Drafts, Pending, Live, Needs Revision), and submission management table.

```text
Generate a Faculty Contributor Dashboard for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Header: Title "Faculty Contributor Portal" with a solid Deep Olive button "+ Upload New Resource".
- Top Metrics Row: 4 cards showing "Drafts (2)", "Pending Review (5)", "Live & Verified (38)", and "Needs Revision (1)".
- Filter Bar: Search by title, course dropdown, and status filter pills.
- Data Table:
  - Row 1: "Unit 3 Memory Management Lecture Notes", CS501PC, PDF, Status: Sage Green "Live & Verified", Action: View stats.
  - Row 2: "Process Synchronization Solved Papers", CS501PC, PDF, Status: Amber "Pending Review", Action: Edit.
  - Row 3: "Thread Scheduling Video Lecture", CS501PC, Video, Status: Outline "Changes Requested", Action: View note.
```

---

### Page 13: 4-Step Upload & Syllabus Tagging Wizard (`/contribute/new`)
* **Role & Purpose:** Faculty. Upload files and map them to university, regulation, course, and unit.
* **Key Content:** 4-step progress stepper (File, Details, Syllabus Tagging, Review), file dropzone, unit selector, topic tagging chips, and submit button.

```text
Generate a 4-step Resource Upload Wizard for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Stepper: Horizontal line connecting 4 steps: "1. File Upload" (Done ✓), "2. Details" (Done ✓), "3. Syllabus Tagging" (Active), "4. Submit".
- Step 3 Form:
  - Dropdown: "Target Institution" (e.g. JNTU Hyderabad).
  - Selector: "Syllabus Regulation" (R22, R20, CBCS).
  - Dropdown: "Course" (CS501PC Operating Systems).
  - Radio pills: "Unit" (Unit 1, Unit 2, Unit 3, Unit 4, Unit 5).
  - Multi-select topic tagger with clickable suggestion pills ("#Paging", "#VirtualMemory", "#Thrashing").
  - Radio selector: "Estimated Exam Relevance" (High, Medium, Low).
- Actions: Outline button "← Back" and Deep Olive button "Proceed to Final Review →".
```

---

### Page 14: Admin Moderation & Review Queue (`/admin/review`)
* **Role & Purpose:** Admin / Faculty Reviewer. Review submissions, verify syllabus accuracy, approve or reject.
* **Key Content:** Pending queue badge (*"12 Pending Reviews"*), split-screen layout (submission list on left, document preview on right), live syllabus fit score, and Approve/Reject action bar.

```text
Generate an Admin Moderation & Review Queue page for "EduFind AI".
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Top Bar: Title "Institutional Moderation Desk", subtitle "JNTUH Faculty Review Panel", and a badge "12 Pending Reviews".
- Split-Screen Layout:
  - Left Column (35% width): Stack of pending submission cards. Active item highlighted with a Sage Green border. Shows title "Unit 3 Virtual Memory Cheatsheet", author "Dr. A. Rao", course "CS501PC", and "Submitted 2h ago".
  - Right Column (65% width): Review Workbench:
    - Top header: Resource title, course code, and regulation badge ("R22").
    - Preview Box: Clean document iframe showing page 1 of the uploaded lecture note.
    - Automated audit strip: Green badge "Curriculum Fit: 96% • Anti-404 Verified".
    - Decision Bar:
      1. Solid Deep Olive pill button "✓ Approve & Publish as Verified"
      2. Outline button "Request Changes"
      3. Subtle red outline button "✗ Reject"
    - Mandatory feedback comment box for requested changes.
```

---

## Codebase Reference Table

| Page # | Route | Corresponding Codebase File |
|---|---|---|
| **01** | `/` | [`src/app/page.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/app/page.tsx) |
| **02** | `/login` | [`src/app/login/page.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/app/login/page.tsx) |
| **03** | `/home` | `src/app/home/page.tsx` (or [`StudentToolkit.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/components/discovery/StudentToolkit.tsx)) |
| **04** | `/discover` | [`src/app/discover/page.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/app/discover/page.tsx) |
| **05** | `/search` | [`src/components/discovery/SearchInterface.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/components/discovery/SearchInterface.tsx) |
| **06** | `/library` | [`src/components/discovery/StructuredBrowser.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/components/discovery/StructuredBrowser.tsx) |
| **07** | `/courses/:id` | [`src/components/discovery/SinglePageUnitOrganizer.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/components/discovery/SinglePageUnitOrganizer.tsx) |
| **08** | `/resources/:id` | [`src/components/discovery/ResourceCard.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/components/discovery/ResourceCard.tsx) |
| **09** | `/exam` | [`src/components/discovery/ExamModeCountdown.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/components/discovery/ExamModeCountdown.tsx) |
| **10** | `/chat` | [`src/app/chat/page.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/app/chat/page.tsx) |
| **11** | `/me` | `src/app/me/page.tsx` (or [`StudentToolkit.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/components/discovery/StudentToolkit.tsx)) |
| **12** | `/contribute` | [`src/app/contribute/page.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/app/contribute/page.tsx) |
| **13** | `/contribute/new`| [`src/app/contribute/page.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/app/contribute/page.tsx) |
| **14** | `/admin/review` | [`src/app/admin/dashboard/page.tsx`](file:///c:/Users/rohit/Engineering/Projects/GDGV/src/app/admin/dashboard/page.tsx) |
