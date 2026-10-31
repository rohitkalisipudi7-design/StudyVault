import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getAuthenticatedUser, createErrorResponse } from '@/server/middleware/guard';
import { ResourceService } from '@/server/services/resource.service';
import { buildAcademicPdf } from '@/server/utils/pdf-generator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getAuthenticatedUser(req);

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

    // 1. Try reading directly from database BLOB storage
    if (resource.file_data) {
      fileBuffer = Buffer.from(resource.file_data);
    }

    // 2. Try reading from configured file path or public/uploads on disk
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

    // If file does not exist or was a corrupted/dummy placeholder, generate a clean valid PDF
    if (!fileBuffer) {
      fileBuffer = buildAcademicPdf({
        institution: user.institutionName || 'NoteVault Academic Repository',
        branch: resource.branch_name || resource.branch_code || 'Engineering Department',
        courseCode: resource.course_code || 'CS301',
        courseName: resource.course_name || 'Academic Course',
        title: resource.title,
        description: resource.description,
      });

      // Also persist to public/uploads so future direct requests are fast
      try {
        const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, fileName), fileBuffer);
      } catch {
        // Non-blocking disk write
      }
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
