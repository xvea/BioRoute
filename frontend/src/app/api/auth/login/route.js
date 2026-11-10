import { NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'bioroute-secret-key-3302-pwk';

/**
 * Base64 URL Encoder
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Generate HMAC SHA-256 JWT Token
 */
function signJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    })
  );

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * POST /api/auth/login
 * Validates credentials against username: "admin" and password: "admin123"
 * Sets secure HTTP cookie named "token"
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, action } = body ?? {};

    // Allow logout via POST action if desired
    if (action === 'logout') {
      const response = NextResponse.json(
        { success: true, message: 'Sesi telah berakhir.' },
        { status: 200 }
      );
      response.cookies.set({
        name: 'token',
        value: '',
        path: '/',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      return response;
    }

    const identifier = (username || email || '').trim();

    // Check fixed credentials requirement: username "admin" and password "admin123"
    // Also accept admin@bioroute.id for convenient email input compatibility
    const isValidUsername = identifier.toLowerCase() === 'admin' || identifier.toLowerCase() === 'admin@bioroute.id';
    const isValidPassword = password === 'admin123';

    if (!isValidUsername || !isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kredensial tidak valid',
        },
        { status: 401 }
      );
    }

    // Generate JWT session token
    const token = signJWT({
      sub: 'ADM-3302-PWK',
      username: 'admin',
      name: 'Admin Banyumas',
      role: 'REGIONAL_ADMIN',
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Otentikasi berhasil. Selamat datang di BioRoute Admin.',
        token,
        user: {
          name: 'Admin Banyumas',
          email: 'admin@bioroute.id',
          username: 'admin',
          role: 'REGIONAL_ADMIN',
          hubCode: '33.02.PWK',
        },
      },
      { status: 200 }
    );

    // Store JWT securely into HTTP cookie named "token"
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan sistem saat memproses otentikasi.',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/login
 * Clears the session "token" cookie
 */
export async function DELETE() {
  const response = NextResponse.json(
    {
      success: true,
      message: 'Sesi telah berakhir dan cookie berhasil dibersihkan.',
    },
    { status: 200 }
  );

  response.cookies.set({
    name: 'token',
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
