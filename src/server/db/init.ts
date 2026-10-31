import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { hashPassword } from '../security/auth';
import { buildAcademicPdf, AcademicUnit } from '../utils/pdf-generator';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'app.db');
const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

export function initializeDatabase(db?: DatabaseSync): {
  institutionsCount: number;
  branchesCount: number;
  coursesCount: number;
  resourcesCount: number;
  usersCount: number;
} {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const database = db || new DatabaseSync(DB_PATH);
  database.exec('PRAGMA busy_timeout = 5000;');
  database.exec('PRAGMA foreign_keys = OFF;');
  database.exec('PRAGMA journal_mode = WAL;');

  // 1. Create Schema
  database.exec(`
    CREATE TABLE IF NOT EXISTS institutions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
      course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('file', 'link')),
      description TEXT,
      url TEXT NOT NULL,
      file_path TEXT,
      file_size TEXT,
      file_name TEXT,
      file_data BLOB,
      uploader_id TEXT NOT NULL,
      uploader_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL CHECK(provider IN ('gemini', 'openai', 'anthropic')),
      encrypted_key TEXT NOT NULL,
      iv TEXT NOT NULL,
      auth_tag TEXT NOT NULL,
      key_hint TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_branches_inst ON branches(institution_id);
    CREATE INDEX IF NOT EXISTS idx_courses_inst_branch ON courses(institution_id, branch_id);
    CREATE INDEX IF NOT EXISTS idx_resources_inst_branch_course ON resources(institution_id, branch_id, course_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_nocase ON users(email COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_users_inst ON users(institution_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user ON user_api_keys(user_id);
  `);

  // Ensure file_data BLOB exists
  try {
    database.exec('ALTER TABLE resources ADD COLUMN file_data BLOB;');
  } catch {
    // Column already exists
  }

  const now = new Date().toISOString();

  // 2. Insert Institutions Across India (Safe seed: only insert missing)
  const insertInst = database.prepare(`
    INSERT OR IGNORE INTO institutions (id, name, short_name, code, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const indianInstitutions = [
    ['inst-au', 'Andhra University', 'AU', 'AU'],
    ['inst-gvpce', 'Gayatri Vidya Parishad College of Engineering (Autonomous)', 'GVPCE', 'GVPCE'],
    ['inst-gitam', 'GITAM Deemed to be University', 'GITAM', 'GITAM'],
    ['inst-iitb', 'Indian Institute of Technology Bombay', 'IITB', 'IITB'],
    ['inst-iitd', 'Indian Institute of Technology Delhi', 'IITD', 'IITD'],
    ['inst-iitm', 'Indian Institute of Technology Madras', 'IITM', 'IITM'],
    ['inst-iitkgp', 'Indian Institute of Technology Kharagpur', 'IITKGP', 'IITKGP'],
    ['inst-iitk', 'Indian Institute of Technology Kanpur', 'IITK', 'IITK'],
    ['inst-iitr', 'Indian Institute of Technology Roorkee', 'IITR', 'IITR'],
    ['inst-iitg', 'Indian Institute of Technology Guwahati', 'IITG', 'IITG'],
    ['inst-iith', 'Indian Institute of Technology Hyderabad', 'IITH', 'IITH'],
    ['inst-nitt', 'National Institute of Technology Tiruchirappalli', 'NITT', 'NITT'],
    ['inst-nitk', 'National Institute of Technology Karnataka (Surathkal)', 'NITK', 'NITK'],
    ['inst-nitw', 'National Institute of Technology Warangal', 'NITW', 'NITW'],
    ['inst-nitr', 'National Institute of Technology Rourkela', 'NITR', 'NITR'],
    ['inst-nitc', 'National Institute of Technology Calicut', 'NITC', 'NITC'],
    ['inst-bits', 'Birla Institute of Technology and Science, Pilani', 'BITS', 'BITS-PILANI'],
    ['inst-jntuk', 'JNTU Kakinada', 'JNTUK', 'JNTUK'],
    ['inst-jntuh', 'JNTU Hyderabad', 'JNTUH', 'JNTUH'],
    ['inst-ou', 'Osmania University College of Engineering', 'OUCE', 'OUCE'],
    ['inst-anna', 'Anna University (College of Engineering Guindy)', 'CEG', 'ANNA-CEG'],
    ['inst-dtu', 'Delhi Technological University', 'DTU', 'DTU'],
    ['inst-nsut', 'Netaji Subhas University of Technology', 'NSUT', 'NSUT'],
    ['inst-mu', 'University of Mumbai', 'MU', 'UOM'],
    ['inst-sppu', 'Savitribai Phule Pune University', 'SPPU', 'SPPU'],
    ['inst-vtu', 'Visvesvaraya Technological University', 'VTU', 'VTU'],
    ['inst-vit', 'Vellore Institute of Technology', 'VIT', 'VIT'],
    ['inst-srm', 'SRM Institute of Science and Technology', 'SRM', 'SRM-IST'],
    ['inst-manipal', 'Manipal Academy of Higher Education', 'MAHE', 'MANIPAL'],
    ['inst-amrita', 'Amrita Vishwa Vidyapeetham', 'AMRITA', 'AMRITA'],
    ['inst-thapar', 'Thapar Institute of Engineering and Technology', 'TIET', 'THAPAR'],
    ['inst-coep', 'College of Engineering Pune', 'COEP', 'COEP'],
    ['inst-ju', 'Jadavpur University Faculty of Engineering', 'JU', 'JADAVPUR'],
    ['inst-rvce', 'RV College of Engineering', 'RVCE', 'RVCE'],
    ['inst-bmsce', 'BMS College of Engineering', 'BMSCE', 'BMSCE'],
    ['inst-msrit', 'M. S. Ramaiah Institute of Technology', 'MSRIT', 'MSRIT'],
    ['inst-cbit', 'Chaitanya Bharathi Institute of Technology', 'CBIT', 'CBIT'],
    ['inst-vce', 'Vasavi College of Engineering', 'VCE', 'VASAVI'],
    ['inst-vnrvjiet', 'VNR Vignana Jyothi Institute of Engineering', 'VNRVJIET', 'VNRVJIET'],
  ];

  for (const [id, name, shortName, code] of indianInstitutions) {
    insertInst.run(id, name, shortName, code, now);
  }

  // 3. Statements for Branches, Courses, and Resources (Safe seed)
  const insertBranch = database.prepare(`
    INSERT OR IGNORE INTO branches (id, institution_id, name, code, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertCourse = database.prepare(`
    INSERT OR IGNORE INTO courses (id, institution_id, branch_id, name, code, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertResource = database.prepare(`
    INSERT OR IGNORE INTO resources (
      id, institution_id, branch_id, course_id, title, type, description, url,
      file_path, file_size, file_name, file_data, uploader_id, uploader_name, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Helper function to seed a course with multiple bulk PDF documents
  function seedBulkCoursePdfs(config: {
    instId: string;
    instName: string;
    branchId: string;
    branchName: string;
    branchCode: string;
    courseId: string;
    courseCode: string;
    courseName: string;
    courseDesc: string;
    uploaderId: string;
    uploaderName: string;
    units: AcademicUnit[];
    examQuestions: string[];
    labExperiments: string[];
    bookRefs: string[];
  }) {
    // Branch & Course
    insertBranch.run(config.branchId, config.instId, config.branchName, config.branchCode, now);
    insertCourse.run(config.courseId, config.instId, config.branchId, config.courseName, config.courseCode, config.courseDesc, now);

    // Document 1: Full Comprehensive Syllabus Lecture Notes (Units 1-5)
    const notesPdfBuffer = buildAcademicPdf({
      institution: config.instName,
      branch: config.branchName,
      courseCode: config.courseCode,
      courseName: config.courseName,
      title: `${config.courseCode} Full Syllabus Comprehensive Lecture Notes (Units 1-5)`,
      description: `Complete syllabus lecture notes covering ${config.courseName}. Includes detailed unit-by-unit theoretical derivations, system models, architectural diagrams, and key definitions.`,
      documentType: 'Comprehensive Syllabus Lecture Notes',
      units: config.units,
      examQuestions: config.examQuestions,
      references: config.bookRefs,
    });

    const notesFileName = `${config.courseCode}_Full_Syllabus_Notes.pdf`;
    const notesDiskPath = path.join(UPLOADS_DIR, notesFileName);
    fs.writeFileSync(notesDiskPath, notesPdfBuffer);

    insertResource.run(
      `res-${config.courseId}-notes`,
      config.instId,
      config.branchId,
      config.courseId,
      `${config.courseCode} Complete Syllabus Lecture Notes (Units 1-5)`,
      'file',
      `Complete unit-by-unit syllabus notes covering ${config.courseName} with core concepts, architectural models, and equations.`,
      `/uploads/${notesFileName}`,
      `public/uploads/${notesFileName}`,
      '4.8 MB',
      notesFileName,
      notesPdfBuffer,
      config.uploaderId,
      config.uploaderName,
      now,
      now
    );

    // Document 2: Semester Exam Question Bank & Model Solutions
    const qbPdfBuffer = buildAcademicPdf({
      institution: config.instName,
      branch: config.branchName,
      courseCode: config.courseCode,
      courseName: config.courseName,
      title: `${config.courseCode} High-Yield Semester Exam Question Bank & Model Solutions`,
      description: `Comprehensive question bank with previous semester university examination questions, marks distributions, and step-by-step model solutions.`,
      documentType: 'Semester Exam Question Bank & Worked Solutions',
      units: config.units,
      examQuestions: config.examQuestions,
      references: config.bookRefs,
    });

    const qbFileName = `${config.courseCode}_Exam_Question_Bank.pdf`;
    const qbDiskPath = path.join(UPLOADS_DIR, qbFileName);
    fs.writeFileSync(qbDiskPath, qbPdfBuffer);

    insertResource.run(
      `res-${config.courseId}-qb`,
      config.instId,
      config.branchId,
      config.courseId,
      `${config.courseCode} Semester Question Bank & Worked Solutions`,
      'file',
      `Previous university exam question papers, high-yield repeated questions, analytical formulations, and step-by-step solutions.`,
      `/uploads/${qbFileName}`,
      `public/uploads/${qbFileName}`,
      '3.5 MB',
      qbFileName,
      qbPdfBuffer,
      config.uploaderId,
      config.uploaderName,
      now,
      now
    );

    // Document 3: Laboratory Manual & Practical Implementation Guide
    const labPdfBuffer = buildAcademicPdf({
      institution: config.instName,
      branch: config.branchName,
      courseCode: config.courseCode,
      courseName: config.courseName,
      title: `${config.courseCode} Laboratory Practical Manual & Viva Voce Handbook`,
      description: `Structured laboratory workbook detailing experiment objectives, baseline toolchains, execution protocols, test data, and viva questions.`,
      documentType: 'Laboratory Manual & Practical Guide',
      units: config.units,
      examQuestions: config.labExperiments,
      references: config.bookRefs,
    });

    const labFileName = `${config.courseCode}_Lab_Manual.pdf`;
    const labDiskPath = path.join(UPLOADS_DIR, labFileName);
    fs.writeFileSync(labDiskPath, labPdfBuffer);

    insertResource.run(
      `res-${config.courseId}-lab`,
      config.instId,
      config.branchId,
      config.courseId,
      `${config.courseCode} Laboratory Manual & Practical Viva Guide`,
      'file',
      `Complete laboratory experiments, tool setup, algorithm execution steps, verification test cases, and oral examination viva guide.`,
      `/uploads/${labFileName}`,
      `public/uploads/${labFileName}`,
      '2.9 MB',
      labFileName,
      labPdfBuffer,
      config.uploaderId,
      config.uploaderName,
      now,
      now
    );
  }

  // =========================================================================
  // 1. ANDHRA UNIVERSITY (AU) - BULK FULL SYLLABUS NOTES PDFS
  // =========================================================================

  // AU - CSE: Operating Systems (CS301)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-cse',
    branchName: 'Computer Science and Engineering',
    branchCode: 'CSE',
    courseId: 'course-au-os',
    courseCode: 'CS301',
    courseName: 'Operating Systems',
    courseDesc: 'Kernel architectures, CPU scheduling, synchronization, virtual memory paging, and file systems.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Process Management & CPU Scheduling', topics: 'Process states, Process Control Block (PCB), Context switching overhead, Scheduling algorithms: FCFS, SJF, Priority, Round Robin, Multilevel feedback queues' },
      { unit: 'Unit 2', title: 'Inter-Process Communication & Synchronization', topics: 'Critical section problem, Peterson solution, Hardware test-and-set, Counting and binary semaphores, Classic IPC (Producer-Consumer, Dining Philosophers)' },
      { unit: 'Unit 3', title: 'Deadlocks & Mitigation Strategies', topics: 'Deadlock conditions, Resource allocation graphs, Bankers algorithm for safety and avoidance, Detection algorithms, and recovery strategies' },
      { unit: 'Unit 4', title: 'Memory Management & Demand Paging', topics: 'Logical vs physical address space, Contiguous allocation, Paging, Inverted page tables, Segmentation, Demand paging, Page replacement (FIFO, LRU, Optimal)' },
      { unit: 'Unit 5', title: 'File Systems & Storage Subsystems', topics: 'File concepts, Directory structures, Inode allocation methods (contiguous, linked, indexed), Free-space management, Disk scheduling (SSTF, SCAN, C-SCAN)' },
    ],
    examQuestions: [
      '1. Derive the average turnaround time and waiting time for SJF and Round Robin CPU scheduling on a specified 5-process workload.',
      '2. Prove the correctness of Peterson solution for two-process mutual exclusion and verify all three synchronization criteria.',
      '3. Execute the Bankers Algorithm safety routine on a multi-resource allocation matrix and determine whether safe sequence exists.',
      '4. Explain demand paging, page fault service routine, and calculate Effective Access Time (EAT) under varying fault rates.',
    ],
    labExperiments: [
      'Lab 1: Implementation of Process Creation and IPC via POSIX Pipes and Shared Memory in C',
      'Lab 2: Simulation of CPU Scheduling Algorithms (FCFS, SJF, Priority, and Round Robin)',
      'Lab 3: Thread Synchronization using POSIX Mutexes and Semaphores for Producer-Consumer problem',
      'Lab 4: Simulation of Banker Algorithm for Deadlock Avoidance and Page Replacement (FIFO and LRU)',
    ],
    bookRefs: [
      'Abraham Silberschatz, Peter B. Galvin - Operating System Concepts (Wiley 10th Ed)',
      'Andrew S. Tanenbaum - Modern Operating Systems (Pearson 4th Ed)',
      'William Stallings - Operating Systems: Internals and Design Principles (Pearson)',
    ],
  });

  // AU - CSE: Database Management Systems (CS302)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-cse',
    branchName: 'Computer Science and Engineering',
    branchCode: 'CSE',
    courseId: 'course-au-dbms',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    courseDesc: 'Relational algebra, SQL-99 standards, normalization (1NF-BCNF), transaction ACID, and B+ Tree indexing.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Relational Data Model & Formal Languages', topics: 'Database system architectures, Entity-Relationship (ER) modeling, Relational algebra operators, Tuple and Domain relational calculus' },
      { unit: 'Unit 2', title: 'Relational Query Language (SQL)', topics: 'DDL, DML, DCL commands, Nested subqueries, Correlated subqueries, Aggregate functions, Triggers, Views, and Assertions' },
      { unit: 'Unit 3', title: 'Relational Database Design & Normalization', topics: 'Functional dependencies, Armstrong axioms, Attribute closure, 1NF, 2NF, 3NF, Boyce-Codd Normal Form (BCNF), 4NF, Lossless join decomposition' },
      { unit: 'Unit 4', title: 'Transaction Processing & Concurrency Control', topics: 'ACID properties, Serializability, Conflict vs View serializability, Two-Phase Locking (2PL), Strict 2PL, Timestamp ordering protocols' },
      { unit: 'Unit 5', title: 'Storage, Indexing & Query Processing', topics: 'RAID levels, B-Trees, B+ Trees node splitting and deletion, Static and Dynamic hashing, Cost-based query execution optimization' },
    ],
    examQuestions: [
      '1. Given a relation R(A, B, C, D, E) with functional dependencies, compute candidate keys and decompose R into BCNF.',
      '2. Prove whether a given concurrent transaction schedule is conflict serializable by constructing its precedence graph.',
      '3. Construct a B+ Tree index of order 4 for a sequence of 10 search keys, illustrating all node splitting operations.',
      '4. Explain the Two-Phase Locking (2PL) protocol and prove how it guarantees conflict serializable schedules.',
    ],
    labExperiments: [
      'Lab 1: Database Schema Definition, Table Constraints, and Complex SQL Query Execution in PostgreSQL',
      'Lab 2: Stored Procedures, Functions, Cursors, and Database Event Triggers',
      'Lab 3: Normalization Case Study: Redesigning an Unnormalized Enterprise Schema to BCNF',
      'Lab 4: Transaction Concurrency Testing: Simulating Dirty Reads, Non-Repeatable Reads, and Deadlocks',
    ],
    bookRefs: [
      'Raghu Ramakrishnan, Johannes Gehrke - Database Management Systems (McGraw-Hill 3rd Ed)',
      'Abraham Silberschatz, Henry F. Korth - Database System Concepts (McGraw-Hill 7th Ed)',
    ],
  });

  // AU - ECE: Digital Signal Processing (EC301)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-ece',
    branchName: 'Electronics and Communication Engineering',
    branchCode: 'ECE',
    courseId: 'course-au-dsp',
    courseCode: 'EC301',
    courseName: 'Digital Signal Processing',
    courseDesc: 'Discrete Fourier Transform, Radix-2 FFT algorithms, IIR and FIR digital filter synthesis, and finite word length.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Discrete Fourier Transform & FFT', topics: 'Properties of DFT, Circular convolution, Radix-2 Decimation-In-Time (DIT) and Decimation-In-Frequency (DIF) FFT butterfly algorithms' },
      { unit: 'Unit 2', title: 'Infinite Impulse Response (IIR) Filters', topics: 'Analog filter approximations (Butterworth, Chebyshev), Bilinear transformation method, Impulse invariance method, Frequency warping' },
      { unit: 'Unit 3', title: 'Finite Impulse Response (FIR) Filters', topics: 'Linear phase FIR filter characteristics, Symmetric and antisymmetric impulse response, Windowing techniques (Hamming, Hanning, Blackman)' },
      { unit: 'Unit 4', title: 'Realization of Digital Filters', topics: 'Direct Form I, Direct Form II, Cascade, Parallel, and Lattice ladder realizations for IIR and FIR filter architectures' },
      { unit: 'Unit 5', title: 'Finite Word Length Effects', topics: 'Fixed-point and floating-point representations, ADC quantization noise, Coefficient quantization, Round-off limit cycle oscillations' },
    ],
    examQuestions: [
      '1. Compute the 8-point DFT using Radix-2 DIT-FFT butterfly signal flow graph with twiddle factor computations.',
      '2. Design an analog Butterworth low-pass filter satisfying specified passband ripple and stopband attenuation specifications.',
      '3. Formulate the transfer function of a linear phase FIR high-pass filter using the Hamming window technique.',
    ],
    labExperiments: [
      'Lab 1: Computation of N-Point DFT and IDFT and Verification of Circular Convolution in MATLAB/Python',
      'Lab 2: Implementation of Radix-2 Decimation-in-Time FFT Algorithm',
      'Lab 3: Design and Magnitude Response Verification of IIR Butterworth Low-Pass and High-Pass Filters',
      'Lab 4: Design of Linear Phase FIR Filters using Rectangular and Hamming Windows',
    ],
    bookRefs: [
      'Alan V. Oppenheim, Ronald W. Schafer - Discrete-Time Signal Processing (Pearson 3rd Ed)',
      'John G. Proakis, Dimitris G. Manolakis - Digital Signal Processing (Pearson 4th Ed)',
    ],
  });

  // AU - EEE: Power Systems Engineering (EE301)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-eee',
    branchName: 'Electrical and Electronics Engineering',
    branchCode: 'EEE',
    courseId: 'course-au-ps',
    courseCode: 'EE301',
    courseName: 'Power Systems Engineering',
    courseDesc: 'Transmission line modeling, ABCD constants, symmetrical components, fault analysis, and power flow equations.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Transmission Line Parameters', topics: 'Inductance and capacitance calculation for 1-phase and 3-phase lines, GMD and GMR formulations, Transposition, Skin and Proximity effects' },
      { unit: 'Unit 2', title: 'Performance of Transmission Lines', topics: 'Short, Medium (Nominal T and Pi), and Long lines, ABCD parameter derivation, Surge impedance loading, Ferranti effect, Voltage regulation' },
      { unit: 'Unit 3', title: 'Symmetrical Fault Analysis', topics: 'Transients on transmission lines, Short circuit of synchronous machine, Selection of circuit breakers, Current limiting reactors' },
      { unit: 'Unit 4', title: 'Symmetrical Components & Unsymmetrical Faults', topics: 'Fortescue theorem, Sequence networks (Positive, Negative, Zero), Single Line-to-Ground (LG), Line-to-Line (LL), and Double Line-to-Ground (LLG) faults' },
      { unit: 'Unit 5', title: 'Power Flow Analysis', topics: 'Bus classification (Slack, PQ, PV), Formation of Y-bus matrix, Gauss-Seidel and Newton-Raphson power flow algorithms in polar coordinates' },
    ],
    examQuestions: [
      '1. Derive ABCD parameters for a Nominal-Pi transmission line network and draw receiving end phasor diagrams.',
      '2. Formulate sequence impedance networks for a single line-to-ground (LG) fault and determine fault subtransient current.',
      '3. Formulate the Newton-Raphson power flow algorithm and derive elements of the Jacobian matrix in polar form.',
    ],
    labExperiments: [
      'Lab 1: Determination of ABCD Parameters and Regulation of Medium Transmission Line Model',
      'Lab 2: Measurement of Sequence Impedances of a 3-Phase Salient-Pole Synchronous Machine',
      'Lab 3: Symmetrical and Unsymmetrical Fault Analysis on an AC Network Analyzer',
      'Lab 4: Formation of Bus Admittance Matrix (Y-bus) and Newton-Raphson Load Flow Simulation',
    ],
    bookRefs: [
      'I.J. Nagrath, D.P. Kothari - Modern Power System Analysis (McGraw-Hill 4th Ed)',
      'Hadi Saadat - Power System Analysis (PSA Publishing)',
    ],
  });

  // AU - MECH: Engineering Thermodynamics (ME301)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-mech',
    branchName: 'Mechanical Engineering',
    branchCode: 'MECH',
    courseId: 'course-au-thermo',
    courseCode: 'ME301',
    courseName: 'Engineering Thermodynamics',
    courseDesc: 'First and Second Laws, Carnot cycle, entropy generation, Rankine power cycles, and air standard gas cycles.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Zeroth & First Law of Thermodynamics', topics: 'Thermodynamic systems, Work and heat interactions, First law for closed and steady-flow open systems (SFEE), Enthalpy, P-V diagrams' },
      { unit: 'Unit 2', title: 'Second Law of Thermodynamics & Entropy', topics: 'Kelvin-Planck and Clausius statements, Reversibility, Carnot cycle, Clausius inequality, Principle of increase of entropy, Exergy analysis' },
      { unit: 'Unit 3', title: 'Properties of Pure Substances & Steam', topics: 'P-v-T surfaces, Phase change processes, Mollier diagram, Steam tables, Dryness fraction measurement, Throttling calorimeter' },
      { unit: 'Unit 4', title: 'Vapor Power Cycles (Rankine)', topics: 'Ideal Rankine cycle, Thermal efficiency, Mean temperature of heat addition, Reheat and Regenerative Rankine cycles, Cogeneration' },
      { unit: 'Unit 5', title: 'Gas Power Cycles', topics: 'Air standard cycles: Otto, Diesel, Dual combustion cycles, Brayton cycle for gas turbines, Intercooling, Reheat, and Regeneration in Brayton' },
    ],
    examQuestions: [
      '1. Derive the thermal efficiency of an air-standard Diesel cycle in terms of compression ratio and cut-off ratio.',
      '2. Formulate the steady-flow energy equation (SFEE) and apply it to a steam turbine and converging-diverging nozzle.',
      '3. Analyze an ideal Regenerative Rankine cycle with one open feedwater heater and derive its thermal efficiency expression.',
    ],
    labExperiments: [
      'Lab 1: Determination of Dryness Fraction of Steam using Separating and Throttling Calorimeter',
      'Lab 2: Performance Evaluation and Heat Balance Sheet of a 4-Stroke Single-Cylinder Diesel Engine',
      'Lab 3: Pressure-Volume (P-V) Indicator Diagram Capture and Indicated Power Calculation',
      'Lab 4: Performance Testing of a Multi-Stage Reciprocating Air Compressor with Intercooling',
    ],
    bookRefs: [
      'Yunus A. Cengel, Michael A. Boles - Thermodynamics: An Engineering Approach (McGraw-Hill)',
      'P.K. Nag - Engineering Thermodynamics (Tata McGraw-Hill 6th Ed)',
    ],
  });

  // AU - CIVIL: Structural Analysis (CE301)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-civil',
    branchName: 'Civil Engineering',
    branchCode: 'CIVIL',
    courseId: 'course-au-struct',
    courseCode: 'CE301',
    courseName: 'Structural Analysis',
    courseDesc: 'Energy methods, Castigliano theorems, slope deflection, moment distribution, and influence line diagrams.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Energy Theorems & Deflections', topics: 'Castigliano first and second theorems, Unit load method, Strain energy in bending and torsion, Deflection of trusses and indeterminate beams' },
      { unit: 'Unit 2', title: 'Slope Deflection Method', topics: 'Derivation of slope deflection equations, Analysis of continuous beams with support settlements, Analysis of single-bay rigid portal frames' },
      { unit: 'Unit 3', title: 'Moment Distribution Method', topics: 'Stiffness and carry-over factors, Distribution factors, Analysis of continuous beams and portal frames without sway and with side sway' },
      { unit: 'Unit 4', title: 'Moving Loads & Influence Line Diagrams', topics: 'Influence lines for reaction, shear force, and bending moment in simply supported girders, Muller-Breslau principle for continuous beams' },
      { unit: 'Unit 5', title: 'Arches & Cable Structures', topics: 'Three-hinged and two-hinged circular and parabolic arches, Normal thrust, Radial shear, Bending moment diagrams, Tension in cables' },
    ],
    examQuestions: [
      '1. Analyze a continuous two-span beam with fixed ends subjected to uniformly distributed loads using Moment Distribution.',
      '2. Apply Castigliano second theorem to calculate vertical deflection at the loaded node of an indeterminate pin-jointed truss.',
      '3. Draw the influence line diagram for bending moment at the center of a 20-meter span girder and find maximum live load moment.',
    ],
    labExperiments: [
      'Lab 1: Verification of Maxwell Reciprocal Theorem on a Deflected Cantilever Beam',
      'Lab 2: Experimental Determination of Horizontal Thrust in a Three-Hinged Parabolic Arch',
      'Lab 3: Deflection Measurement of a Pin-Jointed Plane Truss under Concentrated Point Loads',
      'Lab 4: Moment Distribution Analysis on a Two-Span Continuous Steel Beam Test Frame',
    ],
    bookRefs: [
      'C.S. Reddy - Basic Structural Analysis (Tata McGraw-Hill 3rd Ed)',
      'R.C. Hibbeler - Structural Analysis (Pearson 10th Ed)',
    ],
  });

  // AU - IT: Web Technologies (IT301)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-it',
    branchName: 'Information Technology',
    branchCode: 'IT',
    courseId: 'course-au-web',
    courseCode: 'IT301',
    courseName: 'Web Technologies & Architecture',
    courseDesc: 'Full-stack client-server architecture, DOM APIs, asynchronous JavaScript, REST APIs, and application security.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Semantic Web & Modern Responsive CSS', topics: 'HTML5 semantic standards, CSS Flexbox and Grid layouts, Media queries, Web accessibility (WCAG AA), Mobile-first styling' },
      { unit: 'Unit 2', title: 'JavaScript Engine & Asynchronous Architecture', topics: 'ECMAScript 6+ specifications, Closures, Prototypal inheritance, Promises, Async/Await, Event Loop, Microtask execution' },
      { unit: 'Unit 3', title: 'Server Middleware & RESTful API Design', topics: 'HTTP/1.1 vs HTTP/2 protocol, Node.js runtime, Express/Next.js middleware, REST architecture, JSON serialization, Routing' },
      { unit: 'Unit 4', title: 'State Management & Client-Server Auth', topics: 'Cookies, LocalStorage, Session tokens, RFC 7519 JSON Web Tokens (JWT), Password hashing, Role-based access control (RBAC)' },
      { unit: 'Unit 5', title: 'Web Security & Contemporary Architectures', topics: 'XSS, CSRF, SQL Injection, Content Security Policy (CSP), CORS, Service Workers, Progressive Web Apps (PWA)' },
    ],
    examQuestions: [
      '1. Describe the JavaScript Event Loop, Call Stack, Task Queue, and Microtask Queue with a sequential execution diagram.',
      '2. Design a RESTful API specification for an institutional grade recording portal adhering to Richardson Maturity Level 3.',
      '3. Formulate the mechanism of Cross-Site Request Forgery (CSRF) and explain SameSite cookie and anti-CSRF token defenses.',
    ],
    labExperiments: [
      'Lab 1: Building a Responsive Multi-Column Layout using CSS Flexbox and CSS Grid without Frameworks',
      'Lab 2: Dynamic DOM Manipulation and Asynchronous Fetch API Requests with Error Handling',
      'Lab 3: Implementation of a RESTful Backend API with JWT Authentication and Scrypt Password Hashing',
      'Lab 4: Automated Testing of REST API Endpoints using Integration Test Suites',
    ],
    bookRefs: [
      'David Flanagan - JavaScript: The Definitive Guide (O’Reilly 7th Ed)',
      'Jon Duckett - HTML and CSS: Design and Build Websites (Wiley)',
    ],
  });

  // AU - CHEM: Chemical Reaction Engineering (CH301)
  seedBulkCoursePdfs({
    instId: 'inst-au',
    instName: 'Andhra University (College of Engineering)',
    branchId: 'branch-au-chem',
    branchName: 'Chemical Engineering',
    branchCode: 'CHEM',
    courseId: 'course-au-cre',
    courseCode: 'CH301',
    courseName: 'Chemical Reaction Engineering',
    courseDesc: 'Reaction kinetics, design equations for batch, CSTR, and PFR reactors, RTD, and multiple reactor networks.',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
    units: [
      { unit: 'Unit 1', title: 'Kinetics of Homogeneous Reactions', topics: 'Rate of reaction, Temperature dependency, Arrhenius law, Collision theory, Transition state theory, Kinetic parameter estimation' },
      { unit: 'Unit 2', title: 'Ideal Reactor Design Equations', topics: 'Design equations for Batch, Continuous Stirred Tank (CSTR), and Plug Flow Reactors (PFR) under constant and variable volume conditions' },
      { unit: 'Unit 3', title: 'Multiple Reactor Networks & Yield', topics: 'CSTRs in series and parallel, Comparison of reactor volumes for first and second order reactions, Product selectivity in parallel and series' },
      { unit: 'Unit 4', title: 'Non-Isothermal Reactor Design', topics: 'Energy balance for batch, CSTR, and PFR, Adiabatic operations, Equilibrium conversion, Optimum temperature progression' },
      { unit: 'Unit 5', title: 'Non-Ideal Flow & Residence Time Distribution', topics: 'Residence time distribution (RTD), E(t) and F(t) curves, Pulse and step tracer stimulus experiments, Tank-in-series dispersion models' },
    ],
    examQuestions: [
      '1. Derive the performance equation for an isothermal Plug Flow Reactor (PFR) for a second-order liquid phase reaction.',
      '2. Compare the total volume required for two equal CSTRs in series vs a single CSTR for 90% conversion of reactant A.',
      '3. Formulate the E(t) residence time distribution function from experimental step tracer response data.',
    ],
    labExperiments: [
      'Lab 1: Kinetic Study of Saponification of Ethyl Acetate in an Isothermal Batch Reactor',
      'Lab 2: Performance Evaluation of a Continuous Stirred Tank Reactor (CSTR) at Steady State',
      'Lab 3: Residence Time Distribution (RTD) Measurement in a Plug Flow Reactor using Pulse Tracer',
      'Lab 4: Comparison of Conversion in a Cascade of Three CSTRs in Series vs Single PFR',
    ],
    bookRefs: [
      'H. Scott Fogler - Elements of Chemical Reaction Engineering (Prentice Hall 5th Ed)',
      'Octave Levenspiel - Chemical Reaction Engineering (Wiley 3rd Ed)',
    ],
  });

  // =========================================================================
  // 2. GAYATRI VIDYA PARISHAD COLLEGE OF ENGINEERING (GVPCE) - BULK NOTES PDFS
  // =========================================================================

  // GVPCE - CSE: Data Structures & Algorithms (CS201)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-cse',
    branchName: 'Computer Science and Engineering',
    branchCode: 'CSE',
    courseId: 'course-gvpce-ds',
    courseCode: 'CS201',
    courseName: 'Data Structures and Algorithms',
    courseDesc: 'Linear structures, balanced search trees, graph algorithms, dynamic programming, and amortized complexity.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Asymptotic Analysis & Linear Structures', topics: 'Big-O, Omega, Theta asymptotic bounds, Master Theorem, Amortized analysis, Stacks, Queues, Circular queues, Linked lists' },
      { unit: 'Unit 2', title: 'Balanced Search Trees & Heaps', topics: 'Binary Search Trees, AVL rotations, Red-Black tree coloring rules, Binary Heaps, Priority queues, HeapSort algorithm' },
      { unit: 'Unit 3', title: 'Graph Traversal & Minimum Spanning Trees', topics: 'Graph representations, BFS, DFS, Topological sorting, Prim and Kruskal Minimum Spanning Tree algorithms, Disjoint-Set Union' },
      { unit: 'Unit 4', title: 'Shortest Path Algorithms', topics: 'Dijkstra single-source shortest path with priority queues, Bellman-Ford algorithm for negative weights, Floyd-Warshall all-pairs shortest path' },
      { unit: 'Unit 5', title: 'Dynamic Programming & Greedy Design', topics: 'Optimal substructure, 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Huffman coding' },
    ],
    examQuestions: [
      '1. Solve the recurrence relation T(n) = 3T(n/2) + O(n log n) using the Master Theorem.',
      '2. Insert the keys [15, 20, 24, 10, 13, 7, 30, 36] into an empty AVL tree and show all intermediate rotation operations.',
      '3. Formulate the dynamic programming recurrence and bottom-up matrix construction for the 0/1 Knapsack problem.',
    ],
    labExperiments: [
      'Lab 1: Implementation of Doubly Linked List with Insertion, Deletion, and Reversal Operations in C++',
      'Lab 2: Construction of AVL Tree with Automatic Left, Right, Left-Right, and Right-Left Rotations',
      'Lab 3: Graph Traversal Implementation using BFS and DFS with Cycle Detection',
      'Lab 4: Implementation of Dijkstra Shortest Path Algorithm using Binary Min-Heap Priority Queue',
    ],
    bookRefs: [
      'Thomas H. Cormen, Charles E. Leiserson - Introduction to Algorithms (MIT Press 3rd Ed)',
      'Mark Allen Weiss - Data Structures and Algorithm Analysis in C++ (Pearson 4th Ed)',
    ],
  });

  // GVPCE - AIML: Machine Learning Foundations (AI301)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-aiml',
    branchName: 'Artificial Intelligence and Machine Learning',
    branchCode: 'AIML',
    courseId: 'course-gvpce-ml',
    courseCode: 'AI301',
    courseName: 'Machine Learning Foundations',
    courseDesc: 'Linear regression, logistic classification, SVM kernels, decision trees, random forests, and PCA clustering.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Mathematical Foundations & Linear Regression', topics: 'Linear algebra, Maximum Likelihood Estimation (MLE), Ordinary least squares, Ridge (L2) and Lasso (L1) regularization, Gradient descent' },
      { unit: 'Unit 2', title: 'Classification & Probabilistic Models', topics: 'Logistic regression, Sigmoid derivation, Cross-entropy loss, Naive Bayes classifier, Gaussian Discriminant Analysis, ROC-AUC curves' },
      { unit: 'Unit 3', title: 'Support Vector Machines & Kernel Methods', topics: 'Maximum margin classifiers, Primal and Dual optimization, Karush-Kuhn-Tucker (KKT) conditions, Polynomial and RBF kernels' },
      { unit: 'Unit 4', title: 'Decision Trees & Ensemble Learning', topics: 'Information gain, Gini impurity, ID3, C4.5, CART, Bootstrap Aggregation (Bagging), Random Forests, AdaBoost, Gradient Boosting (XGBoost)' },
      { unit: 'Unit 5', title: 'Unsupervised Learning & Dimensionality Reduction', topics: 'K-Means clustering, Hierarchical clustering, Expectation-Maximization (EM), Principal Component Analysis (PCA) eigendecomposition' },
    ],
    examQuestions: [
      '1. Derive the closed-form normal equation theta = (X^T X)^(-1) X^T y for multiple linear regression and prove its optimality.',
      '2. Formulate the dual optimization problem for Support Vector Machines with soft margins and explain slack variables.',
      '3. Formulate the mathematical derivation of Principal Component Analysis (PCA) using sample covariance matrix eigenvectors.',
    ],
    labExperiments: [
      'Lab 1: Implementation of Batch and Stochastic Gradient Descent for Multivariate Linear Regression from Scratch',
      'Lab 2: Binary and Multi-Class Logistic Regression Classification with Confusion Matrix Metrics',
      'Lab 3: Hyperparameter Tuning of Support Vector Machine (SVM) with Linear and RBF Kernels',
      'Lab 4: Building an Ensemble Classifier using Random Forest and XGBoost with Cross-Validation',
    ],
    bookRefs: [
      'Christopher M. Bishop - Pattern Recognition and Machine Learning (Springer)',
      'Kevin P. Murphy - Machine Learning: A Probabilistic Perspective (MIT Press)',
    ],
  });

  // GVPCE - DS: Applied Statistics & Data Science (DS301)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-ds',
    branchName: 'Data Science',
    branchCode: 'DS',
    courseId: 'course-gvpce-stats',
    courseCode: 'DS301',
    courseName: 'Applied Statistics & Data Science',
    courseDesc: 'Probability distributions, central limit theorem, hypothesis testing, ANOVA, and multivariate regression.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Probability Distributions & Sampling Theory', topics: 'Discrete and continuous random variables, Normal, Binomial, Poisson, Exponential distributions, Central Limit Theorem (CLT)' },
      { unit: 'Unit 2', title: 'Parametric Hypothesis Testing', topics: 'Null & alternative hypotheses, Type I and Type II errors, p-value interpretation, Z-test, Student t-test (one-sample, two-sample, paired)' },
      { unit: 'Unit 3', title: 'Categorical Analysis & Chi-Square Tests', topics: 'Goodness-of-fit tests, Test of independence in contingency tables, Contingency coefficients, Degrees of freedom' },
      { unit: 'Unit 4', title: 'Analysis of Variance (ANOVA)', topics: 'One-way and Two-way ANOVA, F-distribution, Total sum of squares decomposition, Post-hoc tests (Tukey HSD)' },
      { unit: 'Unit 5', title: 'Correlation & Multivariate Regression', topics: 'Pearson and Spearman rank correlation, Multiple linear regression, Multicollinearity, Variance Inflation Factor (VIF), Residual diagnostics' },
    ],
    examQuestions: [
      '1. Formulate a two-tailed Student t-test for comparing independent sample means with unequal variances (Welch t-test).',
      '2. Construct an ANOVA table for a single-factor experiment with 4 treatment groups and calculate the F-statistic.',
      '3. State and prove the Central Limit Theorem and discuss its application in large-sample statistical inference.',
    ],
    labExperiments: [
      'Lab 1: Exploratory Data Analysis, Outlier Detection, and Missing Value Imputation in Python Pandas',
      'Lab 2: Parametric Hypothesis Testing (Z-test, T-test, Paired T-test) on Real-World Datasets',
      'Lab 3: One-Way and Two-Way ANOVA Execution with F-Distribution Significance Testing',
      'Lab 4: Multiple Regression Modeling with VIF Multicollinearity Diagnostics and Residual Plotting',
    ],
    bookRefs: [
      'Douglas C. Montgomery - Applied Statistics and Probability for Engineers (Wiley 7th Ed)',
      'Gareth James et al. - An Introduction to Statistical Learning (Springer)',
    ],
  });

  // GVPCE - IT: Software Engineering (IT202)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-it',
    branchName: 'Information Technology',
    branchCode: 'IT',
    courseId: 'course-gvpce-se',
    courseCode: 'IT202',
    courseName: 'Software Engineering & Design Patterns',
    courseDesc: 'Agile Scrum lifecycle, architectural design, Gang of Four patterns, SOLID principles, and testing suites.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Software Process Models & Agile Scrum', topics: 'Waterfall, Iterative, Spiral, V-Model, Agile manifesto, Scrum sprint planning, User stories, Burndown charts, Velocity' },
      { unit: 'Unit 2', title: 'Architectural Design & SOLID Principles', topics: 'Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion, Layered architecture' },
      { unit: 'Unit 3', title: 'Creational & Structural Design Patterns', topics: 'Singleton, Factory Method, Abstract Factory, Builder, Prototype, Adapter, Facade, Decorator, Composite patterns' },
      { unit: 'Unit 4', title: 'Behavioral Design Patterns', topics: 'Observer, Strategy, Command, State, Template Method, Iterator, Mediator patterns, Loose coupling benefits' },
      { unit: 'Unit 5', title: 'Software Quality Assurance & Verification', topics: 'White-box basis path testing, Cyclomatic complexity, Black-box boundary value analysis, Equivalence partitioning, Unit test suites' },
    ],
    examQuestions: [
      '1. Draw a UML Class Diagram illustrating the Observer Design Pattern and explain how it decouples subject from observers.',
      '2. Compute the Cyclomatic Complexity V(G) for a given program control flow graph using edge-node and region formulas.',
      '3. Explain how the Open-Closed Principle (OCP) is enforced in real software architectures using the Strategy Pattern.',
    ],
    labExperiments: [
      'Lab 1: Requirement Specification and UML Use Case & Class Diagram Modeling in StarUML/PlantUML',
      'Lab 2: Implementation of Factory and Singleton Design Patterns with Thread Safety',
      'Lab 3: Implementation of Observer Pattern for an Event Notification Subsystem',
      'Lab 4: Automated Unit Testing and Code Coverage Profiling using Jest/JUnit',
    ],
    bookRefs: [
      'Erich Gamma, Richard Helm - Design Patterns: Elements of Reusable Object-Oriented Software (Addison-Wesley)',
      'Ian Sommerville - Software Engineering (Pearson 10th Ed)',
    ],
  });

  // GVPCE - ECE: Analog Circuits (EC202)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-ece',
    branchName: 'Electronics and Communication Engineering',
    branchCode: 'ECE',
    courseId: 'course-gvpce-analog',
    courseCode: 'EC202',
    courseName: 'Analog Electronic Circuits',
    courseDesc: 'Small signal transistor models, feedback amplifier topologies, sinusoidal oscillators, and operational amplifiers.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Small-Signal BJT & MOSFET Amplifiers', topics: 'Hybrid-pi model, Common Emitter, Common Collector, High-frequency response, Miller effect, Transconductance parameter' },
      { unit: 'Unit 2', title: 'Feedback Amplifier Topologies', topics: 'Voltage-series, Voltage-shunt, Current-series, Current-shunt feedback, Desensitivity factor, Gain-bandwidth product, Stability' },
      { unit: 'Unit 3', title: 'Sinusoidal Oscillators', topics: 'Barkhausen criterion, RC phase-shift oscillator, Wien bridge oscillator, Hartley, Colpitts, and Quartz crystal oscillators' },
      { unit: 'Unit 4', title: 'Operational Amplifiers & Comparators', topics: 'Differential amplifier, CMRR, Slew rate, Inverting and non-inverting configurations, Schmitt trigger, Precision rectifiers' },
      { unit: 'Unit 5', title: 'Active Filters & Power Amplifiers', topics: 'First and second order Sallen-Key low-pass and high-pass Butterworth filters, Class A, Class B push-pull, Class AB power stages' },
    ],
    examQuestions: [
      '1. Derive the voltage gain, input impedance, and output impedance of a CE amplifier using the low-frequency hybrid-pi model.',
      '2. State Barkhausen criterion and derive the frequency of oscillation and minimum amplifier gain for a Wien Bridge oscillator.',
      '3. Design a second-order low-pass Sallen-Key active filter with a cutoff frequency of 5 kHz and Butterworth damping factor.',
    ],
    labExperiments: [
      'Lab 1: Frequency Response and Gain-Bandwidth Measurement of a Common Emitter BJT Amplifier',
      'Lab 2: Design and Verification of RC Phase Shift Oscillator with Frequency Verification on Oscilloscope',
      'Lab 3: Inverting and Non-Inverting Op-Amp Circuits: Voltage Follower, Summing Amplifier, and Integrator',
      'Lab 4: Design and Frequency Response Plot of a Second-Order Active Butterworth Low-Pass Filter',
    ],
    bookRefs: [
      'Adel S. Sedra, Kenneth C. Smith - Microelectronic Circuits (Oxford University Press 7th Ed)',
      'Jacob Millman, Christos C. Halkias - Integrated Electronics (McGraw-Hill)',
    ],
  });

  // GVPCE - EEE: Electrical Circuit Analysis (EE201)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-eee',
    branchName: 'Electrical and Electronics Engineering',
    branchCode: 'EEE',
    courseId: 'course-gvpce-circuits',
    courseCode: 'EE201',
    courseName: 'Electrical Circuit Analysis',
    courseDesc: 'Network theorems, transient analysis of RLC circuits, Laplace transforms, and two-port network parameters.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Network Theorems (DC & AC)', topics: 'Thevenin, Norton, Superposition, Maximum Power Transfer, Reciprocity, and Millman theorems with dependent and independent sources' },
      { unit: 'Unit 2', title: 'Transient Response of First-Order Circuits', topics: 'Natural and forced response of RL and RC circuits, Differential equations, Time constants, DC step and pulse responses' },
      { unit: 'Unit 3', title: 'Transient Response of Second-Order RLC Circuits', topics: 'Series and parallel RLC transient response, Overdamped, critically damped, and underdamped response regimes, Quality factor' },
      { unit: 'Unit 4', title: 'Laplace Transform in Circuit Analysis', topics: 'Transformed circuit impedance models of R, L, and C, Initial and final value theorems, Complex frequency s-plane analysis' },
      { unit: 'Unit 5', title: 'Two-Port Network Parameters', topics: 'Impedance (Z), Admittance (Y), Hybrid (H), and Transmission (ABCD) parameters, Interconnection of two-port networks (series, parallel, cascade)' },
    ],
    examQuestions: [
      '1. Find the Thevenin equivalent circuit across terminals containing both independent and voltage-controlled sources.',
      '2. Solve for the transient current i(t) in an underdamped series RLC circuit excited by a DC step voltage using Laplace transforms.',
      '3. Derive the relationship between Z-parameters and ABCD transmission parameters for a reciprocal two-port network.',
    ],
    labExperiments: [
      'Lab 1: Experimental Verification of Thevenin, Norton, and Superposition Theorems on Resistive DC Networks',
      'Lab 2: Verification of Maximum Power Transfer Theorem for DC and AC Circuits with Complex Load Matching',
      'Lab 3: Determination of Transient Time Constants for First-Order RL and RC Circuits on Digital Storage Oscilloscope',
      'Lab 4: Experimental Determination of Two-Port Z and Y Parameters of a Symmetrical T and Pi Network',
    ],
    bookRefs: [
      'William H. Hayt, Jack E. Kemmerly - Engineering Circuit Analysis (McGraw-Hill 8th Ed)',
      'Charles K. Alexander, Matthew N.O. Sadiku - Fundamentals of Electric Circuits (McGraw-Hill)',
    ],
  });

  // GVPCE - MECH: Mechanics of Solids (ME201)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-mech',
    branchName: 'Mechanical Engineering',
    branchCode: 'MECH',
    courseId: 'course-gvpce-mos',
    courseCode: 'ME201',
    courseName: 'Mechanics of Solids',
    courseDesc: 'Stress-strain tensors, shear force and bending moment diagrams, flexure formula, torsion, and column buckling.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Stress, Strain & Elastic Constants', topics: 'Hooke law, Poisson ratio, Modulus of elasticity, Bulk modulus, Shear modulus, Thermal stresses in compound bars, Elastic relations' },
      { unit: 'Unit 2', title: 'Shear Force & Bending Moment Diagrams', topics: 'SFD and BMD for cantilevers, simply supported and overhanging beams under concentrated loads, UDL, and uniformly varying loads' },
      { unit: 'Unit 3', title: 'Flexural & Shear Stresses in Beams', topics: 'Theory of simple bending, Flexure formula sigma/y = M/I = E/R, Section modulus, Shear stress distribution across I, T, and rectangular sections' },
      { unit: 'Unit 4', title: 'Torsion of Circular Shafts & Springs', topics: 'Torsion formula T/J = tau/r = G*theta/L, Polar section modulus, Power transmission in solid and hollow shafts, Helical springs deflection' },
      { unit: 'Unit 5', title: 'Principal Stresses & Column Buckling', topics: 'Mohr circle of plane stress, Principal stresses and planes, Maximum shear stress, Euler buckling formula for columns with various end conditions' },
    ],
    examQuestions: [
      '1. Plot SFD and BMD for a simply supported beam with a uniformly distributed load and calculate the point of contraflexure.',
      '2. Derive the Euler critical buckling load P_cr = pi^2 * E * I / (L_eff)^2 for a column with one end fixed and one end pinned.',
      '3. Draw Mohr Circle for an element subjected to sigma_x = 80 MPa, sigma_y = -40 MPa, and tau_xy = 30 MPa, and find principal planes.',
    ],
    labExperiments: [
      'Lab 1: Tensile Testing of Mild Steel Specimen on Universal Testing Machine (UTM) with Stress-Strain Plotting',
      'Lab 2: Torsion Testing of Mild Steel Shaft to Determine Modulus of Rigidity (G)',
      'Lab 3: Izod and Charpy Impact Toughness Testing on Notched Metallic Specimens',
      'Lab 4: Rockwell and Brinell Hardness Testing on Ferrous and Non-Ferrous Alloys',
    ],
    bookRefs: [
      'S. Timoshenko - Strength of Materials (CBS Publishers)',
      'Ferdinand P. Beer, E. Russell Johnston - Mechanics of Materials (McGraw-Hill 7th Ed)',
    ],
  });

  // GVPCE - CIVIL: Surveying & Geomatics (CE201)
  seedBulkCoursePdfs({
    instId: 'inst-gvpce',
    instName: 'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    branchId: 'branch-gvpce-civil',
    branchName: 'Civil Engineering',
    branchCode: 'CIVIL',
    courseId: 'course-gvpce-survey',
    courseCode: 'CE201',
    courseName: 'Surveying & Geomatics',
    courseDesc: 'Linear & angular measurements, levelling, contouring, theodolite traversing, curve setting, and Total Station.',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
    units: [
      { unit: 'Unit 1', title: 'Linear Measurements & Compass Surveying', topics: 'Chain and tape surveying, Magnetic declination, Whole circle bearing vs reduced bearing, Local attraction detection and correction' },
      { unit: 'Unit 2', title: 'Levelling & Contouring', topics: 'Differential levelling, Collimation and Rise-and-Fall computation methods, Reciprocal levelling, Contour characteristics and interpolation' },
      { unit: 'Unit 3', title: 'Theodolite Traversing & Computation', topics: 'Vernier transit theodolite, Measurement of horizontal and vertical angles, Gale traverse table, Bowditch and Transit rules' },
      { unit: 'Unit 4', title: 'Curve Setting (Horizontal & Vertical)', topics: 'Circular and transition curves, Elements of simple curves, Setting out curves by offsets from chord produced and Rankine deflection angles' },
      { unit: 'Unit 5', title: 'Modern Geomatics & Total Station', topics: 'Electronic Distance Measurement (EDM), Total Station operations, Global Positioning System (GPS/GNSS) surveying, GIS data integration' },
    ],
    examQuestions: [
      '1. Reduce levels from given level book field readings using both Height of Instrument and Rise-and-Fall methods with arithmetic checks.',
      '2. Calculate corrected latitudes and departures for a closed polygon traverse using Bowditch balancing method.',
      '3. Formulate the setting-out table for a simple circular curve of radius 300 m with 20 m chord increments using Rankine method.',
    ],
    labExperiments: [
      'Lab 1: Differential Levelling and Fly Levelling Exercise across Building Benchmarks',
      'Lab 2: Measurement of Horizontal Angles by Repetition and Reiteration Methods using Vernier Theodolite',
      'Lab 3: Setting Out a Simple Circular Curve on the Field using Rankine Deflection Angle Method',
      'Lab 4: Topographical Surveying and Area Computation using Electronic Total Station',
    ],
    bookRefs: [
      'B.C. Punmia, Ashok Kumar Jain - Surveying Vol. I & II (Laxmi Publications)',
      'K.R. Arora - Surveying Vol. 1 & 2 (Standard Book House)',
    ],
  });

  // =========================================================================
  // 3. GITAM DEEMED TO BE UNIVERSITY (GITAM) - BULK NOTES PDFS
  // =========================================================================

  // GITAM - CSE: Object-Oriented Programming (CS101)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-cse',
    branchName: 'Computer Science and Engineering',
    branchCode: 'CSE',
    courseId: 'course-gitam-oop',
    courseCode: 'CS101',
    courseName: 'Object-Oriented Programming & Principles',
    courseDesc: 'Classes, encapsulation, inheritance, virtual tables, exception handling, smart pointers, and generics.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Paradigms & Object-Oriented Fundamentals', topics: 'Procedural vs Object-Oriented paradigms, Data encapsulation, Access specifiers, Constructor & Destructor lifecycles, Copy constructors' },
      { unit: 'Unit 2', title: 'Inheritance & Dynamic Binding', topics: 'Single, multiple, and hierarchical inheritance, Diamond problem, Virtual base classes, Virtual functions, Vptr and Vtable dynamic dispatch' },
      { unit: 'Unit 3', title: 'Memory Architecture & RAII', topics: 'Stack vs Heap memory allocation, RAII idiom, Smart pointers (unique_ptr, shared_ptr, weak_ptr), Generic templates and STL containers' },
      { unit: 'Unit 4', title: 'Exception Hierarchies & Stream I/O', topics: 'Try-catch-throw mechanisms, Custom exception classes, File streams, Serialization, Binary and formatted disk persistence' },
      { unit: 'Unit 5', title: 'Modern Language Idioms & Design', topics: 'Lambda expressions, Move semantics, Rvalue references, Operator overloading, Thread concurrency primitives' },
    ],
    examQuestions: [
      '1. Illustrate with memory diagrams how virtual method tables (vtable) and virtual pointers (vptr) achieve runtime dynamic dispatch.',
      '2. Describe the diamond problem in multiple inheritance and show how virtual base classes resolve duplicate base instances.',
      '3. Explain RAII (Resource Acquisition Is Initialization) and contrast unique_ptr with shared_ptr in reference counting.',
    ],
    labExperiments: [
      'Lab 1: Implementation of Classes, Static Members, and Overloaded Constructors in C++',
      'Lab 2: Polymorphic Hierarchy Demonstration with Virtual Functions and Abstract Base Classes',
      'Lab 3: Custom Generic Stack and Queue Template Classes with Exception Handling',
      'Lab 4: Binary File Persistence and Object Serialization using C++ File Streams',
    ],
    bookRefs: [
      'Bjarne Stroustrup - The C++ Programming Language (Addison-Wesley 4th Ed)',
      'Robert Lafore - Object-Oriented Programming in C++ (Sams Publishing)',
    ],
  });

  // GITAM - IT: Cyber Security & Cryptography (IT303)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-it',
    branchName: 'Information Technology',
    branchCode: 'IT',
    courseId: 'course-gitam-crypto',
    courseCode: 'IT303',
    courseName: 'Cyber Security & Cryptography',
    courseDesc: 'Symmetric AES, asymmetric RSA, SHA-256 hashing, Diffie-Hellman key exchange, and network defenses.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Symmetric Cryptography & Block Ciphers', topics: 'Feistel cipher model, DES, Triple-DES, Advanced Encryption Standard (AES) rounds, Modes of operation (CBC, GCM, CTR)' },
      { unit: 'Unit 2', title: 'Asymmetric Cryptography & Number Theory', topics: 'Modular arithmetic, Extended Euclidean algorithm, RSA cryptosystem, Diffie-Hellman key exchange, Discrete logarithm problem' },
      { unit: 'Unit 3', title: 'Cryptographic Hash & Digital Signatures', topics: 'Hash functions, SHA-256, HMAC construction, Digital signatures (DSA, ECDSA), Public Key Infrastructure (PKI, X.509)' },
      { unit: 'Unit 4', title: 'Network Security Protocols', topics: 'TLS 1.3 handshake, IPsec (AH and ESP), Firewalls (Stateful packet inspection), Intrusion Detection Systems (IDS), VPN tunnels' },
      { unit: 'Unit 5', title: 'Web Security & Cyber Defenses', topics: 'OWASP Top 10 vulnerabilities, SQL injection, XSS, Buffer overflow exploits, Threat modeling, Zero-Trust network architecture' },
    ],
    examQuestions: [
      '1. Trace the mathematical steps of RSA algorithm: calculate public and private keys for primes p=17, q=11 with e=7 and decrypt ciphertext.',
      '2. Describe the Diffie-Hellman key exchange protocol and analyze its vulnerability to Man-In-The-Middle (MITM) attacks.',
      '3. Formulate the four transformations applied in each round of the Advanced Encryption Standard (AES) cipher.',
    ],
    labExperiments: [
      'Lab 1: Implementation of Classical Substitution and Permutation Ciphers in Python',
      'Lab 2: Encryption and Decryption using AES-256-GCM with Authenticated Encryption Tags',
      'Lab 3: Asymmetric Key Generation, Encryption, and Digital Signature Verification using RSA',
      'Lab 4: Network Traffic Packet Inspection and Vulnerability Assessment using Wireshark and Nmap',
    ],
    bookRefs: [
      'William Stallings - Cryptography and Network Security: Principles and Practice (Pearson 7th Ed)',
      'Bruce Schneier - Applied Cryptography: Protocols, Algorithms, and Source Code in C (Wiley)',
    ],
  });

  // GITAM - AIML: AI Principles & Search Strategies (AI201)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-aiml',
    branchName: 'Artificial Intelligence and Machine Learning',
    branchCode: 'AIML',
    courseId: 'course-gitam-ai',
    courseCode: 'AI201',
    courseName: 'Artificial Intelligence & Search Strategies',
    courseDesc: 'Intelligent agents, uninformed and informed heuristic search (A*), adversarial minimax, and constraint logic.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Intelligent Agents & State Space Search', topics: 'Agent architectures, PEAS definitions, Breadth-First, Uniform Cost, Depth-First, and Iterative Deepening search' },
      { unit: 'Unit 2', title: 'Informed Heuristic Search & Optimality', topics: 'Greedy best-first search, A* search algorithm, Admissible and consistent heuristics, Memory-bounded search (IDA*, SMA*)' },
      { unit: 'Unit 3', title: 'Adversarial Search & Games', topics: 'Game theory formulation, Minimax decision algorithm, Alpha-Beta pruning optimality, Evaluation functions for multi-player games' },
      { unit: 'Unit 4', title: 'Constraint Satisfaction Problems (CSP)', topics: 'Constraint propagation, AC-3 algorithm, Backtracking with Minimum Remaining Values (MRV) heuristic, Forward checking' },
      { unit: 'Unit 5', title: 'Knowledge Representation & Logic', topics: 'Propositional logic, First-order predicate logic, Inference rules, Forward and backward chaining, Resolution refutation' },
    ],
    examQuestions: [
      '1. Prove that A* search is optimal when the heuristic function h(n) is admissible for tree search and consistent for graph search.',
      '2. Apply Alpha-Beta pruning on a specified 4-ply minimax game tree and show the branches that are pruned.',
      '3. Solve the 4-Queens Constraint Satisfaction Problem using backtracking search and arc-consistency (AC-3) filtering.',
    ],
    labExperiments: [
      'Lab 1: Implementation of Uninformed Search (BFS, DFS, Uniform Cost) for Pathfinding in a Grid',
      'Lab 2: Implementation of A* Heuristic Search for the 8-Puzzle Problem using Manhattan Distance',
      'Lab 3: Building a Tic-Tac-Toe Game Engine using Adversarial Minimax with Alpha-Beta Pruning',
      'Lab 4: Constraint Satisfaction Solver for Map Coloring and Sudoku using AC-3 Arc Consistency',
    ],
    bookRefs: [
      'Stuart Russell, Peter Norvig - Artificial Intelligence: A Modern Approach (Pearson 4th Ed)',
      'Elaine Rich, Kevin Knight - Artificial Intelligence (McGraw-Hill)',
    ],
  });

  // GITAM - ECE: Electromagnetic Waves (EC305)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-ece',
    branchName: 'Electronics and Communication Engineering',
    branchCode: 'ECE',
    courseId: 'course-gitam-emw',
    courseCode: 'EC305',
    courseName: 'Electromagnetic Waves & Transmission Lines',
    courseDesc: 'Maxwell equations, plane wave propagation, Poynting vector, reflection, and Smith chart stub tuning.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Maxwell Equations & Electromagnetic Statics', topics: 'Gauss, Faraday, and Ampere laws in differential and integral forms, Displacement current, Boundary conditions across media' },
      { unit: 'Unit 2', title: 'Uniform Plane Wave Propagation', topics: 'Helmholtz wave equation, Propagation constant, Attenuation and phase constants, Intrinsic impedance, Skin depth, Poynting vector' },
      { unit: 'Unit 3', title: 'Reflection & Refraction at Media Boundaries', topics: 'Normal and oblique incidence, Snell law, Fresnel reflection and transmission coefficients, Brewster angle, Total internal reflection' },
      { unit: 'Unit 4', title: 'Transmission Line Equations', topics: 'Transmission line differential equations, Characteristic impedance (Z0), Propagation constant, Reflection coefficient, VSWR' },
      { unit: 'Unit 5', title: 'Smith Chart & Impedance Matching', topics: 'Smith chart coordinate geometry, Input impedance computation, Quarter-wave transformers, Single and double stub tuning matching' },
    ],
    examQuestions: [
      '1. Derive the wave equation in a conducting medium from Maxwell equations and obtain expressions for alpha, beta, and skin depth.',
      '2. Using a Smith chart, design a single-stub parallel tuner to match a load of Z_L = 100 + j80 ohms to a 50-ohm line.',
      '3. State and prove Poynting Theorem for electromagnetic energy conservation in a finite volume.',
    ],
    labExperiments: [
      'Lab 1: Measurement of Standing Wave Pattern, VSWR, and Wavelength in a Waveguide Test Bench',
      'Lab 2: Impedance Matching and Load Reflection Measurement using Smith Chart Simulation Tool',
      'Lab 3: Measurement of Radiation Pattern and Directivity of a Half-Wave Dipole Antenna',
      'Lab 4: Attenuation and Skin Depth Characterization in Coaxial and Microstrip Transmission Lines',
    ],
    bookRefs: [
      'Matthew N.O. Sadiku - Elements of Electromagnetics (Oxford University Press 7th Ed)',
      'E.C. Jordan, K.G. Balmain - Electromagnetic Waves and Radiating Systems (Prentice Hall)',
    ],
  });

  // GITAM - EEE: Power Electronics & Converters (EE304)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-eee',
    branchName: 'Electrical and Electronics Engineering',
    branchCode: 'EEE',
    courseId: 'course-gitam-pe',
    courseCode: 'EE304',
    courseName: 'Power Electronics & Converters',
    courseDesc: 'Semiconductor switches, controlled rectifiers, DC-DC buck/boost converters, and PWM inverters.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Power Semiconductor Switches', topics: 'Thyristors (SCR), Triac, Power MOSFET, IGBT, Switching characteristics, Safe Operating Area (SOA), Gate driver circuits' },
      { unit: 'Unit 2', title: 'Phase-Controlled Converters', topics: 'Single-phase and three-phase half-wave and full-wave controlled rectifiers with R, RL, and RLE loads, Inversion operation' },
      { unit: 'Unit 3', title: 'DC-DC Switched Mode Regulators', topics: 'Buck converter, Boost converter, Buck-Boost topology, Continuous and discontinuous conduction boundary modes, Ripple analysis' },
      { unit: 'Unit 4', title: 'Inverters & Modulation Techniques', topics: 'Voltage Source Inverters (VSI), Single-phase full-bridge, Three-phase 120 and 180 conduction modes, Sinusoidal PWM (SPWM)' },
      { unit: 'Unit 5', title: 'AC Voltage Controllers & Cycloconverters', topics: 'Single-phase bidirectional controllers with resistive and inductive loads, Sequence control, Cycloconverter step-down frequency synthesis' },
    ],
    examQuestions: [
      '1. Derive the expression for the average output voltage of a single-phase fully-controlled bridge rectifier feeding an RL load.',
      '2. Formulate the inductor volt-second balance and capacitor charge balance for a DC-DC Boost regulator in continuous conduction mode.',
      '3. Compare 180-degree and 120-degree conduction modes of a three-phase bridge inverter with line and phase voltage waveforms.',
    ],
    labExperiments: [
      'Lab 1: V-I Characteristics of SCR, MOSFET, and IGBT under Varying Gate Trigger Voltages',
      'Lab 2: Single-Phase Fully-Controlled Thyristor Bridge Rectifier with R and RL Load Testing',
      'Lab 3: Design and Closed-Loop Output Voltage Regulation of a DC-DC Buck Converter',
      'Lab 4: Speed Control of a DC Motor using a Microcontroller-Driven H-Bridge PWM Driver',
    ],
    bookRefs: [
      'Ned Mohan, Tore M. Undeland - Power Electronics: Converters, Applications, and Design (Wiley 3rd Ed)',
      'Muhammad H. Rashid - Power Electronics: Devices, Circuits, and Applications (Pearson 4th Ed)',
    ],
  });

  // GITAM - MECH: Heat & Mass Transfer (ME304)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-mech',
    branchName: 'Mechanical Engineering',
    branchCode: 'MECH',
    courseId: 'course-gitam-hmt',
    courseCode: 'ME304',
    courseName: 'Heat & Mass Transfer',
    courseDesc: 'Steady and transient conduction, forced convection, radiation shape factors, and heat exchangers.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Steady & Transient Conduction', topics: 'Fourier law, 3D heat conduction equation in Cartesian and cylindrical coordinates, Critical thickness of insulation, Lumped capacitance' },
      { unit: 'Unit 2', title: 'Forced & Natural Convection', topics: 'Boundary layer approximations, Nusselt, Reynolds, and Prandtl numbers, Empirical correlations for flow past plates and cylinders' },
      { unit: 'Unit 3', title: 'Thermal Radiation', topics: 'Stefan-Boltzmann law, Planck law, Wien displacement law, Emissivity, View factor algebra, Radiation exchange between gray surfaces' },
      { unit: 'Unit 4', title: 'Heat Exchangers & Mass Transfer', topics: 'Overall heat transfer coefficient, Fouling factor, LMTD method, Effectiveness-NTU method, Fick first law of diffusion' },
      { unit: 'Unit 5', title: 'Boiling, Condensation & Mass Diffusion', topics: 'Pool boiling regimes, Critical heat flux, Dropwise and filmwise condensation, Mass transfer coefficients, Sherwood and Schmidt numbers' },
    ],
    examQuestions: [
      '1. Derive the temperature distribution and heat dissipation from a pin fin of uniform cross-section with an insulated tip.',
      '2. Calculate the effectiveness and heat transfer rate of a counter-flow heat exchanger using the Effectiveness-NTU method.',
      '3. State reciprocity, summation, and superposition rules for radiation shape factors and find the shape factor between concentric cylinders.',
    ],
    labExperiments: [
      'Lab 1: Thermal Conductivity Measurement of Insulating Material using Guarded Hot Plate Apparatus',
      'Lab 2: Heat Transfer Coefficient Determination in Natural and Forced Convection through a Vertical Pipe',
      'Lab 3: Stefan-Boltzmann Constant Verification using Radiation Test Apparatus',
      'Lab 4: Performance Evaluation and Effectiveness Measurement of a Shell-and-Tube Heat Exchanger',
    ],
    bookRefs: [
      'Frank P. Incropera, David P. DeWitt - Fundamentals of Heat and Mass Transfer (Wiley 7th Ed)',
      'J.P. Holman - Heat Transfer (McGraw-Hill 10th Ed)',
    ],
  });

  // GITAM - CIVIL: Transportation & Highway Engineering (CE304)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-civil',
    branchName: 'Civil Engineering',
    branchCode: 'CIVIL',
    courseId: 'course-gitam-trans',
    courseCode: 'CE304',
    courseName: 'Transportation & Highway Engineering',
    courseDesc: 'Highway geometric design, IRC specifications, pavement materials, flexible and rigid pavement design.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Highway Planning & Alignments', topics: 'Highway development plans, Road patterns, Engineering surveys for highway location, Environmental impact guidelines' },
      { unit: 'Unit 2', title: 'Geometric Design of Highways', topics: 'Design speed, Cross-sectional elements, Camber, Sight distances (SSD, OSD), Horizontal alignment, Super-elevation, Transition curves' },
      { unit: 'Unit 3', title: 'Pavement Materials & Testing', topics: 'Subgrade soil characterization, CBR test, Crushing and Impact value of aggregates, Bitumen penetration, Ductility, Softening point tests' },
      { unit: 'Unit 4', title: 'Pavement Design Principles', topics: 'Design of flexible pavements as per IRC:37 guidelines, Westergaard stress equations for rigid pavements, Temperature and wheel load stresses' },
      { unit: 'Unit 5', title: 'Traffic Engineering & Highway Maintenance', topics: 'Traffic volume, speed, and density studies, Level of Service (LOS), Traffic signals design (Webster method), Pavement distress and rehabilitation' },
    ],
    examQuestions: [
      '1. Calculate the design super-elevation and length of transition curve for a highway curve of radius 400 m at 80 km/h speed.',
      '2. Describe the California Bearing Ratio (CBR) laboratory testing procedure and its application in flexible pavement design.',
      '3. Compute the safe stopping sight distance (SSD) on a highway with 70 km/h design speed on a 3% downgrade slope.',
    ],
    labExperiments: [
      'Lab 1: Aggregate Impact Value and Crushing Strength Testing for Highway Pavements',
      'Lab 2: Penetration, Ductility, and Softening Point Characterization of Bituminous Binders',
      'Lab 3: California Bearing Ratio (CBR) Laboratory Determination for Subgrade Soil',
      'Lab 4: Traffic Volume and Speed Study at a Busy Urban Intersection with Signal Timing Design',
    ],
    bookRefs: [
      'S.K. Khanna, C.E.G. Justo - Highway Engineering (Nem Chand & Bros 10th Ed)',
      'Paul H. Wright, Karen Dixon - Highway Engineering (Wiley 7th Ed)',
    ],
  });

  // GITAM - BT: Genetic Engineering & Recombinant DNA (BT301)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-bt',
    branchName: 'Biotechnology',
    branchCode: 'BT',
    courseId: 'course-gitam-gene',
    courseCode: 'BT301',
    courseName: 'Genetic Engineering & Recombinant DNA',
    courseDesc: 'Restriction enzymes, plasmid cloning vectors, PCR amplification, Sanger sequencing, and CRISPR-Cas9.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Molecular Tools & Restriction Enzymes', topics: 'Type II restriction endonucleases, DNA ligases, Alkaline phosphatases, Reverse transcriptase, Polynucleotide kinase' },
      { unit: 'Unit 2', title: 'Cloning Vectors & Transformation', topics: 'Plasmids (pBR322, pUC19), Bacteriophage lambda, Cosmids, YAC, BAC, Competent cell preparation, Electroporation' },
      { unit: 'Unit 3', title: 'Gene Amplification & Sequencing', topics: 'Polymerase Chain Reaction (PCR) variations (RT-PCR, qPCR), Sanger chain termination sequencing, Next-Generation Sequencing (NGS)' },
      { unit: 'Unit 4', title: 'Genome Editing & CRISPR-Cas9', topics: 'CRISPR-Cas9 target recognition, sgRNA design, Zinc Finger Nucleases, Recombinant therapeutics (Insulin, Monoclonal antibodies)' },
      { unit: 'Unit 5', title: 'Expression Systems & Transgenic Organisms', topics: 'Prokaryotic vs Eukaryotic expression vectors, Inclusion bodies, Transgenic plants and animals, Bioethics and biosafety regulations' },
    ],
    examQuestions: [
      '1. Describe the key structural components of pBR322 cloning vector and explain insertional inactivation for recombinant selection.',
      '2. Outline the thermal cycling phases of Polymerase Chain Reaction (PCR) and calculate theoretical amplicon yield after n cycles.',
      '3. Explain the mechanism of CRISPR-Cas9 mediated double-strand break repair via NHEJ and HDR pathways.',
    ],
    labExperiments: [
      'Lab 1: Isolation of Plasmid DNA from Escherichia coli using Alkaline Lysis Method',
      'Lab 2: Restriction Digestion of Lambda DNA using EcoRI and HindIII followed by Agarose Gel Electrophoresis',
      'Lab 3: Polymerase Chain Reaction (PCR) Amplification of Target Gene Fragment with Primer Optimization',
      'Lab 4: Preparation of Chemically Competent Bacterial Cells and Heat-Shock Transformation',
    ],
    bookRefs: [
      'T.A. Brown - Gene Cloning and DNA Analysis: An Introduction (Wiley-Blackwell 7th Ed)',
      'Bernard R. Glick - Molecular Biotechnology: Principles and Applications of Recombinant DNA (ASM Press)',
    ],
  });

  // GITAM - AERO: Aerodynamics & Flight Mechanics (AE301)
  seedBulkCoursePdfs({
    instId: 'inst-gitam',
    instName: 'GITAM Deemed to be University',
    branchId: 'branch-gitam-aero',
    branchName: 'Aerospace Engineering',
    branchCode: 'AERO',
    courseId: 'course-gitam-aero',
    courseCode: 'AE301',
    courseName: 'Aerodynamics & Flight Mechanics',
    courseDesc: 'Airfoil lift and drag, thin airfoil theory, Prandtl lifting-line, supersonic shock waves, and flight stability.',
    uploaderId: 'user-gitam-admin',
    uploaderName: 'GITAM Academic Admin',
    units: [
      { unit: 'Unit 1', title: 'Fundamental Incompressible Potential Flow', topics: 'Continuity and Euler equations, Velocity potential, Stream function, Elementary flows (Source, Sink, Doublet, Vortex)' },
      { unit: 'Unit 2', title: 'Incompressible Airfoil & Finite Wing Theory', topics: 'Kutta condition, Thin airfoil theory for symmetric and cambered airfoils, Prandtl lifting line theory, Induced drag' },
      { unit: 'Unit 3', title: 'Compressible Flow & Shock Waves', topics: 'Speed of sound, Mach number regimes, 1D isentropic flow through converging-diverging nozzles, Normal and oblique shocks' },
      { unit: 'Unit 4', title: 'Aircraft Performance & Flight Stability', topics: 'Thrust required and power required curves, Rate of climb, Service ceiling, Static longitudinal stability, Neutral point' },
      { unit: 'Unit 5', title: 'Hypersonic Aerodynamics & Viscous Effects', topics: 'Newtonian impact theory, Boundary layer transition, Aerodynamic heating, Swept wing benefits, Shock stall' },
    ],
    examQuestions: [
      '1. Derive the Kutta-Joukowski theorem L = rho * V_inf * Gamma for lift generation on a spinning cylinder in potential flow.',
      '2. Using Thin Airfoil Theory, prove that the lift curve slope dC_L/d(alpha) equals 2*pi for a thin symmetric airfoil.',
      '3. Formulate the normal shock relations for static pressure ratio P2/P1 and downstream Mach number M2 in terms of upstream Mach number M1.',
    ],
    labExperiments: [
      'Lab 1: Surface Pressure Distribution Measurement over a NACA 0012 Airfoil in a Subsonic Wind Tunnel',
      'Lab 2: Lift and Drag Force Measurement using Three-Component Wind Tunnel Balance at Varying Angles of Attack',
      'Lab 3: Flow Visualization over an Aircraft Model using Smoke Injection and Wool Tufts',
      'Lab 4: Supersonic Shock Wave Visualization in a Converging-Diverging Nozzle using Schlieren Optics',
    ],
    bookRefs: [
      'John D. Anderson Jr. - Fundamentals of Aerodynamics (McGraw-Hill 6th Ed)',
      'E.L. Houghton, P.W. Carpenter - Aerodynamics for Engineering Students (Butterworth-Heinemann)',
    ],
  });

  // 4. Initialize Login Authentication Accounts (Passwords: 'Password@123')
  const defaultPw = hashPassword('Password@123');
  const insertUser = database.prepare(`
    INSERT OR IGNORE INTO users (id, institution_id, branch_id, course_id, name, email, password_hash, password_salt, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // AU Accounts
  insertUser.run('user-au-admin', 'inst-au', null, null, 'AU Department Admin', 'admin@andhrauniversity.edu.in', defaultPw.hash, defaultPw.salt, 'admin', now);
  insertUser.run('user-au-student', 'inst-au', 'branch-au-cse', 'course-au-os', 'Rahul Kalyan', 'student@andhrauniversity.edu.in', defaultPw.hash, defaultPw.salt, 'student', now);

  // GVPCE Accounts
  insertUser.run('user-gvpce-admin', 'inst-gvpce', null, null, 'GVPCE Admin', 'admin@gvpce.ac.in', defaultPw.hash, defaultPw.salt, 'admin', now);
  insertUser.run('user-gvpce-student', 'inst-gvpce', 'branch-gvpce-cse', 'course-gvpce-ds', 'Priya Varma', 'student@gvpce.ac.in', defaultPw.hash, defaultPw.salt, 'student', now);

  // GITAM Accounts
  insertUser.run('user-gitam-admin', 'inst-gitam', null, null, 'GITAM Academic Admin', 'admin@gitam.edu', defaultPw.hash, defaultPw.salt, 'admin', now);
  insertUser.run('user-gitam-student', 'inst-gitam', 'branch-gitam-cse', 'course-gitam-oop', 'Siddharth Rao', 'student@gitam.edu', defaultPw.hash, defaultPw.salt, 'student', now);

  // Re-enable strict foreign keys and verify integrity
  database.exec('PRAGMA foreign_keys = ON;');
  const fkViolations = database.prepare('PRAGMA foreign_key_check;').all();
  if (fkViolations.length > 0) {
    console.warn('Foreign key check warnings:', fkViolations);
  }

  // Summary counts
  const institutionsCount = (database.prepare('SELECT COUNT(*) as count FROM institutions').get() as any)?.count || 0;
  const branchesCount = (database.prepare('SELECT COUNT(*) as count FROM branches').get() as any)?.count || 0;
  const coursesCount = (database.prepare('SELECT COUNT(*) as count FROM courses').get() as any)?.count || 0;
  const resourcesCount = (database.prepare('SELECT COUNT(*) as count FROM resources').get() as any)?.count || 0;
  const usersCount = (database.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;

  return {
    institutionsCount,
    branchesCount,
    coursesCount,
    resourcesCount,
    usersCount,
  };
}

// Direct execution CLI runner
if (require.main === module || process.argv[1]?.endsWith('init.ts')) {
  console.log('🚀 Initializing NoteVault Academic Database and Bulk Notes PDF Storage...');
  const stats = initializeDatabase();
  console.log('✅ Database Initialization Complete!');
  console.log(`   - Institutions across India: ${stats.institutionsCount}`);
  console.log(`   - Engineering Branches:       ${stats.branchesCount}`);
  console.log(`   - Academic Courses:           ${stats.coursesCount}`);
  console.log(`   - Bulk Full Syllabus PDFs:    ${stats.resourcesCount}`);
  console.log(`   - Authentication Users:       ${stats.usersCount}`);
  console.log('   - Storage Mode:               SQLite BLOB + public/uploads/');
  console.log('   - Demo Test Passwords:        Password@123\n');
}
