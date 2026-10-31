import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, enforceAdmin, createErrorResponse } from '@/server/middleware/guard';
import { ResourceService } from '@/server/services/resource.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthenticatedUser(req);
    const { id } = await params;

    // Scoped retrieval: throws 403 if resource belongs to another college
    const resource = ResourceService.getResourceById(id, user.institutionId);
    return NextResponse.json({ success: true, resource });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthenticatedUser(req);
    enforceAdmin(user);

    const { id } = await params;
    const body = await req.json();
    const { title, description, url } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required.' },
        { status: 400 }
      );
    }

    const updated = ResourceService.updateResource(id, user.institutionId, { title, description, url });
    return NextResponse.json({ success: true, resource: updated });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthenticatedUser(req);
    enforceAdmin(user);

    const { id } = await params;
    ResourceService.deleteResource(id, user.institutionId);

    return NextResponse.json({ success: true, message: 'Resource deleted successfully.' });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
