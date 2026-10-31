import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, enforceAdmin, createErrorResponse } from '@/server/middleware/guard';
import { InstitutionService } from '@/server/services/institution.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const institutionIdParam = searchParams.get('institutionId');

    let institutionId: string;
    if (institutionIdParam) {
      institutionId = institutionIdParam;
    } else {
      const user = getAuthenticatedUser(req);
      institutionId = user.institutionId;
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
    enforceAdmin(user);

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
