import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment } from './setup';
import { ResourceService } from '../src/server/services/resource.service';
import { InstitutionService } from '../src/server/services/institution.service';

const env = setupTestEnvironment();
after(() => env.cleanup());

test('1. Multi-Tenancy: Scoped queries return only user college resources', () => {
  const auResources = ResourceService.getResources('inst-au');
  assert.ok(auResources.length > 0, 'AU must have seeded study resources');

  for (const r of auResources) {
    assert.equal(r.institution_id, 'inst-au', 'Resource must belong to user institution');
  }

  const gvpceResources = ResourceService.getResources('inst-gvpce');
  assert.ok(gvpceResources.length > 0, 'GVPCE must have seeded study resources');

  for (const r of gvpceResources) {
    assert.equal(r.institution_id, 'inst-gvpce', 'Resource must belong to user institution');
  }
});

test('2. Multi-Tenancy: Cross-college resource lookup throws 403 Forbidden', () => {
  const gvpceCourse = env.db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-gvpce'").get() as any;
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

  // Cross-college access from AU must throw 403 AuthError
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
});

test('3. Multi-Tenancy: Cross-college resource mutation is blocked (create, update, delete)', () => {
  const gvpceCourse = env.db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-gvpce'").get() as any;
  const auCourse = env.db.prepare("SELECT id, branch_id FROM courses WHERE institution_id = 'inst-au'").get() as any;

  // Cross-college creation: attach AU resource to GVPCE course
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

  // Create an AU resource
  const auRes = ResourceService.createResource({
    institutionId: 'inst-au',
    branchId: auCourse.branch_id,
    courseId: auCourse.id,
    title: 'AU Compiler Design Notes',
    type: 'link',
    description: 'Internal compiler notes.',
    url: 'https://andhrauniversity.edu.in/cd',
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Admin',
  });

  // Cross-college update: GVPCE admin tries to update AU resource
  assert.throws(
    () => {
      ResourceService.updateResource(auRes.id, 'inst-gvpce', {
        title: 'Tampered Title',
      });
    },
    (err: any) => err.status === 403
  );

  // Cross-college delete: GVPCE admin tries to delete AU resource
  assert.throws(
    () => {
      ResourceService.deleteResource(auRes.id, 'inst-gvpce');
    },
    (err: any) => err.status === 403
  );

  // Legitimate update by AU admin succeeds
  const updated = ResourceService.updateResource(auRes.id, 'inst-au', {
    title: 'AU Compiler Design Notes (Updated)',
  });
  assert.equal(updated.title, 'AU Compiler Design Notes (Updated)');

  // Legitimate delete by AU admin succeeds
  const deleted = ResourceService.deleteResource(auRes.id, 'inst-au');
  assert.equal(deleted, true);
});

test('4. Multi-Tenancy: Pan-India institution registration maintains isolation', () => {
  const uniqueCode = `TEST-INST-${Date.now()}`;
  const inst = InstitutionService.createInstitution('Indian Institute of Science', uniqueCode, 'IISc');

  assert.ok(inst.id);
  assert.equal(inst.code, uniqueCode);

  const all = InstitutionService.getAllInstitutions();
  assert.ok(all.some((i: any) => i.id === inst.id));

  // Verify IISc has no access to AU resources
  const iiscResources = ResourceService.getResources(inst.id);
  assert.equal(iiscResources.length, 0, 'New institution must have 0 resources initially');
});
