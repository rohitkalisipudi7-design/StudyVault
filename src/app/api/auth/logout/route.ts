import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
