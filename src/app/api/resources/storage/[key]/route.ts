import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createErrorResponse } from '@/server/middleware/guard';
import { getObjectBuffer } from '@/server/storage/minio';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    if (!key) {
      return NextResponse.json({ success: false, error: 'Storage object key is required.' }, { status: 400 });
    }

    // Authenticate user session
    getAuthenticatedUser(req);

    const storageObj = await getObjectBuffer(key);
    if (!storageObj || !storageObj.buffer) {
      return NextResponse.json({ success: false, error: 'Object not found in storage.' }, { status: 404 });
    }

    const safeName = key.replace(/[^\w\s.-]/g, '_');
    return new NextResponse(storageObj.buffer, {
      status: 200,
      headers: {
        'Content-Type': storageObj.contentType || 'application/pdf',
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Content-Length': storageObj.buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
