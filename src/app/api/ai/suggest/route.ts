import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createErrorResponse } from '@/server/middleware/guard';
import { AIService } from '@/server/services/ai.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);

    // STRICT SCOPING: User's institutionId is verified
    const result = await AIService.performSuggest(user.id, user.institutionId, {
      branchId: user.branchId,
      courseId: user.courseId,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
