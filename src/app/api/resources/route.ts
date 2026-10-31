import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import crypto from 'node:crypto';
import { getAuthenticatedUser, enforceAdmin, createErrorResponse } from '@/server/middleware/guard';
import { ResourceService, ResourceFilters } from '@/server/services/resource.service';
import { validateFileBuffer } from '@/server/security/file-validator';
import { uploadToObjectStorage } from '@/server/storage/minio';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.pptx', '.txt', '.epub', '.zip', '.mp4']);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const { searchParams } = new URL(req.url);

    const filters: ResourceFilters = {
      branchId: searchParams.get('branchId') || undefined,
      courseId: searchParams.get('courseId') || undefined,
      type: (searchParams.get('type') as any) || undefined,
      query: searchParams.get('query') || undefined,
    };

    // STRICT SCOPING: User can ONLY see their own college's resources
    const resources = ResourceService.getResources(user.institutionId, filters);

    return NextResponse.json({ success: true, resources });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    // Authenticated students and admins can upload study resources to their own institution

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // 1. File Upload Flow
      const formData = await req.formData();
      const title = formData.get('title') as string;
      const description = (formData.get('description') as string) || '';
      const branchId = formData.get('branchId') as string;
      const courseId = formData.get('courseId') as string;
      const file = formData.get('file') as File | null;

      if (!title || !branchId || !courseId || !file) {
        return NextResponse.json(
          { success: false, error: 'Title, branch, course, and file are required.' },
          { status: 400 }
        );
      }

      // Validate File Size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File size exceeds the 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
          },
          { status: 400 }
        );
      }

      // Validate File Extension
      const originalName = file.name || 'document.pdf';
      const ext = path.extname(originalName).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type "${ext}". Allowed types: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Task 2: Server-side magic byte validation
      const validation = validateFileBuffer(buffer, originalName);
      if (!validation.isValid) {
        console.warn(
          `[Security Warning] File upload rejected for user ${user.id} (${user.email}): ${validation.error} | File: ${originalName} | Detected MIME: ${validation.detectedMime}`
        );
        return NextResponse.json(
          {
            success: false,
            error: validation.error || 'Malicious or invalid file content detected.',
          },
          { status: 400 }
        );
      }

      // Task 1: Upload directly to MinIO Object Storage (with local disk fallback)
      const safeName = `${crypto.randomUUID()}${ext}`;
      const uploadResult = await uploadToObjectStorage(safeName, buffer, validation.detectedMime);

      // Persist only metadata, integer file size, MIME type, and object key in SQLite (no raw BLOBs)
      const resource = ResourceService.createResource({
        institutionId: user.institutionId,
        branchId,
        courseId,
        title,
        type: 'file',
        description,
        url: uploadResult.fileUrl,
        fileUrl: uploadResult.fileUrl,
        filePath: `public/uploads/${safeName}`,
        objectKey: uploadResult.objectKey,
        fileName: originalName,
        fileSize: buffer.length,
        mimeType: validation.detectedMime,
        fileData: null, // Strictly zero BLOB bloat in SQLite
        uploaderId: user.id,
        uploaderName: user.name,
      });

      return NextResponse.json({ success: true, resource }, { status: 201 });
    } else {
      // 2. Link Creation Flow
      const body = await req.json();
      const { title, description = '', branchId, courseId, url } = body;

      if (!title || !branchId || !courseId || !url) {
        return NextResponse.json(
          { success: false, error: 'Title, branch, course, and URL are required.' },
          { status: 400 }
        );
      }

      const resource = ResourceService.createResource({
        institutionId: user.institutionId,
        branchId,
        courseId,
        title,
        type: 'link',
        description,
        url,
        uploaderId: user.id,
        uploaderName: user.name,
      });

      return NextResponse.json({ success: true, resource }, { status: 201 });
    }
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
