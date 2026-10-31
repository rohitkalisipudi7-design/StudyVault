import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { setupTestEnvironment } from './setup';
import { initializeDatabase } from '../src/server/db/init';
import { hashPassword } from '../src/server/security/auth';
import { ResourceService } from '../src/server/services/resource.service';
import { InstitutionService } from '../src/server/services/institution.service';

const env = setupTestEnvironment();
after(() => env.cleanup());

test('1. Database: PRAGMAs foreign_keys and busy_timeout are enabled', () => {
  const fk = env.db.prepare('PRAGMA foreign_keys;').get() as any;
  assert.equal(fk.foreign_keys, 1, 'Foreign keys must be enabled');

  const timeout = env.db.prepare('PRAGMA busy_timeout;').get() as any;
  assert.equal(timeout.timeout, 5000, 'Busy timeout must be set to 5000ms');
});

test('2. Database: Safe idempotent seeding preserves user data', () => {
  // Add a custom user and custom resource
  const customEmail = `user_persist_${Date.now()}@custom.edu`;
  const { hash, salt } = hashPassword('PersistPass@123');
  const userId = `custom-user-${Date.now()}`;

  env.db.prepare(`
    INSERT INTO users (id, institution_id, name, email, password_hash, password_salt, role, created_at)
    VALUES (?, 'inst-au', 'Persist User', ?, ?, ?, 'student', ?)
  `).run(userId, customEmail, hash, salt, new Date().toISOString());

  // Rerun database initialization
  initializeDatabase(env.db);

  // Verify custom user was NOT wiped
  const userAfter = env.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  assert.ok(userAfter, 'Custom user must still exist after re-seeding');
  assert.equal(userAfter.email, customEmail);
});

test('3. Database: Case-insensitive UNIQUE constraint on email', () => {
  const baseEmail = `unique_student_${Date.now()}@college.edu`;
  const { hash, salt } = hashPassword('Pass123');

  env.db.prepare(`
    INSERT INTO users (id, institution_id, name, email, password_hash, password_salt, role, created_at)
    VALUES (?, 'inst-au', 'Student A', ?, ?, ?, 'student', ?)
  `).run(`u1-${Date.now()}`, baseEmail.toLowerCase(), hash, salt, new Date().toISOString());

  // Attempt duplicate insert with UPPERCASE email
  assert.throws(() => {
    env.db.prepare(`
      INSERT INTO users (id, institution_id, name, email, password_hash, password_salt, role, created_at)
      VALUES (?, 'inst-au', 'Student B', ?, ?, ?, 'student', ?)
    `).run(`u2-${Date.now()}`, baseEmail.toUpperCase(), hash, salt, new Date().toISOString());
  }, /UNIQUE constraint failed/);
});

test('4. Database: Atomic transactions for multi-step operations', () => {
  // Institution registration with admin
  const code = `TX-INST-${Date.now()}`;
  const adminEmail = `admin_${Date.now()}@txcollege.edu`;

  const result = InstitutionService.registerInstitutionWithAdmin({
    institutionName: 'Transactional College of Technology',
    institutionCode: code,
    shortName: 'TCT',
    adminName: 'TX Admin',
    adminEmail,
    adminPassword: 'Password@123',
  });

  assert.ok(result.institution.id);
  assert.ok(result.adminUser.id);

  // Verify both exist in DB
  const instCheck = env.db.prepare('SELECT * FROM institutions WHERE id = ?').get(result.institution.id);
  const adminCheck = env.db.prepare('SELECT * FROM users WHERE id = ?').get(result.adminUser.id);
  assert.ok(instCheck);
  assert.ok(adminCheck);
});

test('5. Database: Resource deletion removes physical file from disk', () => {
  const auCourse = env.db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-au'").get() as any;

  // Create temporary file
  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const dummyFileName = `test-delete-${Date.now()}.pdf`;
  const dummyFilePath = path.join(uploadDir, dummyFileName);
  fs.writeFileSync(dummyFilePath, '%PDF-1.4 mock content %%EOF');

  assert.ok(fs.existsSync(dummyFilePath), 'Test file must exist on disk before deletion');

  // Create resource referencing the file
  const fileRes = ResourceService.createResource({
    institutionId: 'inst-au',
    branchId: auCourse.branch_id,
    courseId: auCourse.id,
    title: 'File To Delete Test',
    type: 'file',
    filePath: `/uploads/${dummyFileName}`,
    fileName: dummyFileName,
    fileSize: '32 B',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Admin',
  });

  // Delete resource
  const deleted = ResourceService.deleteResource(fileRes.id, 'inst-au');
  assert.equal(deleted, true);

  // File on disk MUST be deleted
  assert.equal(fs.existsSync(dummyFilePath), false, 'Disk file must be deleted when resource is removed');
});
