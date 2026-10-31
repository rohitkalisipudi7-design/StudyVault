import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, enforceAdmin, createErrorResponse, AuthError } from '@/server/middleware/guard';
import { InstitutionService } from '@/server/services/institution.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionIdParam = searchParams.get('institutionId');
    const branchIdParam = searchParams.get('branchId') || undefined;

    let institutionId: string;
    try {
      const user = getAuthenticatedUser(req);
      if (institutionIdParam && institutionIdParam !== user.institutionId) {
        throw new AuthError('Cross-college access forbidden.', 403);
      }
      institutionId = user.institutionId;
    } catch (err: any) {
      if (err.status === 403) throw err;
      if (!institutionIdParam) {
        throw new AuthError('Authentication required.', 401);
      }
      institutionId = institutionIdParam;
    }

    const courses = InstitutionService.getCourses(institutionId, branchIdParam);
    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    // Authenticated students and admins can create courses for their own institution

    const body = await req.json();
    const { branchId, name, code, description = '' } = body;

    if (!branchId || !name || !code) {
      return NextResponse.json(
        { success: false, error: 'Branch, course name, and course code are required.' },
        { status: 400 }
      );
    }

    const course = InstitutionService.createCourse(
      user.institutionId,
      branchId,
      name,
      code,
      description
    );

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
