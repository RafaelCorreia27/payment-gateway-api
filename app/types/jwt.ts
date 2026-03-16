import type { UserRoleType } from './user_role.js'

export interface JwtPayload {
  userId: number
  email: string
  role: UserRoleType
  iat?: number
  exp?: number
}
