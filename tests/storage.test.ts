import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment } from './setup';
import { validateFileBuffer } from '../src/server/security/file-validator';
import { uploadToObjectStorage, getObjectBuffer } from '../src/server/storage/minio';
import { ResourceService } from '../src/server/services/resource.service';
import { getDb } from '../src/server/db';

const env = setupTestEnvironment();
after(() => env.cleanup());

test('1. File Security: Magic Byte Validation blocks disguised malicious files', () => {
  // Case A: Valid PDF buffer with standard %PDF- header
  const validPdf = Buffer.from('%PDF-1.5\n%\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
  const validPdfResult = validateFileBuffer(validPdf, 'exam_notes.pdf');
  assert.equal(validPdfResult.isValid, true, 'Valid PDF magic bytes must be accepted');
  assert.equal(validPdfResult.detectedMime, 'application/pdf');

  // Case B: Disguised HTML payload renamed to .pdf
  const maliciousHtml = Buffer.from('<!DOCTYPE html><html><head><script>alert(document.cookie)</script></head><body>Phishing</body></html>');
  const htmlResult = validateFileBuffer(maliciousHtml, 'assignment.pdf');
  assert.equal(htmlResult.isValid, false, 'Disguised HTML must be rejected');
  assert.equal(htmlResult.detectedMime, 'text/html');
  assert.match(htmlResult.error || '', /Disguised HTML payload detected/);

  // Case C: Disguised Windows Executable (MZ header) renamed to .pdf
  const maliciousExe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00]);
  const exeResult = validateFileBuffer(maliciousExe, 'lecture_slides.pdf');
  assert.equal(exeResult.isValid, false, 'Disguised Windows executable must be rejected');
  assert.equal(exeResult.detectedMime, 'application/x-dosexec');
  assert.match(exeResult.error || '', /Disguised Windows executable/);

  // Case D: Disguised Linux ELF binary renamed to .docx
  const elfBinary = Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00]);
  const elfResult = validateFileBuffer(elfBinary, 'report.docx');
  assert.equal(elfResult.isValid, false, 'Disguised ELF binary must be rejected');
  assert.equal(elfResult.detectedMime, 'application/x-executable');
  assert.match(elfResult.error || '', /Disguised ELF binary/);

  // Case E: Disguised SVG payload renamed to .pdf
  const svgPayload = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const svgResult = validateFileBuffer(svgPayload, 'diagram.pdf');
  assert.equal(svgResult.isValid, false, 'Disguised SVG payload must be rejected');
  assert.equal(svgResult.detectedMime, 'image/svg+xml');

  // Case F: Empty buffer
  const emptyResult = validateFileBuffer(Buffer.alloc(0), 'empty.pdf');
  assert.equal(emptyResult.isValid, false, 'Empty buffer must be rejected');
});

test('2. Storage: Offloads binary storage from SQLite BLOBs to Object Storage', async () => {
  const db = getDb();

  // Create a realistic PDF buffer
  const testPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Operating Systems Notes) >>\nendobj\n%%EOF');
  const objectKey = `test-unit-note-${Date.now()}.pdf`;

  // 1. Upload to Object Storage
  const uploadResult = await uploadToObjectStorage(objectKey, testPdfBuffer, 'application/pdf');
  assert.ok(uploadResult.objectKey, 'Must generate valid objectKey');
  assert.ok(uploadResult.fileUrl, 'Must return retrievable fileUrl');

  // 2. Persist metadata into SQLite without storing raw binary BLOB
  const resource = ResourceService.createResource({
    institutionId: 'inst-au',
    branchId: 'branch-au-cse',
    courseId: 'course-au-cs301',
    title: 'Operating Systems Object Storage Test',
    type: 'file',
    description: 'Verifying zero SQLite BLOB bloat',
    url: uploadResult.fileUrl,
    fileUrl: uploadResult.fileUrl,
    filePath: `public/uploads/${objectKey}`,
    objectKey: uploadResult.objectKey,
    fileName: 'os_notes.pdf',
    fileSize: testPdfBuffer.length,
    mimeType: 'application/pdf',
    fileData: null, // Strictly null
    uploaderId: 'user-au-admin',
    uploaderName: 'AU Department Admin',
  });

  assert.ok(resource.id, 'Resource should be created');
  assert.equal(resource.object_key, uploadResult.objectKey, 'Stored object_key must match');
  assert.equal(resource.file_size, testPdfBuffer.length, 'Stored file_size must match integer byte count');
  assert.equal(resource.mime_type, 'application/pdf', 'Stored mime_type must match');

  // 3. Verify SQLite column directly: file_data MUST BE NULL
  const rawRow: any = db.prepare('SELECT file_data, object_key, file_size, mime_type FROM resources WHERE id = ?').get(resource.id);
  assert.equal(rawRow.file_data, null, 'CRITICAL: SQLite must store NULL for file_data to prevent DB bloat');
  assert.equal(rawRow.object_key, uploadResult.objectKey);
  assert.equal(rawRow.file_size, testPdfBuffer.length);
  assert.equal(rawRow.mime_type, 'application/pdf');

  // 4. Retrieve object directly via getObjectBuffer
  const retrieved = await getObjectBuffer(uploadResult.objectKey);
  assert.ok(retrieved && retrieved.buffer, 'Object must be retrievable via its objectKey');
  assert.equal(retrieved.buffer.toString(), testPdfBuffer.toString(), 'Retrieved content must match uploaded buffer');

  // 5. Cleanup
  ResourceService.deleteResource(resource.id, 'inst-au');
  const deletedCheck = db.prepare('SELECT id FROM resources WHERE id = ?').get(resource.id);
  assert.equal(deletedCheck, undefined, 'Resource record must be deleted');
});
