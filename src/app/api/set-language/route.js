import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const lang = body.lang || 'en';

  const cookieStore = await cookies();

  cookieStore.set('language', lang, {
    httpOnly: true,
    path: '/',
    // maxAge: 0,
    // sameSite: 'Strict', // or 'None' if using cross-domain
    maxAge: 60 * 60 * 24 * 365, // 1 year
    // secure: true, // only if using HTTPS
  });

  return NextResponse.json({ message: 'Language set to ' + lang });
}
