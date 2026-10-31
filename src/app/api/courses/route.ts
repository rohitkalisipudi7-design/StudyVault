import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, enforceAdmin, createErrorResponse } from '@/server/middleware/guard';
import { InstitutionService } from '@/server/services/institution.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionIdParam = searchParams.get('institutionId');
    const branchIdParam = searchParams.get('branchId') || undefined;

    let institutionId: string;
    if (institutionIdParam) {
      institutionId = institutionIdParam;
    } else {
      const user = getAuthenticatedUser(req);
      institutionId = user.institutionId;
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
    enforceAdmin(user);

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
