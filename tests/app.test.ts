import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptApiKey, decryptApiKey, maskApiKey } from '../src/server/security/encryption';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/server/security/auth';
import { getDb } from '../src/server/db/index';
import { ResourceService } from '../src/server/services/resource.service';
import { getAIProvider, getAvailableProviders } from '../src/server/ai/factory';

test('1. Security: AES-256-GCM Encryption at rest for BYOK keys', () => {
  const sampleKey = 'AIzaSySampleTestKeyForGeminiApi123456789';
  const encrypted = encryptApiKey(sampleKey);

  assert.ok(encrypted.encryptedKey, 'Encrypted key must exist');
  assert.ok(encrypted.iv, 'IV must exist');
  assert.ok(encrypted.authTag, 'Auth tag must exist');
  assert.equal(encrypted.keyHint, '••••••••6789', 'Masked key hint must be generated');

  // Decryption verification
  const decrypted = decryptApiKey(encrypted.encryptedKey, encrypted.iv, encrypted.authTag);
  assert.equal(decrypted, sampleKey, 'Decrypted key must match original plain key');

  // Tamper detection: modified auth tag fails
  assert.throws(() => {
    decryptApiKey(encrypted.encryptedKey, encrypted.iv, '00000000000000000000000000000000');
  }, /Failed to decrypt/);
});

test('2. Security: Password Hashing with Scrypt and Salt', () => {
  const password = 'SuperSecretCollegePassword!2026';
  const { hash, salt } = hashPassword(password);

  assert.ok(hash && salt, 'Hash and salt must be generated');
  assert.equal(verifyPassword(password, hash, salt), true, 'Valid password must verify');
  assert.equal(verifyPassword('WrongPassword', hash, salt), false, 'Incorrect password must fail');
});

test('3. Security: JWT Session Tokens', () => {
  const user = {
    id: 'user-test-1',
    email: 'test@college.edu',
    name: 'Test Student',
    role: 'student' as const,
    institutionId: 'inst-au',
    institutionName: 'Andhra University',
  };

  const token = signToken(user);
  assert.ok(token && typeof token === 'string');

  const verified = verifyToken(token);
  assert.ok(verified);
  assert.equal(verified.id, user.id);
  assert.equal(verified.institutionId, 'inst-au');
  assert.equal(verified.role, 'student');

  // Expired token rejection
  const expiredToken = signToken(user, -10);
  assert.equal(verifyToken(expiredToken), null, 'Expired token must return null');
});

test('4. Access Control: Strict Cross-College Isolation (Enforce 403)', () => {
  const db = getDb();

  // AU Student queries resources
  const auResources = ResourceService.getResources('inst-au');
  assert.ok(auResources.length > 0, 'AU must have seeded study resources');

  // All returned resources must strictly belong to inst-au
  for (const r of auResources) {
    assert.equal(r.institution_id, 'inst-au', 'Resource must belong to user institution');
  }

  // Attempt cross-college access: AU student requests a GVPCE resource
  // Create a GVPCE resource first
  const gvpceCourse = db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-gvpce'").get();
  assert.ok(gvpceCourse, 'GVPCE course must exist');

  const gvpceRes = ResourceService.createResource({
    institutionId: 'inst-gvpce',
    branchId: gvpceCourse.branch_id,
    courseId: gvpceCourse.id,
    title: 'GVPCE Data Structures Lab Manual',
    type: 'link',
    description: 'Internal lab syllabus for GVPCE students only.',
    url: 'https://gvpce.ac.in/ds-lab',
    uploaderId: 'user-gvpce-admin',
    uploaderName: 'GVPCE Admin',
  });

  // Cross-college access MUST throw 403 AuthError
  assert.throws(
    () => {
      ResourceService.getResourceById(gvpceRes.id, 'inst-au');
    },
    (err: any) => {
      return err.status === 403 && err.message.includes('Cross-college access forbidden');
    },
    'Cross-college resource access must return 403 Forbidden'
  );

  // Same institution access must succeed
  const allowed = ResourceService.getResourceById(gvpceRes.id, 'inst-gvpce');
  assert.equal(allowed.id, gvpceRes.id);

  // Cross-college resource creation attempt: attach AU resource to GVPCE course
  assert.throws(
    () => {
      ResourceService.createResource({
        institutionId: 'inst-au',
        branchId: gvpceCourse.branch_id,
        courseId: gvpceCourse.id,
        title: 'Malicious Cross-College Upload',
        type: 'link',
        description: 'Should fail immediately',
        url: 'https://example.com/exploit',
        uploaderId: 'user-au-admin',
        uploaderName: 'AU Admin',
      });
    },
    /Branch does not belong to the selected institution|Course does not belong/
  );

  // Cross-college update attempt: AU admin tries to edit GVPCE resource
  assert.throws(
    () => {
      ResourceService.updateResource(gvpceRes.id, 'inst-au', {
        title: 'Hacked Title',
        description: 'Hacked Description',
      });
    },
    (err: any) => err.status === 403
  );

  // Cross-college delete attempt: AU admin tries to delete GVPCE resource
  assert.throws(
    () => {
      ResourceService.deleteResource(gvpceRes.id, 'inst-au');
    },
    (err: any) => err.status === 403
  );
});

test('5. AI Provider Abstraction: Extensible Multi-Provider Layer', () => {
  const providers = getAvailableProviders();
  assert.equal(providers.length, 3, 'Must support Gemini, OpenAI, and Anthropic');

  const gemini = getAIProvider('gemini');
  assert.equal(gemini.name, 'gemini');
  assert.equal(typeof gemini.search, 'function');
  assert.equal(typeof gemini.summarize, 'function');
  assert.equal(typeof gemini.suggest, 'function');

  const openai = getAIProvider('openai');
  assert.equal(openai.name, 'openai');

  const anthropic = getAIProvider('anthropic');
  assert.equal(anthropic.name, 'anthropic');
});

test('6. Admin Upload Flow & Resource Lifecycle', () => {
  const db = getDb();
  const auCourse = db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-au'").get() as any;

  // 1. Create a link resource
  const linkRes = ResourceService.createResource({
    institutionId: 'inst-au',
    branchId: auCourse.branch_id,
    courseId: auCourse.id,
    title: 'Operating Systems Research Papers (ACM)',
    type: 'link',
    description: 'Curated ACM operating systems research archive.',
    url: 'https://dl.acm.org/sig/sigops',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
  });

  assert.ok(linkRes.id);
  assert.equal(linkRes.type, 'link');

  // 2. Edit resource
  const updated = ResourceService.updateResource(linkRes.id, 'inst-au', {
    title: 'Operating Systems Research Papers (ACM & IEEE)',
    description: 'Updated description for research papers.',
  });
  assert.equal(updated.title, 'Operating Systems Research Papers (ACM & IEEE)');

  // 3. Delete resource
  const deleted = ResourceService.deleteResource(linkRes.id, 'inst-au');
  assert.equal(deleted, true);

  // 4. Verify deleted
  assert.throws(() => {
    ResourceService.getResourceById(linkRes.id, 'inst-au');
  }, /Resource not found/);
});

test('7. Admin Branch and Course Management', () => {
  const db = getDb();
  // Create a new branch
  const newBranch = {
    id: 'branch-au-me',
    institution_id: 'inst-au',
    name: 'Mechanical Engineering',
    code: 'MECH',
    created_at: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO branches (id, institution_id, name, code, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(newBranch.id, newBranch.institution_id, newBranch.name, newBranch.code, newBranch.created_at);

  const fetched = db.prepare('SELECT * FROM branches WHERE id = ?').get(newBranch.id) as any;
  assert.equal(fetched.name, 'Mechanical Engineering');

  // Clean up
  db.prepare('DELETE FROM branches WHERE id = ?').run(newBranch.id);
});

test('8. Student & Admin Account Registration with Institution Scope', () => {
  const db = getDb();
  const testEmail = `newstudent_${Date.now()}@andhrauniversity.edu.in`;
  const { hash, salt } = hashPassword('TestPass@123');
  const userId = `user-reg-test-${Date.now()}`;

  db.prepare(`
    INSERT INTO users (id, institution_id, branch_id, course_id, name, email, password_hash, password_salt, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'inst-au',
    'branch-au-cse',
    'course-au-os',
    'Pooja Verma',
    testEmail,
    hash,
    salt,
    'student',
    new Date().toISOString()
  );

  const registered = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  assert.equal(registered.email, testEmail);
  assert.equal(registered.institution_id, 'inst-au');
  assert.equal(registered.branch_id, 'branch-au-cse');
  assert.equal(registered.role, 'student');

  // Verify password matches
  assert.equal(verifyPassword('TestPass@123', registered.password_hash, registered.password_salt), true);

  // Clean up
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
});

test('9. Storage: Academic PDF Document Generation & Format Validation', () => {
  const { buildAcademicPdf } = require('../src/server/utils/pdf-generator');
  const buffer = buildAcademicPdf({
    institution: 'Andhra University',
    branch: 'Computer Science and Engineering',
    courseCode: 'CS301',
    courseName: 'Operating Systems',
    title: 'Process Management Lecture Notes',
  });

  assert.ok(buffer && buffer.length > 500, 'PDF buffer must have valid size');
  assert.equal(buffer.subarray(0, 8).toString('utf-8'), '%PDF-1.4', 'Must start with valid %PDF-1.4 header');
  assert.ok(buffer.toString('binary').includes('%%EOF'), 'Must end with standard %%EOF trailer');
});

test('10. Multi-Tenant: Pan-India College Registration', () => {
  const { InstitutionService } = require('../src/server/services/institution.service');
  const uniqueCode = `TEST-${Date.now()}`;
  const inst = InstitutionService.createInstitution('National Institute of Advanced Studies', uniqueCode, 'NIAS');

  assert.ok(inst.id);
  assert.equal(inst.code, uniqueCode);
  assert.equal(inst.name, 'National Institute of Advanced Studies');

  // Verify fetch
  const all = InstitutionService.getAllInstitutions();
  assert.ok(all.some((i: any) => i.id === inst.id));

  // Clean up
  const db = getDb();
  db.prepare('DELETE FROM institutions WHERE id = ?').run(inst.id);
});

test('11. Database: Case-insensitive Email Uniqueness and Transaction Operations', () => {
  const db = getDb();
  const testEmail = `case_test_${Date.now()}@college.edu`;
  const { hash, salt } = hashPassword('Secret123');
  const userId1 = `user-case-1-${Date.now()}`;
  const userId2 = `user-case-2-${Date.now()}`;

  // Insert original email
  db.prepare(`
    INSERT INTO users (id, institution_id, name, email, password_hash, password_salt, role, created_at)
    VALUES (?, 'inst-au', 'Case Student', ?, ?, ?, 'student', ?)
  `).run(userId1, testEmail.toLowerCase(), hash, salt, new Date().toISOString());

  // Attempt to insert duplicate with UPPERCASE email
  assert.throws(() => {
    db.prepare(`
      INSERT INTO users (id, institution_id, name, email, password_hash, password_salt, role, created_at)
      VALUES (?, 'inst-au', 'Case Student Duplicate', ?, ?, ?, 'student', ?)
    `).run(userId2, testEmail.toUpperCase(), hash, salt, new Date().toISOString());
  }, /UNIQUE constraint failed/);

  // Clean up
  db.prepare('DELETE FROM users WHERE id = ?').run(userId1);
});



