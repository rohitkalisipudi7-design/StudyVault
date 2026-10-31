import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { verifyPassword, signToken, AuthUser } from '@/server/security/auth';
import { createErrorResponse } from '@/server/middleware/guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb();

    const user = db
      .prepare(`
        SELECT u.*, i.name as institution_name
        FROM users u
        JOIN institutions i ON u.institution_id = i.id
        WHERE u.email = ?
      `)
      .get(normalizedEmail) as any;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      institutionId: user.institution_id,
      institutionName: user.institution_name,
      branchId: user.branch_id || null,
      courseId: user.course_id || null,
    };

    const token = signToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
      token,
    });

    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
