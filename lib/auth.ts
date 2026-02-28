import { SignJWT, jwtVerify } from 'jose'

// Use a consistent secret - in production this should be from env
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'
const secret = new TextEncoder().encode(JWT_SECRET)

export async function createToken() {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}