import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AuthUser } from '../security/auth';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

export function getAuthenticatedUser(req: NextRequest): AuthUser {
  // 1. Try Cookie
  const cookieToken = req.cookies.get('auth_token')?.value;

  // 2. Try Authorization Header
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // 3. Try URL Query Param (?token=...) for direct downloads/media
  const queryToken = req.nextUrl?.searchParams?.get('token') || null;

  const token = cookieToken || bearerToken || queryToken;

  if (!token) {
    throw new AuthError('Authentication required. Please log in.', 401);
  }

  const user = verifyToken(token);
  if (!user) {
    throw new AuthError('Session expired or invalid. Please log in again.', 401);
  }

  return user;
}

export function enforceAdmin(user: AuthUser): void {
  if (user.role !== 'admin') {
    throw new AuthError('Access denied. Administrator privileges required.', 403);
  }
}

export function enforceInstitutionScope(user: AuthUser, targetInstitutionId: string): void {
  if (user.institutionId !== targetInstitutionId) {
    throw new AuthError(
      `Cross-college access forbidden. You cannot access resources outside of your institution.`,
      403
    );
  }
}

export function createErrorResponse(error: any): NextResponse {
  const status = error.status || (error.name === 'AuthError' ? error.status : 500);
  const message = error.message || 'Internal Server Error';

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
