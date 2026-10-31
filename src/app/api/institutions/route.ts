import { NextRequest, NextResponse } from 'next/server';
import { InstitutionService } from '@/server/services/institution.service';
import { createErrorResponse } from '@/server/middleware/guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const institutions = InstitutionService.getAllInstitutions();
    return NextResponse.json({ success: true, institutions });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, shortName } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'Institution name and code are required.' },
        { status: 400 }
      );
    }

    const institution = InstitutionService.createInstitution(name, code, shortName);
    return NextResponse.json({ success: true, institution }, { status: 201 });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
