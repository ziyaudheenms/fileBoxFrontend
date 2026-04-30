import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileFolderID, password ,jwtToken } = body;

    // 1. Call your Django API from the Next server
    const djangoResponse = await fetch(`http://localhost:8000/api/v1/verify/password?fileFolderID=${fileFolderID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' , 'authorization': `Bearer ${jwtToken}` },
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
      // 3. Relay the cookie to the browser
      // We parse the token value out of the header string
      const tokenValue = setCookieHeader.split(';')[0].split('=')[1];
      
      const cookieStore = await cookies();
      cookieStore.set(`file_access_${fileFolderID}`, tokenValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600, // 1 hour
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}