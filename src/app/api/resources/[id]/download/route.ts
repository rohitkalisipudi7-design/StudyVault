import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getAuthenticatedUser, createErrorResponse, AuthError } from '@/server/middleware/guard';
import { ResourceService } from '@/server/services/resource.service';
import { buildAcademicPdf } from '@/server/utils/pdf-generator';
import { getObjectBuffer, uploadToObjectStorage } from '@/server/storage/minio';
import { getDb } from '@/server/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let user;
    try {
      user = getAuthenticatedUser(req);
    } catch (authErr: any) {
      // If browser navigation without auth, redirect smoothly to login
      const acceptHeader = req.headers.get('accept') || '';
      if (acceptHeader.includes('text/html')) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', `/api/resources/${id}/download`);
        return NextResponse.redirect(loginUrl);
      }
      throw authErr;
    }

    // Enforce multi-tenant institution scoping (returns 403 if cross-college)
    const resource = ResourceService.getResourceById(id, user.institutionId);

    // If it's an external link, redirect to the external reference
    if (resource.type === 'link') {
      return NextResponse.redirect(new URL(resource.url, req.url));
    }

    // It's a file resource
    let fileBuffer: Buffer | null = null;
    let fileName = resource.file_name || `${resource.course_code || 'Resource'}_Notes.pdf`;
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName += '.pdf';
    }

    // 1. Fetch stream/buffer directly from MinIO / object storage using object_key
    if (resource.object_key) {
      try {
        const storageObj = await getObjectBuffer(resource.object_key);
        if (storageObj && storageObj.buffer && storageObj.buffer.length > 0) {
          fileBuffer = storageObj.buffer;
        }
      } catch (err: any) {
        console.warn(`[Storage Warning] Error reading object_key "${resource.object_key}":`, err.message);
      }
    }

    // 2. Try reading by file_name in object storage or local disk
    if (!fileBuffer && fileName) {
      try {
        const storageObj = await getObjectBuffer(fileName);
        if (storageObj && storageObj.buffer && storageObj.buffer.length > 0) {
          fileBuffer = storageObj.buffer;
        }
      } catch {}
    }

    // 3. Fallback: Check configured file path or legacy public/uploads on disk
    if (!fileBuffer) {
      const possiblePaths = [
        resource.file_path ? path.resolve(process.cwd(), resource.file_path) : null,
        resource.file_path ? path.resolve(process.cwd(), 'public', resource.file_path.replace(/^public[\\/]/, '')) : null,
        path.resolve(process.cwd(), 'public', 'uploads', fileName),
      ].filter(Boolean) as string[];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const stats = fs.statSync(p);
          if (stats.size > 300) {
            fileBuffer = fs.readFileSync(p);
            break;
          }
        }
      }
    }

    // 4. Fallback for legacy database rows that stored file_data BLOB
    if (!fileBuffer && resource.file_data) {
      fileBuffer = Buffer.from(resource.file_data);
    }

    // 5. Dynamic Academic Fallback: Generate high-yield syllabus PDF and cache in object storage
    if (!fileBuffer || fileBuffer.length < 300) {
      fileBuffer = buildAcademicPdf({
        institution: user.institutionName || 'NoteVault Academic Repository',
        branch: resource.branch_name || resource.branch_code || 'Engineering Department',
        courseCode: resource.course_code || 'CS301',
        courseName: resource.course_name || 'Academic Course',
        title: resource.title,
        description: resource.description,
      });

      // Offload to MinIO / disk object storage (NEVER store raw BLOBs in SQLite)
      const targetKey = resource.object_key || fileName;
      uploadToObjectStorage(targetKey, fileBuffer, resource.mime_type || 'application/pdf').catch((err) => {
        console.warn('[Storage Error] Could not cache generated PDF to storage:', err.message);
      });
    }

    const safeName = fileName.replace(/[^\w\s.-]/g, '_');
    const encodedName = encodeURIComponent(fileName);
    const contentType = resource.mime_type || 'application/pdf';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
