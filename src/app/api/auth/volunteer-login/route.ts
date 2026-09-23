import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'
    
    const backendRes = await fetch(`${apiUrl}/api/auth/volunteer-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status })
    }

    const response = NextResponse.json(data, { status: 200 })

    const setCookieHeader = backendRes.headers.get('set-cookie')
    if (setCookieHeader) {
      const match = setCookieHeader.match(/session=([^;]+)/)
      if (match) {
        response.cookies.set({
          name: 'session',
          value: match[1],
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24
        })
      }
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
