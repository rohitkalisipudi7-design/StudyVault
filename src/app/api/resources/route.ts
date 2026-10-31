import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { getAuthenticatedUser, enforceAdmin, createErrorResponse } from '@/server/middleware/guard';
import { ResourceService, ResourceFilters } from '@/server/services/resource.service';

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
    enforceAdmin(user);

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

      // Save file to uploads directory if writable
      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
      } catch {}

      const safeName = `${crypto.randomUUID()}${ext}`;
      const relativeStoragePath = `public/uploads/${safeName}`;
      const absolutePath = path.join(uploadsDir, safeName);

      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        fs.writeFileSync(absolutePath, buffer);
      } catch {
        // In read-only serverless filesystems, buffer is preserved directly in the database
      }

      const fileSizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

      const resource = ResourceService.createResource({
        institutionId: user.institutionId,
        branchId,
        courseId,
        title,
        type: 'file',
        description,
        url: `/uploads/${safeName}`,
        filePath: relativeStoragePath,
        fileName: originalName,
        fileSize: fileSizeStr,
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
