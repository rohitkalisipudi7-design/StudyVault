import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getDb } from '@/server/db';
import { hashPassword, signToken, AuthUser } from '@/server/security/auth';
import { createErrorResponse } from '@/server/middleware/guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, institutionId, role = 'student', branchId, courseId } = body;

    // Validation
    if (!name || !email || !password || !institutionId) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and institution are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = getDb();

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Verify institution exists
    const inst = db.prepare('SELECT id, name FROM institutions WHERE id = ?').get(institutionId) as any;
    if (!inst) {
      return NextResponse.json(
        { success: false, error: 'Selected institution does not exist.' },
        { status: 400 }
      );
    }

    // Strict Multi-tenancy: Verify branch and course belong to this institution
    if (branchId) {
      const branch = db.prepare('SELECT id FROM branches WHERE id = ? AND institution_id = ?').get(branchId, institutionId);
      if (!branch) {
        return NextResponse.json(
          { success: false, error: 'Selected branch does not belong to the selected institution.' },
          { status: 400 }
        );
      }
    }

    if (courseId) {
      const course = db.prepare('SELECT id FROM courses WHERE id = ? AND institution_id = ?').get(courseId, institutionId);
      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Selected course does not belong to the selected institution.' },
          { status: 400 }
        );
      }
    }

    const { hash, salt } = hashPassword(password);
    const userId = `user-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, institution_id, branch_id, course_id, name, email, password_hash, password_salt, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      institutionId,
      branchId || null,
      courseId || null,
      name.trim(),
      normalizedEmail,
      hash,
      salt,
      role === 'admin' ? 'admin' : 'student',
      now
    );

    const authUser: AuthUser = {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      role: role === 'admin' ? 'admin' : 'student',
      institutionId,
      institutionName: inst.name,
      branchId: branchId || null,
      courseId: courseId || null,
    };

    const token = signToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
      token,
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error: any) {
    return createErrorResponse(error);
  }
}
