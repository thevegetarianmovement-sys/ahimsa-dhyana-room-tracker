/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.JWT_SECRET || 'super-secret-local-key-never-use-in-production'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function login(user: { id: string, username: string, role: string }) {
  const sessionData = { id: user.id, username: user.username, role: user.role }
  const encryptedSessionData = await encrypt(sessionData)

  cookies().set('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 1 day
    path: '/',
  })
}

export async function volunteerLogin(data: { name: string, locationType: string, locationId: string }) {
  const sessionData = { 
    id: `vol-${Date.now()}`, 
    username: data.name, 
    role: 'VOLUNTEER',
    locationType: data.locationType,
    locationId: data.locationId
  }
  const encryptedSessionData = await encrypt(sessionData)

  cookies().set('session', encryptedSessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 14 * 60 * 60, // 14 hours for a shift
    path: '/',
  })
}

export async function logout() {
  cookies().delete('session')
}

export async function getSession() {
  const session = cookies().get('session')?.value
  if (!session) return null
  try {
    return await decrypt(session)
  } catch (error) {
    return null
  }
}

export async function requireAuth(roles: string[] = []) {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  if (roles.length > 0 && !roles.includes(session.role)) {
    throw new Error('Forbidden')
  }
  return session
}
