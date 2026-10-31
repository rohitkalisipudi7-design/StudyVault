import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createErrorResponse } from '@/server/middleware/guard';
import { AIService } from '@/server/services/ai.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    const body = await req.json();
    const { query, branchId, courseId } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Search query is required.' },
        { status: 400 }
      );
    }

    if (query.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Search query exceeds maximum limit of 1,000 characters.' },
        { status: 400 }
      );
    }

    // STRICT SCOPING: User's institutionId is passed
    const result = await AIService.performSearch(user.id, user.institutionId, query.trim(), {
      branchId,
      courseId,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
