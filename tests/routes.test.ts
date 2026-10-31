import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { setupTestEnvironment } from './setup';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { POST as signupHandler } from '../src/app/api/auth/signup/route';
import { GET as downloadHandler } from '../src/app/api/resources/[id]/download/route';
import { POST as aiSearchHandler } from '../src/app/api/ai/search/route';
import { signToken } from '../src/server/security/auth';
import { ResourceService } from '../src/server/services/resource.service';

const env = setupTestEnvironment();
after(() => env.cleanup());

test('1. Routes: /api/auth/login handles valid and invalid credentials', async () => {
  // Test valid login with pre-seeded AU student
  const validReq = new NextRequest('http://localhost:8004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@andhrauniversity.edu.in',
      password: 'Password@123',
    }),
  });

  const validRes = await loginHandler(validReq);
  assert.equal(validRes.status, 200);
  const validJson = await validRes.json();
  assert.equal(validJson.success, true);
  assert.equal(validJson.user.email, 'student@andhrauniversity.edu.in');
  assert.equal(validJson.user.institutionId, 'inst-au');

  // Verify auth_token cookie is set
  const setCookie = validRes.headers.get('set-cookie');
  assert.ok(setCookie && setCookie.includes('auth_token='), 'Must set auth_token cookie');

  // Test invalid password -> 401
  const badPassReq = new NextRequest('http://localhost:8004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@andhrauniversity.edu.in',
      password: 'WrongPassword!',
    }),
  });
  const badPassRes = await loginHandler(badPassReq);
  assert.equal(badPassRes.status, 401);

  // Test missing fields -> 400
  const missingReq = new NextRequest('http://localhost:8004/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'only@email.com' }),
  });
  const missingRes = await loginHandler(missingReq);
  assert.equal(missingRes.status, 400);
});

test('2. Routes: /api/auth/signup registers student within institution', async () => {
  const newEmail = `route_student_${Date.now()}@andhrauniversity.edu.in`;
  const auCourse = env.db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-au'").get() as any;

  const signupReq = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Route Test Student',
      email: newEmail,
      password: 'SecurePassword@123',
      institutionId: 'inst-au',
      branchId: auCourse.branch_id,
      courseId: auCourse.id,
      role: 'student',
    }),
  });

  const signupRes = await signupHandler(signupReq);
  assert.ok(signupRes.status === 200 || signupRes.status === 201);
  const signupJson = await signupRes.json();
  assert.equal(signupJson.success, true);
  assert.equal(signupJson.user.email, newEmail.toLowerCase());

  // Test duplicate email -> 409
  const dupReq = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Student',
      email: newEmail,
      password: 'SecurePassword@123',
      institutionId: 'inst-au',
    }),
  });
  const dupRes = await signupHandler(dupReq);
  assert.equal(dupRes.status, 409);

  // Test cross-college branch/course signup -> 400
  const gvpCourse = env.db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-gvpce'").get() as any;
  const crossSignupReq = new NextRequest('http://localhost:8004/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Cross College Student',
      email: `cross_${Date.now()}@test.edu`,
      password: 'SecurePassword@123',
      institutionId: 'inst-au',
      branchId: gvpCourse.branch_id,
      courseId: gvpCourse.id,
    }),
  });
  const crossSignupRes = await signupHandler(crossSignupReq);
  assert.equal(crossSignupRes.status, 400);
});

test('3. Routes: /api/resources/[id]/download enforces 401, 403, and 200', async () => {
  // 1. Get an existing AU resource and a GVPCE resource
  const auRes = ResourceService.getResources('inst-au')[0];
  const gvpceRes = ResourceService.getResources('inst-gvpce')[0];

  assert.ok(auRes, 'AU resource must exist');
  assert.ok(gvpceRes, 'GVPCE resource must exist');

  // Case A: Unauthenticated request -> 401
  const unauthReq = new NextRequest(`http://localhost:8004/api/resources/${auRes.id}/download`);
  const unauthRes = await downloadHandler(unauthReq, { params: Promise.resolve({ id: auRes.id }) });
  assert.equal(unauthRes.status, 401);

  // Create token for AU student
  const auUserToken = signToken({
    id: 'user-au-student-1',
    email: 'student@andhrauniversity.edu.in',
    name: 'AU Student',
    role: 'student',
    institutionId: 'inst-au',
    institutionName: 'Andhra University',
  });

  // Case B: Cross-college download attempt (AU student downloads GVPCE resource) -> 403
  const crossReq = new NextRequest(`http://localhost:8004/api/resources/${gvpceRes.id}/download`, {
    headers: {
      Authorization: `Bearer ${auUserToken}`,
    },
  });
  const crossRes = await downloadHandler(crossReq, { params: Promise.resolve({ id: gvpceRes.id }) });
  assert.equal(crossRes.status, 403);

  // Case C: Legitimate own-college download -> 200 (or 307/308 redirect if link)
  const ownReq = new NextRequest(`http://localhost:8004/api/resources/${auRes.id}/download`, {
    headers: {
      Authorization: `Bearer ${auUserToken}`,
    },
  });
  const ownRes = await downloadHandler(ownReq, { params: Promise.resolve({ id: auRes.id }) });
  assert.ok(ownRes.status === 200 || ownRes.status === 307 || ownRes.status === 308);
  if (ownRes.status === 200) {
    assert.equal(ownRes.headers.get('content-type'), 'application/pdf');
  }
});

test('4. Routes: /api/ai/search enforces auth, validation, and BYOK key requirement', async () => {
  // Case A: Unauthenticated -> 401
  const unauthReq = new NextRequest('http://localhost:8004/api/ai/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'Operating Systems notes' }),
  });
  const unauthRes = await aiSearchHandler(unauthReq);
  assert.equal(unauthRes.status, 401);

  // Auth token for AU student
  const auToken = signToken({
    id: 'user-au-student-ai-test',
    email: 'student@andhrauniversity.edu.in',
    name: 'AU Student',
    role: 'student',
    institutionId: 'inst-au',
    institutionName: 'Andhra University',
  });

  // Case B: Missing query -> 400
  const emptyQueryReq = new NextRequest('http://localhost:8004/api/ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auToken}`,
    },
    body: JSON.stringify({ query: '   ' }),
  });
  const emptyQueryRes = await aiSearchHandler(emptyQueryReq);
  assert.equal(emptyQueryRes.status, 400);

  // Case C: Oversized query (> 1,000 characters) -> 400
  const oversizedReq = new NextRequest('http://localhost:8004/api/ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auToken}`,
    },
    body: JSON.stringify({ query: 'Z'.repeat(1050) }),
  });
  const oversizedRes = await aiSearchHandler(oversizedReq);
  assert.equal(oversizedRes.status, 400);

  // Case D: Authenticated user without BYOK key -> 400 (guided error message)
  const noKeyReq = new NextRequest('http://localhost:8004/api/ai/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auToken}`,
    },
    body: JSON.stringify({ query: 'Operating Systems deadlock prevention' }),
  });
  const noKeyRes = await aiSearchHandler(noKeyReq);
  assert.equal(noKeyRes.status, 400);
  const noKeyJson = await noKeyRes.json();
  assert.equal(noKeyJson.success, false);
  assert.ok(noKeyJson.error.includes('No AI'));
});
