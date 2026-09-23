import { NextResponse } from 'next/server'

export async function POST() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'
  
  try {
    await fetch(`${apiUrl}/api/auth/logout`, { method: 'POST' })
  } catch {
    // Ignore backend logout failures, just clear the frontend cookie
  }

  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.delete('session')
  return response
}
