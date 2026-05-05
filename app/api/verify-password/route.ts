import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileFolderID, password, jwtToken } = body;

    // 1. Call your Django API from the Next server
    const djangoResponse = await fetch(`http://localhost:8000/api/v1/verify/password?fileFolderID=${fileFolderID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${jwtToken}` },
      body: JSON.stringify({ password }),
    });

    const data = await djangoResponse.json();

    if (!djangoResponse.ok) {
      return NextResponse.json(data, { status: djangoResponse.status });
    }

    // 2. Extract the cookie from Django's response
    // Django sent: set-cookie: file_access_7=abc...
    const setCookieHeader = djangoResponse.headers.get('set-cookie');

    const response = NextResponse.json(data);

    if (setCookieHeader) {
      // 1. Parse the full header
      // Example header: "file_access_locked_7=abc-123; Path=/; ..."
      const cookiePart = setCookieHeader.split(';')[0]; // "file_access_locked_7=abc-123"
      const [cookieName, cookieValue] = cookiePart.split('=');

      const cookieStore = await cookies();

      // 2. Use the dynamic name from Django
      cookieStore.set(cookieName, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // If you want to sync the maxAge with Django's decision:
        maxAge: cookieName.includes('short') ? 60 : 3600,
      });

      console.log(`Relaying cookie: ${cookieName}`); // Debug log
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}