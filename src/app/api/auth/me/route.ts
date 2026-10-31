import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, createErrorResponse } from '@/server/middleware/guard';
import { getDb } from '@/server/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    const db = getDb();

    // Fetch refreshed user info with branch and course names
    const user = db
      .prepare(`
        SELECT 
          u.id, u.email, u.name, u.role, u.institution_id,
          i.name as institution_name,
          b.id as branch_id, b.name as branch_name, b.code as branch_code,
          c.id as course_id, c.name as course_name, c.code as course_code
        FROM users u
        JOIN institutions i ON u.institution_id = i.id
        LEFT JOIN branches b ON u.branch_id = b.id
        LEFT JOIN courses c ON u.course_id = c.id
        WHERE u.id = ?
      `)
      .get(authUser.id) as any;

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institution_id,
        institutionName: user.institution_name,
        branchId: user.branch_id || null,
        branchName: user.branch_name || null,
        branchCode: user.branch_code || null,
        courseId: user.course_id || null,
        courseName: user.course_name || null,
        courseCode: user.course_code || null,
      },
    });
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
