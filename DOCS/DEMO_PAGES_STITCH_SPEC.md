# EduFind AI — Simplified Demo Pages & Stitch Brief

> **Style System:** Minimal Academic  
> **Three Primary Colours:** **Soft White** • **Sage Green** • **Deep Olive**  
> **Purpose:** Lightweight, uncluttered page prompts ready to paste directly into Stitch.

---

## 1. Minimal 3-Colour Palette & Tokens

| Color Name | Hex Code | Tailwind Equivalent | Purpose / Application |
|---|---|---|---|
| **Soft White** | `#FDFBF7` | `bg-[#FDFBF7]` | Canvas background, card containers, input backgrounds, modal surfaces |
| **Sage Green** | `#8A9D6A` | `text-[#8A9D6A]`, `bg-[#8A9D6A]/15` | Subtle accents, tags, status badges, progress bars, active tabs, hover rings |
| **Deep Olive** | `#2D3822` | `text-[#2D3822]`, `bg-[#2D3822]` | Primary text, titles, primary buttons, borders, high-contrast badges |

### Supporting Contrasts (Zero Clutter)
- **Border Lines:** `#2D3822` with 15% opacity (`border-[#2D3822]/15`)
- **Card Surface:** `#FFFFFF` or `#F7F5F0` with subtle border
- **Button Text:** `#FDFBF7` (Soft White) on `#2D3822` (Deep Olive) fill (Contrast > 11:1, AAA compliant)
- **Typography:**
  - Headlines: `Source Serif 4` (or classical Serif)
  - Interface & Body: Clean modern serif / sans (`Merriweather` or `Inter`)
  - Course Codes & Tags: `JetBrains Mono`

---

## 2. Core Demo Page Inventory (5 Essential Screens)

| # | Demo Page | Route | What It Shows in the Demo |
|---|---|---|---|
| **1** | **Landing Page** | `/` | Hero title, quick search input, 3 institutional metrics, and "Start Discovering" CTA. |
| **2** | **AI Discovery Hub** | `/discover` | Smart query box, 4 analysis tags, 6 verified resource cards with anchor highlight, and coverage report. |
| **3** | **Course Syllabus Page** | `/courses/:id` | Unit 1–5 accordions, topic completion checklist, video lectures, and PDF downloads. |
| **4** | **Exam Mode (Crunch)** | `/exam` | Big countdown clock ("3 Days Left"), urgency filter, and prioritized revision timeline. |
| **5** | **AI Academic Tutor** | `/chat` | Contextual Q&A chat interface with step-by-step reasoning and verified syllabus source citations. |

---

## 3. Stitch Ready Prompts (Copy & Paste)

### Global Prompt (Paste in Stitch First)
```text
Design system settings for EduFind AI:
- Three Primary Colours: Soft White (#FDFBF7), Sage Green (#8A9D6A), and Deep Olive (#2D3822).
- Canvas background: Soft White (#FDFBF7).
- Card containers: Clean white (#FFFFFF) with a delicate deep olive border (#2D3822 at 15% opacity).
- Primary buttons: Solid Deep Olive (#2D3822) with Soft White (#FDFBF7) text.
- Badges & Accents: Sage Green (#8A9D6A) with subtle tinted background (#8A9D6A at 15% opacity).
- Headings: Elegant Serif (Source Serif 4). Body: Highly readable serif/sans. Code/Tags: Monospace.
- Corners: 8px border-radius on cards, pill-shaped buttons.
- Clean, minimal, academic aesthetic without visual clutter.
```

---

### Demo Page 1: Landing Page (`/`)
```text
Generate a clean, minimal academic landing page for "EduFind AI".
- Colours: Background Soft White (#FDFBF7), text Deep Olive (#2D3822), accents Sage Green (#8A9D6A).
- Top Navbar: Logo mark (graduation cap), "EduFind AI" in serif, links for "Library" and "AI Tutor", and a pill button "Get Started" in Deep Olive.
- Hero Section:
  - Small pill tag in Sage Green: "VERIFIED INSTITUTIONAL REPOSITORY".
  - Serif headline: "Academic Discovery, Simplified."
  - Subtitle: "Find lecture notes, videos, and past question papers mapped precisely to your university syllabus."
  - Primary search input: Large rounded bar with placeholder "Search course code (e.g. CS501PC) or topic...", and a Deep Olive "Discover" button.
- Three Stat Cards:
  1. "500+ Verified Courses" (with subtle book icon)
  2. "Zero Broken Links" (100% stable academic URLs)
  3. "Exam Mode Countdown" (urgent 48-hour revision paths)
- Mobile-first, responsive, clean spacing, no unnecessary gradients.
```

---

### Demo Page 2: AI Discovery Hub (`/discover`)
```text
Generate the AI Discovery Console for EduFind AI using Soft White, Sage Green, and Deep Olive.
- Top bar: Search bar with the active query: "CS501PC Operating Systems - Unit 2 Memory Management".
- Detection Strip: 4 pill badges in Sage Green:
  [JNTUH / MIT OCW]  [Computer Science]  [Semester 5]  [R22 Regulation]
- Curated Resource Grid (6 Cards, 2 columns on tablet, 1 on mobile):
  - Card 1 (Anchor Resource with Sage Green border):
    - Title: "Complete Guide to Virtual Memory & Paging" (Serif)
    - Source: "NPTEL / IIT Madras" (Monospace)
    - Badges: "Verified ✓" (Sage Green pill), "High Exam Yield", "45 min"
    - Action: Deep Olive button "Open Resource"
  - Card 2: "Process Scheduling Algorithms Explained" (YouTube Lecture, 25 min)
  - Card 3: "Page Replacement (FIFO, LRU) Solved Numericals" (PDF Notes)
  - Cards 4-6: Complementary past papers and cheatsheets.
- Bottom Panel: "Curriculum Coverage Report" showing 4 covered topics with checkmarks and 1 missing topic alert in a subtle outline pill.
```

---

### Demo Page 3: Course Syllabus Page (`/courses/:id`)
```text
Generate a Course Syllabus & Unit Hub page for EduFind AI.
- Colours: Soft White background (#FDFBF7), Deep Olive typography (#2D3822), Sage Green highlights (#8A9D6A).
- Header:
  - Monospace code: "CS501PC • R22 REGULATION"
  - Large Serif Title: "Operating Systems"
  - Action button: Deep Olive pill with flame icon "Start Exam Revision"
  - Syllabus completion bar: 65% completed in Sage Green.
- Unit Accordion (Units 1 to 5):
  - Unit 1: "System Architectures & Kernel Basics" (Expanded)
    - Topic checklist:
      [✓] Process Control Blocks & Lifecycle (1 Video, 1 Note)
      [✓] CPU Scheduling Algorithms (2 Videos, 1 Solved PDF)
      [ ] Inter-Process Communication & Pipes (1 Note)
    - Under each topic: compact cards with "View" and "Download PDF" links.
  - Unit 2: "Memory Management & Paging" (Collapsed)
  - Unit 3: "Storage & File Systems" (Collapsed)
- Clean, tactile, easy to scan.
```

---

### Demo Page 4: Exam Crunch Mode (`/exam`)
```text
Generate a focused "Exam Mode" revision page for EduFind AI.
- Palette: Soft White (#FDFBF7), Deep Olive (#2D3822), Sage Green (#8A9D6A).
- Top Hero Widget:
  - Countdown timer: "3 Days : 14 Hours Remaining" in large bold serif.
  - Exam Title: "Operating Systems (CS501PC) Final Examination".
  - Time Budget Selector: 4 pill buttons ["6 Hours", "12 Hours", "24 Hours", "Full Review"].
- Prioritized Timeline (Vertical numbered list):
  - Step 1: "Banker's Algorithm & Deadlock Avoidance" (15 min summary • High Frequency Exam Question) with a "Review Now" button.
  - Step 2: "Page Replacement Algorithms (FIFO vs LRU) Solved Numericals" (20 min video).
  - Step 3: "Disk Scheduling Formula Cheatsheet" (1-page downloadable PDF).
- Sticky bottom pill: "3 of 5 high-yield topics completed • Estimated Score Boost +20%".
```

---

### Demo Page 5: AI Academic Tutor (`/chat`)
```text
Generate an Academic AI Tutor chat page for EduFind AI using Soft White (#FDFBF7), Sage Green (#8A9D6A), and Deep Olive (#2D3822).
- Header: Academic seal icon, title "Academic AI Tutor", subtitle "Grounded in JNTUH R22 Curriculum Archive".
- Chat Message Stream:
  - User Question (Right aligned bubble in Soft White with Deep Olive border):
    "Can you explain the difference between Paging and Segmentation in simple terms?"
  - AI Tutor Response (Left aligned clean card in white with Deep Olive text):
    - Heading in serif: "Paging vs Segmentation: Key Architectural Differences"
    - Clear 2-column comparative table.
    - Bulleted memory management rules.
    - Footer Citation Pill: "Source: Silberschatz OS Textbook Ch. 8 • Verified ✓" (Sage Green badge).
- Bottom Input Dock:
  - Rounded input box with placeholder "Ask a syllabus question or paste a problem..."
  - Solid Deep Olive send button with white arrow.
```
