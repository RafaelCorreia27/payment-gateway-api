/**
 * Tipos TypeScript para JWT
 */

export interface JwtPayload {
  userId: number
  email: string
  role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'
  iat?: number
  exp?: number
}
