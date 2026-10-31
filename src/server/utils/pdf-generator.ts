export interface AcademicUnit {
  unit: string;
  title: string;
  topics: string;
  coreConcepts?: string[];
}

export interface AcademicPdfData {
  institution: string;
  branch: string;
  courseCode: string;
  courseName: string;
  title: string;
  description?: string;
  documentType?: 'Comprehensive Syllabus Lecture Notes' | 'Semester Exam Question Bank & Worked Solutions' | 'Laboratory Manual & Practical Guide' | 'Revision Handbook';
  units?: AcademicUnit[];
  examQuestions?: string[];
  labExperiments?: string[];
  references?: string[];
}

function sanitizeText(str: string): string {
  return str.replace(/[()\\\\]/g, '').replace(/[\r\n]+/g, ' ').trim();
}

export function buildAcademicPdf(data: AcademicPdfData): Buffer {
  const {
    institution,
    branch,
    courseCode,
    courseName,
    title,
    description = 'Full comprehensive syllabus coverage and high-yield examination notes.',
    documentType = 'Comprehensive Syllabus Lecture Notes',
    units = [],
    examQuestions = [
      '1. State fundamental architectural axioms and design constraints with illustrative schematic diagrams.',
      '2. Analyze time-complexity and hardware resource trade-offs under standard benchmark workloads.',
      '3. Formulate the primary governing equations and verify boundary condition numerical stability.',
      '4. Discuss industry deployment case studies and contemporary operational protocols.',
      '5. Compare competing algorithmic solutions and prove asymptotic upper and lower bounds.',
    ],
    labExperiments = [
      'Experiment 1: Environment Setup, Toolchain Verification, and Baseline Implementation',
      'Experiment 2: Parameter Variation, Stress Testing, and Performance Metric Capture',
      'Experiment 3: Fault Injection, Boundary Case Handling, and Exception Logging',
      'Experiment 4: Comparative Benchmarking and Optimization Profiling',
    ],
    references = [
      'Prescribed Core University Textbook (Standard International Edition)',
      'National Programme on Technology Enhanced Learning (NPTEL / AICTE Archive)',
      'IEEE / ACM Computing & Engineering Open Curriculum Guidelines',
    ],
  } = data;

  const defaultUnits: AcademicUnit[] = units.length > 0 ? units : [
    { unit: 'Unit 1', title: 'Theoretical Foundations & Fundamental Models', topics: 'Fundamental concepts, classifications, mathematical abstractions, and system architecture specifications', coreConcepts: ['Formal definitions and historical evolution', 'Key performance indicators and constraints', 'Primitive operations and baseline configurations'] },
    { unit: 'Unit 2', title: 'Core Mechanisms & Algorithmic Analysis', topics: 'Mathematical modeling, state transitions, circuit and algorithmic implementations', coreConcepts: ['Analytical formulations and state diagrams', 'Iterative computation and recursive convergence', 'Resource allocation and scheduling policies'] },
    { unit: 'Unit 3', title: 'Advanced Protocols & Performance Tuning', topics: 'Throughput optimization, caching strategies, latency reduction, and concurrency control', coreConcepts: ['Asynchronous processing and synchronization primitives', 'Scalability bottlenecks and mitigation patterns', 'Memory hierarchies and bandwidth management'] },
    { unit: 'Unit 4', title: 'Verification, Testing & Fault Tolerance', topics: 'Validation criteria, edge condition verification, automated test suites, and failover mechanics', coreConcepts: ['Integrity constraints and validation suites', 'Graceful degradation under resource exhaustion', 'Automated regression and stress profiles'] },
    { unit: 'Unit 5', title: 'Industry Applications & Emerging Paradigms', topics: 'Contemporary frameworks, cloud integration, security posture, and production best practices', coreConcepts: ['Microservice deployment architectures', 'Defense-in-depth security hardening', 'Future research trends and standardization'] },
  ];

  // ==========================================
  // PAGE 1: Course Overview, Unit 1 & Unit 2
  // ==========================================
  const page1Lines: string[] = [
    'BT',
    // Institution Header
    '/F1 15 Tf',
    '45 785 Td',
    '(' + sanitizeText(institution) + ') Tj',
    '/F2 10.5 Tf',
    '0 -18 Td',
    '(' + sanitizeText(branch + ' | Course Code: ' + courseCode) + ') Tj',
    '/F1 13 Tf',
    '0 -22 Td',
    '(' + sanitizeText(courseName + ' - ' + documentType).slice(0, 72) + ') Tj',
    '0 -8 Td',
    'ET',
    // Horizontal Rule
    '0.7 0.7 0.7 RG',
    '1.5 w',
    '45 730 m 550 730 l S',
    'BT',
    '/F2 9.5 Tf',
    '45 712 Td',
    '(' + sanitizeText('Syllabus Focus: ' + title).slice(0, 90) + ') Tj',
    '0 -15 Td',
    '(' + sanitizeText('Summary: ' + description).slice(0, 95) + ') Tj',
    '0 -22 Td',
    '/F1 11 Tf',
    '(I. UNIT-BY-UNIT COMPREHENSIVE SYLLABUS CONTENT) Tj',
    '0 -16 Td',
  ];

  // Render Unit 1 & Unit 2 on Page 1
  for (let idx = 0; idx < Math.min(2, defaultUnits.length); idx++) {
    const u = defaultUnits[idx];
    page1Lines.push('/F1 9.5 Tf');
    page1Lines.push('(' + sanitizeText(`${u.unit}: ${u.title}`) + ') Tj');
    page1Lines.push('0 -13 Td');
    page1Lines.push('/F2 8.5 Tf');
    page1Lines.push('(' + sanitizeText('• Syllabus Scope: ' + u.topics).slice(0, 105) + ') Tj');
    page1Lines.push('0 -12 Td');

    if (u.coreConcepts) {
      for (const concept of u.coreConcepts) {
        page1Lines.push('(' + sanitizeText('  - ' + concept).slice(0, 100) + ') Tj');
        page1Lines.push('0 -11 Td');
      }
    }
    page1Lines.push('0 -6 Td');
  }

  page1Lines.push('0 -12 Td');
  page1Lines.push('/F3 8 Tf');
  page1Lines.push('(NoteVault Institutional Study Repository - Page 1 of 2 - Continuous Course Guide) Tj');
  page1Lines.push('ET');

  // =========================================================================
  // PAGE 2: Unit 3, 4, 5 + High-Yield Exam Questions + Reference Textbooks
  // =========================================================================
  const page2Lines: string[] = [
    'BT',
    '/F1 13 Tf',
    '45 785 Td',
    '(' + sanitizeText(`${courseCode}: ${courseName} - Advanced Topics & Assessment`) + ') Tj',
    '/F2 9.5 Tf',
    '0 -16 Td',
    '(' + sanitizeText(`Academic Track: ${branch} - Units 3, 4, 5 & Examination Matrix`) + ') Tj',
    '0 -8 Td',
    'ET',
    // Rule
    '0.7 0.7 0.7 RG',
    '1.5 w',
    '45 755 m 550 755 l S',
    'BT',
    '45 738 Td',
    '/F1 10.5 Tf',
    '(II. ADVANCED SYLLABUS UNITS (UNITS 3 TO 5)) Tj',
    '0 -14 Td',
  ];

  // Render Units 3, 4, 5 on Page 2
  for (let idx = 2; idx < defaultUnits.length; idx++) {
    const u = defaultUnits[idx];
    page2Lines.push('/F1 9 Tf');
    page2Lines.push('(' + sanitizeText(`${u.unit}: ${u.title}`) + ') Tj');
    page2Lines.push('0 -11 Td');
    page2Lines.push('/F2 8 Tf');
    page2Lines.push('(' + sanitizeText('• ' + u.topics).slice(0, 110) + ') Tj');
    page2Lines.push('0 -12 Td');
  }

  page2Lines.push('0 -6 Td');
  page2Lines.push('/F1 10.5 Tf');
  page2Lines.push('(III. HIGH-YIELD SEMESTER EXAM QUESTION BANK & SOLUTIONS) Tj');
  page2Lines.push('/F2 8 Tf');
  page2Lines.push('0 -13 Td');

  for (const q of examQuestions.slice(0, 4)) {
    page2Lines.push('(' + sanitizeText(q).slice(0, 105) + ') Tj');
    page2Lines.push('0 -11 Td');
  }

  page2Lines.push('0 -6 Td');
  page2Lines.push('/F1 10.5 Tf');
  page2Lines.push('(IV. PRESCRIBED TEXTBOOKS & REPOSITORY CITATIONS) Tj');
  page2Lines.push('/F2 8 Tf');
  page2Lines.push('0 -12 Td');

  for (const ref of references.slice(0, 3)) {
    page2Lines.push('(' + sanitizeText('* ' + ref).slice(0, 105) + ') Tj');
    page2Lines.push('0 -11 Td');
  }

  page2Lines.push('0 -10 Td');
  page2Lines.push('/F3 8 Tf');
  page2Lines.push('(Authorized NoteVault Educational Document • Verified for Registered University Students) Tj');
  page2Lines.push('ET');

  // Multi-Page PDF Assembly
  const pagesData = [page1Lines.join('\n'), page2Lines.join('\n')];
  const count = pagesData.length;

  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];
  const pageKids: string[] = [];

  for (let i = 0; i < count; i++) {
    const pageId = 6 + i * 2;
    const contentId = 7 + i * 2;
    pageObjectIds.push(pageId);
    contentObjectIds.push(contentId);
    pageKids.push(pageId + ' 0 R');
  }

  const objects: string[] = [];
  // 1. Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  // 2. Pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [' + pageKids.join(' ') + '] /Count ' + count + ' >>\nendobj\n');
  // 3. F1 Bold
  objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');
  // 4. F2 Regular
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  // 5. F3 Oblique
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n');

  // Build Pages and Contents
  for (let i = 0; i < count; i++) {
    const pageId = pageObjectIds[i];
    const contentId = contentObjectIds[i];
    const contentStream = pagesData[i];
    const streamLen = Buffer.byteLength(contentStream, 'utf-8');

    // Page Object
    objects.push(pageId + ' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ' + contentId + ' 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> >>\nendobj\n');
    // Content Object
    objects.push(contentId + ' 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + contentStream + '\nendstream\nendobj\n');
  }

  let body = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(body, 'utf-8'));
    body += objects[i];
  }

  const startxref = Buffer.byteLength(body, 'utf-8');
  let xref = 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  body += xref + 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';
  return Buffer.from(body, 'binary');
}
