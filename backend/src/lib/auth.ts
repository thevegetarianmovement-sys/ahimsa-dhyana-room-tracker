import { SignJWT, jwtVerify } from 'jose'
import dotenv from 'dotenv'

dotenv.config()

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
