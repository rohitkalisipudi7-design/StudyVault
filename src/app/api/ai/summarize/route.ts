import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createErrorResponse } from '@/server/middleware/guard';
import { AIService } from '@/server/services/ai.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    const { resourceId } = body;

    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required.' },
        { status: 400 }
      );
    }

    // STRICT SCOPING: User's institutionId is verified
    const result = await AIService.performSummarize(user.id, user.institutionId, resourceId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
