import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, enforceAdmin, createErrorResponse, AuthError } from '@/server/middleware/guard';
import { InstitutionService } from '@/server/services/institution.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionIdParam = searchParams.get('institutionId');

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

    const branches = InstitutionService.getBranches(institutionId);
    return NextResponse.json({ success: true, branches });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    // Authenticated students and admins can create branches for their own institution

    const body = await req.json();
    const { name, code } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Branch name and code are required.' },
        { status: 400 }
      );
    }

    const branch = InstitutionService.createBranch(user.institutionId, name, code);
    return NextResponse.json({ success: true, branch }, { status: 201 });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
