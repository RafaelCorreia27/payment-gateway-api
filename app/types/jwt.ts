import type { UserRoleType } from './user_role.js'

/**
 * Tipos TypeScript para JWT
 */

export interface JwtPayload {
  userId: number
  email: string
  role: UserRoleType
  iat?: number
  exp?: number
}
