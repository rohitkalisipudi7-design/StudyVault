import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { hashPassword } from '../security/auth';
import { buildAcademicPdf, AcademicUnit } from '../utils/pdf-generator';
import { CORE_CURRICULUM, CourseDefinition } from './curriculum-data';

export function initializeDatabase(db?: DatabaseSync) {
  let database = db;
  let shouldClose = false;

  if (!database) {
    const dbPath = process.env.DATABASE_PATH
      ? (process.env.DATABASE_PATH === ':memory:' ? ':memory:' : path.resolve(process.cwd(), process.env.DATABASE_PATH))
      : path.resolve(process.cwd(), 'data', 'app.db');

    if (dbPath !== ':memory:') {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }

    database = new DatabaseSync(dbPath);
    shouldClose = true;
  }

  // Optimize pragmas
  database.exec('PRAGMA foreign_keys = OFF;');
  database.exec('PRAGMA busy_timeout = 5000;');

  const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch {
    // Non-blocking disk creation
  }

  // 1. Core Schema Definition
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

  // Ensure file_data column exists
  try {
    database.exec('ALTER TABLE resources ADD COLUMN file_data BLOB;');
  } catch {}

  const now = new Date().toISOString();

  // 2. Insert Institutions Across India (Safe seed)
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
    INSERT INTO resources (
      id, institution_id, branch_id, course_id, title, type, description, url,
      file_path, file_size, file_name, file_data, uploader_id, uploader_name, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      file_data = COALESCE(excluded.file_data, resources.file_data),
      file_path = excluded.file_path,
      file_name = excluded.file_name,
      file_size = excluded.file_size
  `);

  const updateResourceBlob = database.prepare(`
    UPDATE resources SET file_data = ? WHERE id = ? AND file_data IS NULL
  `);

  // Helper function to seed a course with 3 comprehensive PDF documents
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
    try {
      fs.writeFileSync(notesDiskPath, notesPdfBuffer);
    } catch {}

    const notesResId = `res-${config.courseId}-notes`;
    insertResource.run(
      notesResId,
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
    updateResourceBlob.run(notesPdfBuffer, notesResId);

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
    try {
      fs.writeFileSync(qbDiskPath, qbPdfBuffer);
    } catch {}

    const qbResId = `res-${config.courseId}-qb`;
    insertResource.run(
      qbResId,
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
    updateResourceBlob.run(qbPdfBuffer, qbResId);

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
    try {
      fs.writeFileSync(labDiskPath, labPdfBuffer);
    } catch {}

    const labResId = `res-${config.courseId}-lab`;
    insertResource.run(
      labResId,
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
    updateResourceBlob.run(labPdfBuffer, labResId);
  }

  // Pre-seed mapping helper: matches course definitions to institution and branch
  function seedInstitutionCurriculum(
    instId: string,
    instName: string,
    uploaderId: string,
    uploaderName: string,
    filterBranchCodes?: string[]
  ) {
    const coursesToSeed = filterBranchCodes
      ? CORE_CURRICULUM.filter(c => filterBranchCodes.includes(c.branchCode))
      : CORE_CURRICULUM;

    for (const c of coursesToSeed) {
      const branchId = `branch-${instId.replace('inst-', '')}-${c.branchCode.toLowerCase()}`;
      const courseId = `course-${instId.replace('inst-', '')}-${c.courseCode.toLowerCase()}`;

      seedBulkCoursePdfs({
        instId,
        instName,
        branchId,
        branchName: c.branchName,
        branchCode: c.branchCode,
        courseId,
        courseCode: c.courseCode,
        courseName: c.courseName,
        courseDesc: c.courseDesc,
        uploaderId,
        uploaderName,
        units: c.units,
        examQuestions: c.examQuestions,
        labExperiments: c.labExperiments,
        bookRefs: c.bookRefs,
      });
    }
  }

  // =========================================================================
  // 1. PRIMARY EVALUATION INSTITUTIONS (AU, GVPCE, GITAM)
  // =========================================================================

  // Andhra University (College of Engineering)
  seedInstitutionCurriculum(
    'inst-au',
    'Andhra University (College of Engineering)',
    'user-au-admin',
    'AU Department Admin'
  );

  // Gayatri Vidya Parishad College of Engineering (Autonomous)
  seedInstitutionCurriculum(
    'inst-gvpce',
    'Gayatri Vidya Parishad College of Engineering (Autonomous)',
    'user-gvpce-admin',
    'GVPCE Admin'
  );

  // GITAM Deemed to be University
  seedInstitutionCurriculum(
    'inst-gitam',
    'GITAM Deemed to be University',
    'user-gitam-admin',
    'GITAM Academic Admin'
  );

  // =========================================================================
  // 2. PAN-INDIA PREMIER INSTITUTIONS (IITs, NITs, BITS, State Universities)
  // Standard branches (CSE, ECE, EEE, MECH, CIVIL, IT) seeded for all
  // =========================================================================
  const standardBranches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];

  for (const [instId, instName] of indianInstitutions) {
    if (instId === 'inst-au' || instId === 'inst-gvpce' || instId === 'inst-gitam') {
      continue;
    }
    const adminId = `user-${instId.replace('inst-', '')}-admin`;
    const adminName = `${instName} Admin`;

    seedInstitutionCurriculum(
      instId,
      instName,
      adminId,
      adminName,
      standardBranches
    );
  }

  // =========================================================================
  // 3. USER ACCOUNTS (Passwords: 'Password@123')
  // =========================================================================
  const defaultPw = hashPassword('Password@123');
  const insertUser = database.prepare(`
    INSERT OR IGNORE INTO users (id, institution_id, branch_id, course_id, name, email, password_hash, password_salt, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // AU Accounts
  insertUser.run('user-au-admin', 'inst-au', null, null, 'AU Department Admin', 'admin@andhrauniversity.edu.in', defaultPw.hash, defaultPw.salt, 'admin', now);
  insertUser.run('user-au-student', 'inst-au', 'branch-au-cse', 'course-au-cs301', 'Rahul Kalyan', 'student@andhrauniversity.edu.in', defaultPw.hash, defaultPw.salt, 'student', now);

  // GVPCE Accounts
  insertUser.run('user-gvpce-admin', 'inst-gvpce', null, null, 'GVPCE Admin', 'admin@gvpce.ac.in', defaultPw.hash, defaultPw.salt, 'admin', now);
  insertUser.run('user-gvpce-student', 'inst-gvpce', 'branch-gvpce-cse', 'course-gvpce-cs201', 'Priya Varma', 'student@gvpce.ac.in', defaultPw.hash, defaultPw.salt, 'student', now);

  // GITAM Accounts
  insertUser.run('user-gitam-admin', 'inst-gitam', null, null, 'GITAM Academic Admin', 'admin@gitam.edu', defaultPw.hash, defaultPw.salt, 'admin', now);
  insertUser.run('user-gitam-student', 'inst-gitam', 'branch-gitam-cse', 'course-gitam-cs101', 'Siddharth Rao', 'student@gitam.edu', defaultPw.hash, defaultPw.salt, 'student', now);

  // Default accounts for all other colleges
  for (const [instId, instName, , code] of indianInstitutions) {
    if (instId === 'inst-au' || instId === 'inst-gvpce' || instId === 'inst-gitam') {
      continue;
    }
    const cleanCode = code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const adminId = `user-${instId.replace('inst-', '')}-admin`;
    const studentId = `user-${instId.replace('inst-', '')}-student`;
    const cseBranchId = `branch-${instId.replace('inst-', '')}-cse`;
    const cseCourseId = `course-${instId.replace('inst-', '')}-cs201`;

    insertUser.run(adminId, instId, null, null, `${instName} Admin`, `admin@${cleanCode}.edu.in`, defaultPw.hash, defaultPw.salt, 'admin', now);
    insertUser.run(studentId, instId, cseBranchId, cseCourseId, `Student (${code})`, `student@${cleanCode}.edu.in`, defaultPw.hash, defaultPw.salt, 'student', now);
  }

  // Re-enable strict foreign keys and verify integrity
  database.exec('PRAGMA foreign_keys = ON;');
  const fkViolations = database.prepare('PRAGMA foreign_key_check;').all();
  if (fkViolations.length > 0) {
    console.warn('Foreign key check warnings:', fkViolations);
  }

  const institutionsCount = (database.prepare('SELECT COUNT(*) as count FROM institutions').get() as any)?.count || 0;
  const branchesCount = (database.prepare('SELECT COUNT(*) as count FROM branches').get() as any)?.count || 0;
  const coursesCount = (database.prepare('SELECT COUNT(*) as count FROM courses').get() as any)?.count || 0;
  const resourcesCount = (database.prepare('SELECT COUNT(*) as count FROM resources').get() as any)?.count || 0;
  const usersCount = (database.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;

  if (shouldClose) {
    database.close();
  }

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
