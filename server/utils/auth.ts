import jwt from 'jsonwebtoken'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { getCookie, setCookie, createError } from 'h3'
import type { H3Event } from 'h3'

const config = useRuntimeConfig()
const JWT_SECRET = config.private.jwtSecret

if (!JWT_SECRET) {
  throw new Error('Missing NUXT_PRIVATE_JWT_SECRET in environment')
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  const computed = scryptSync(password, salt, 64).toString('hex')
  return timingSafeEqual(Buffer.from(hash), Buffer.from(computed))
}

export function signJwt(userId: number): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJwt(token: string): { sub: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: number }
  } catch {
    return null
  }
}

export function getUserIdFromEvent(event: H3Event): number | null {
  const token = getCookie(event, 'auth_token')
  if (!token) return null
  const payload = verifyJwt(token)
  return payload?.sub ?? null
}

export async function requireAuth(event: H3Event): Promise<number> {
  const userId = getUserIdFromEvent(event)
  if (!userId) {
    throw createError({ status: 401, message: 'Необходима авторизация' })
  }
  return userId
}

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 дней
    path: '/'
  })
}

export function clearAuthCookie(event: H3Event): void {
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}