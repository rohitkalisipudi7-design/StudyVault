import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { setupTestEnvironment } from './setup';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { POST as signupHandler } from '../src/app/api/auth/signup/route';
import { GET as downloadHandler } from '../src/app/api/resources/[id]/download/route';
import { GET as resourcesHandler, POST as resourceUploadHandler } from '../src/app/api/resources/route';
import { GET as coursesHandler, POST as courseCreateHandler } from '../src/app/api/courses/route';
import { ResourceService } from '../src/server/services/resource.service';
import { InstitutionService } from '../src/server/services/institution.service';
import { validateFileBuffer } from '../src/server/security/file-validator';
import { uploadToObjectStorage } from '../src/server/storage/minio';
import { signToken, verifyToken, hashPassword, verifyPassword } from '../src/server/security/auth';
import { encryptApiKey, decryptApiKey, maskApiKey } from '../src/server/security/encryption';
import { initializeDatabase } from '../src/server/db/init';

const env = setupTestEnvironment();
after(() => env.cleanup());

// ============================================================================
// 1. NORMAL USER SCENARIOS
// ============================================================================
test('QA 1. Normal User Scenarios: End-to-end student & admin workflows', async () => {
  // 1.1 Student Registration
  const studentEmail = `qa_student_${Date.now()}@andhrauniversity.edu.in`;
  const signupReq = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionId: 'inst-au',
      branchId: 'branch-au-cse',
      courseId: 'course-au-cs301',
      name: 'QA Test Student',
      email: studentEmail,
      password: 'StudentPassword@123',
    }),
  });
  const signupRes = await signupHandler(signupReq);
  const signupData = await signupRes.json();
  assert.ok(signupRes.status === 200 || signupRes.status === 201, 'Signup must return 200 OK or 201 Created');
  assert.ok(signupData.token, 'Signup must issue JWT token');
  assert.equal(signupData.user.email, studentEmail.toLowerCase());

  // 1.2 Student Login
  const loginReq = new NextRequest('http://localhost:8004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'StudentPassword@123',
    }),
  });
  const loginRes = await loginHandler(loginReq);
  const loginData = await loginRes.json();
  assert.equal(loginRes.status, 200, 'Login must return 200 OK');
  assert.ok(loginData.token, 'Login must return JWT token');
  const studentToken = loginData.token;

  // 1.3 Browse Institution Courses
  const coursesReq = new NextRequest('http://localhost:8004/api/courses?branchId=branch-au-cse', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const coursesRes = await coursesHandler(coursesReq);
  const coursesData = await coursesRes.json();
  assert.equal(coursesRes.status, 200);
  assert.ok(coursesData.courses.length > 0, 'Must return courses for enrolled branch');

  // 1.4 Browse Study Resources
  const resReq = new NextRequest('http://localhost:8004/api/resources?branchId=branch-au-cse', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const resRes = await resourcesHandler(resReq);
  const resData = await resRes.json();
  assert.equal(resRes.status, 200);
  assert.ok(resData.resources.length > 0, 'Must return syllabus study resources');

  // 1.5 Download Syllabus Notes
  const firstResource = resData.resources[0];
  const dlReq = new NextRequest(`http://localhost:8004/api/resources/${firstResource.id}/download`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const dlRes = await downloadHandler(dlReq, { params: Promise.resolve({ id: firstResource.id }) });
  assert.equal(dlRes.status, 200, 'Download must return 200 OK');
  assert.equal(dlRes.headers.get('content-type'), 'application/pdf');
  const buffer = await dlRes.arrayBuffer();
  assert.ok(buffer.byteLength > 500, 'Downloaded file must contain valid PDF bytes');
});

// ============================================================================
// 2. INVALID INPUTS
// ============================================================================
test('QA 2. Invalid Inputs: System gracefully rejects malformed requests', async () => {
  // 2.1 Login with wrong password
  const badPwReq = new NextRequest('http://localhost:8004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@andhrauniversity.edu.in', password: 'WrongPassword999' }),
  });
  const badPwRes = await loginHandler(badPwReq);
  assert.equal(badPwRes.status, 401, 'Wrong password must return 401');

  // 2.2 Login with non-existent user
  const noUserReq = new NextRequest('http://localhost:8004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doesnotexist@unknown.edu', password: 'Password@123' }),
  });
  const noUserRes = await loginHandler(noUserReq);
  assert.equal(noUserRes.status, 401, 'Non-existent email must return 401');

  // 2.3 Signup with invalid email format
  const badEmailReq = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionId: 'inst-au',
      name: 'Invalid Email User',
      email: 'not-an-email-address',
      password: 'Password@123',
    }),
  });
  const badEmailRes = await signupHandler(badEmailReq);
  assert.equal(badEmailRes.status, 400, 'Invalid email must return 400');

  // 2.4 Non-existent resource ID lookup
  const auAdminToken = signToken({
    id: 'user-au-admin',
    email: 'admin@andhrauniversity.edu.in',
    name: 'AU Admin',
    role: 'admin',
    institutionId: 'inst-au',
  });
  const fakeIdReq = new NextRequest('http://localhost:8004/api/resources/res-non-existent-9999/download', {
    headers: { Authorization: `Bearer ${auAdminToken}` },
  });
  const fakeIdRes = await downloadHandler(fakeIdReq, { params: Promise.resolve({ id: 'res-non-existent-9999' }) });
  assert.equal(fakeIdRes.status, 404, 'Non-existent resource download must return 404');

  // 2.5 Link creation with dangerous protocol (e.g. javascript:)
  assert.throws(() => {
    ResourceService.createResource({
      institutionId: 'inst-au',
      branchId: 'branch-au-cse',
      courseId: 'course-au-cs301',
      title: 'XSS Attempt',
      type: 'link',
      url: 'javascript:alert(1)',
      uploaderId: 'user-au-admin',
      uploaderName: 'AU Admin',
    });
  }, /valid URL/);
});

// ============================================================================
// 3. EMPTY INPUTS
// ============================================================================
test('QA 3. Empty Inputs: System enforces required field constraints', async () => {
  // 3.1 Empty login payload
  const emptyLoginReq = new NextRequest('http://localhost:8004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  const emptyLoginRes = await loginHandler(emptyLoginReq);
  assert.equal(emptyLoginRes.status, 400, 'Empty email/password must return 400');

  // 3.2 Empty signup payload
  const emptySignupReq = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const emptySignupRes = await signupHandler(emptySignupReq);
  assert.equal(emptySignupRes.status, 400, 'Missing signup fields must return 400');

  // 3.3 Create Course with empty code/name
  const auAdminToken = signToken({
    id: 'user-au-admin',
    email: 'admin@andhrauniversity.edu.in',
    name: 'AU Admin',
    role: 'admin',
    institutionId: 'inst-au',
  });
  const emptyCourseReq = new NextRequest('http://localhost:8004/api/courses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${auAdminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ branchId: 'branch-au-cse', name: '', code: '' }),
  });
  const emptyCourseRes = await courseCreateHandler(emptyCourseReq);
  assert.equal(emptyCourseRes.status, 400, 'Empty course name/code must return 400');

  // 3.4 Empty file buffer validation
  const emptyValidation = validateFileBuffer(Buffer.alloc(0), 'empty_lecture.pdf');
  assert.equal(emptyValidation.isValid, false, 'Empty buffer must be rejected');
});

// ============================================================================
// 4. DUPLICATE SUBMISSIONS
// ============================================================================
test('QA 4. Duplicate Submissions: Strict uniqueness and idempotent seeding', async () => {
  const existingEmail = `duplicate_test_${Date.now()}@au.edu`;

  // 4.1 First signup succeeds
  const signup1Req = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionId: 'inst-au',
      name: 'Student Original',
      email: existingEmail,
      password: 'Password@123',
    }),
  });
  const res1 = await signupHandler(signup1Req);
  assert.ok(res1.status === 200 || res1.status === 201);

  // 4.2 Duplicate exact email fails with 409 Conflict
  const signup2Req = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionId: 'inst-au',
      name: 'Student Duplicate',
      email: existingEmail,
      password: 'Password@123',
    }),
  });
  const res2 = await signupHandler(signup2Req);
  assert.equal(res2.status, 409, 'Duplicate signup must return 409 Conflict');

  // 4.3 Duplicate uppercase email fails with 409 Conflict (case-insensitive email guarantee)
  const signup3Req = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionId: 'inst-au',
      name: 'Student Case Insensitive',
      email: existingEmail.toUpperCase(),
      password: 'Password@123',
    }),
  });
  const res3 = await signupHandler(signup3Req);
  assert.equal(res3.status, 409, 'Uppercase duplicate email must return 409 Conflict');

  // 4.4 Idempotent database initialization preserves existing users without clobbering
  initializeDatabase(env.db);
  const userCheck = env.db.prepare('SELECT email FROM users WHERE email = ?').get(existingEmail.toLowerCase());
  assert.ok(userCheck, 'User must persist through repeated database seeding');
});

// ============================================================================
// 5. NETWORK / PROVIDER ERROR HANDLING
// ============================================================================
test('QA 5. Network & Provider Failures: Clean recovery without credential leaks', async () => {
  // 5.1 Simulated tampered JWT token returns null without throwing or leaking
  const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.tamperedsignature';
  assert.equal(verifyToken(tamperedToken), null, 'Tampered token must fail verification and return null');

  // 5.2 Expired JWT token handling returns null
  const expiredToken = signToken(
    { id: 'user-expired', email: 'exp@college.edu', name: 'Exp', role: 'student', institutionId: 'inst-au' },
    -10 // expired 10 seconds ago
  );
  assert.equal(verifyToken(expiredToken), null, 'Expired token must fail verification and return null');

  // 5.3 BYOK API Key masking guarantees key never leaks in UI or logs
  const rawKey = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6';
  const masked = maskApiKey(rawKey);
  assert.equal(masked.includes('A1B2C3'), false, 'Key body must never be exposed');
  assert.equal(masked.endsWith('O5P6'), true, 'Only last 4 characters are preserved');
});

// ============================================================================
// 6. MULTIPLE USERS & MULTI-TENANCY ISOLATION
// ============================================================================
test('QA 6. Multi-Tenancy: Strict cross-college data isolation', async () => {
  const auStudentToken = signToken({
    id: 'user-au-student',
    email: 'student@andhrauniversity.edu.in',
    name: 'AU Student',
    role: 'student',
    institutionId: 'inst-au',
  });

  const gvpceStudentToken = signToken({
    id: 'user-gvpce-student',
    email: 'student@gvpce.ac.in',
    name: 'GVPCE Student',
    role: 'student',
    institutionId: 'inst-gvpce',
  });

  // 6.1 AU Student fetches resources
  const auReq = new NextRequest('http://localhost:8004/api/resources', {
    headers: { Authorization: `Bearer ${auStudentToken}` },
  });
  const auRes = await resourcesHandler(auReq);
  const auData = await auRes.json();
  assert.ok(auData.resources.length > 0);
  assert.ok(auData.resources.every((r: any) => r.institution_id === 'inst-au'), 'AU student must only see AU data');

  // 6.2 GVPCE Student fetches resources
  const gvpceReq = new NextRequest('http://localhost:8004/api/resources', {
    headers: { Authorization: `Bearer ${gvpceStudentToken}` },
  });
  const gvpceRes = await resourcesHandler(gvpceReq);
  const gvpceData = await gvpceRes.json();
  assert.ok(gvpceData.resources.length > 0);
  assert.ok(gvpceData.resources.every((r: any) => r.institution_id === 'inst-gvpce'), 'GVPCE student must only see GVPCE data');

  // 6.3 Disjoint Resource Pools: Zero overlap between AU and GVPCE
  const auIds = new Set(auData.resources.map((r: any) => r.id));
  for (const gr of gvpceData.resources) {
    assert.equal(auIds.has(gr.id), false, `Resource ${gr.id} must not appear in AU resource pool`);
  }
});

// ============================================================================
// 7. ACCESS PERMISSIONS (RBAC & CROSS-COLLEGE SCOPING)
// ============================================================================
test('QA 7. Access Permissions: Cross-college actions return 403 Forbidden', async () => {
  const gvpceResource = env.db.prepare("SELECT * FROM resources WHERE institution_id = 'inst-gvpce' LIMIT 1").get() as any;
  const auResource = env.db.prepare("SELECT * FROM resources WHERE institution_id = 'inst-au' LIMIT 1").get() as any;
  assert.ok(gvpceResource && auResource);

  const auStudentToken = signToken({
    id: 'user-au-student',
    email: 'student@andhrauniversity.edu.in',
    name: 'AU Student',
    role: 'student',
    institutionId: 'inst-au',
  });

  // 7.1 Cross-College Resource Download -> 403 Forbidden
  const crossDlReq = new NextRequest(`http://localhost:8004/api/resources/${gvpceResource.id}/download`, {
    headers: { Authorization: `Bearer ${auStudentToken}` },
  });
  const crossDlRes = await downloadHandler(crossDlReq, { params: Promise.resolve({ id: gvpceResource.id }) });
  assert.equal(crossDlRes.status, 403, 'Cross-college download must return 403 Forbidden');

  // 7.2 Cross-College Resource Lookup via Service -> throws 403
  assert.throws(() => {
    ResourceService.getResourceById(gvpceResource.id, 'inst-au');
  }, /Cross-college access forbidden/);

  // 7.3 Cross-College Resource Deletion -> throws 403
  assert.throws(() => {
    ResourceService.deleteResource(gvpceResource.id, 'inst-au');
  }, /Cross-college access forbidden/);

  // 7.4 Cross-College Resource Mutation: Attach AU resource to GVPCE branch -> throws Error
  assert.throws(() => {
    ResourceService.createResource({
      institutionId: 'inst-au',
      branchId: 'branch-gvpce-cse', // foreign branch!
      courseId: 'course-gvpce-cs201',
      title: 'Illicit Resource',
      type: 'link',
      url: 'https://example.com/notes',
      uploaderId: 'user-au-student',
      uploaderName: 'AU Student',
    });
  }, /Branch does not belong/);
});

// ============================================================================
// 8. EXISTING FEATURE COMPATIBILITY
// ============================================================================
test('QA 8. Feature Compatibility: Pan-India curricula & BYOK Encryption', () => {
  // 8.1 Encryption at rest with AES-256-GCM
  const secretKey = 'sk-ant-api03-live-test-byok-token-12345678';
  const enc = encryptApiKey(secretKey);
  assert.ok(enc.encryptedKey && enc.iv && enc.authTag);
  const dec = decryptApiKey(enc.encryptedKey, enc.iv, enc.authTag);
  assert.equal(dec, secretKey, 'Decrypted key must match original');

  // 8.2 Passwords hashed with Scrypt (RFC 7914) with unique salts
  const pw = 'CollegeAdminPass!2026';
  const h1 = hashPassword(pw);
  const h2 = hashPassword(pw);
  assert.notEqual(h1.salt, h2.salt, 'Unique salts must be generated per password');
  assert.equal(verifyPassword(pw, h1.hash, h1.salt), true);
  assert.equal(verifyPassword(pw, h2.hash, h2.salt), true);

  // 8.3 Curriculum verification: All standard branches present for Pan-India institutions
  const branches = env.db.prepare("SELECT code FROM branches WHERE institution_id = 'inst-iitb'").all() as any[];
  const branchCodes = new Set(branches.map(b => b.code));
  assert.ok(branchCodes.has('CSE'));
  assert.ok(branchCodes.has('ECE'));
  assert.ok(branchCodes.has('MECH'));
});

// ============================================================================
// 9. SECURITY & PRIVACY CHECKS
// ============================================================================
test('QA 9. Security & Privacy: Magic byte validation and zero SQLite BLOB bloat', async () => {
  // 9.1 Block HTML payload disguised as .pdf
  const htmlSpoof = Buffer.from('<!doctype html><html><script>window.location="evil.com"</script></html>');
  const htmlRes = validateFileBuffer(htmlSpoof, 'syllabus.pdf');
  assert.equal(htmlRes.isValid, false, 'HTML spoof must be rejected');
  assert.equal(htmlRes.detectedMime, 'text/html');

  // 9.2 Block Windows executable disguised as .pdf
  const exeSpoof = Buffer.from([0x4d, 0x5a, 0x00, 0x00, 0x00]);
  const exeRes = validateFileBuffer(exeSpoof, 'notes.pdf');
  assert.equal(exeRes.isValid, false, 'Executable spoof must be rejected');
  assert.equal(exeRes.detectedMime, 'application/x-dosexec');

  // 9.3 Block Linux ELF binary disguised as .pdf
  const elfSpoof = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x01]);
  const elfRes = validateFileBuffer(elfSpoof, 'assignment.pdf');
  assert.equal(elfRes.isValid, false, 'ELF spoof must be rejected');
  assert.equal(elfRes.detectedMime, 'application/x-executable');

  // 9.4 Block SVG script disguised as .pdf
  const svgSpoof = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
  const svgRes = validateFileBuffer(svgSpoof, 'diagram.pdf');
  assert.equal(svgRes.isValid, false, 'SVG spoof must be rejected');

  // 9.5 Confirm zero SQLite BLOB bloat: all file_data values are NULL
  const blobCheck = env.db.prepare('SELECT COUNT(*) as count FROM resources WHERE file_data IS NOT NULL').get() as any;
  assert.equal(blobCheck.count, 0, 'Zero raw BLOBs must exist in SQLite database');

  // 9.6 Password hash verification in users table: No plain passwords
  const usersWithPlain = env.db.prepare("SELECT * FROM users WHERE password_hash = 'Password@123'").all();
  assert.equal(usersWithPlain.length, 0, 'Plain text passwords must never be stored in database');
});
