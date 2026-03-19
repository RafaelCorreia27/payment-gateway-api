export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  FINANCE = 'FINANCE',
  USER = 'USER',
}

export type UserRoleType = UserRole | 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'

export interface UserWithRole {
  id: number
  email: string
  role: UserRoleType
}

export const USER_ROLES = Object.values(UserRole) as UserRoleType[]

export class RoleHelper {
  static isAdmin(role: UserRoleType): boolean {
    return role === UserRole.ADMIN
  }

  static canManageProductsAndUsers(role: UserRoleType): boolean {
    return role === UserRole.ADMIN || role === UserRole.MANAGER
  }

  static canRefund(role: UserRoleType): boolean {
    return role === UserRole.ADMIN || role === UserRole.FINANCE
  }

  static canManageProducts(role: UserRoleType): boolean {
    return (
      role === UserRole.ADMIN ||
      role === UserRole.MANAGER ||
      role === UserRole.FINANCE
    )
  }

  static hasRole(role: UserRoleType, allowedRoles: UserRoleType[]): boolean {
    return allowedRoles.includes(role)
  }

  static hasFullAccess(role: UserRoleType): boolean {
    return role === UserRole.ADMIN
  }

  static getRoleLevel(role: UserRoleType): number {
    const levels: Record<UserRoleType, number> = {
      [UserRole.USER]: 1,
      [UserRole.FINANCE]: 2,
      [UserRole.MANAGER]: 3,
      [UserRole.ADMIN]: 4,
    }
    return levels[role] || 0
  }

  static hasRoleOrHigher(userRole: UserRoleType, minimumRole: UserRoleType): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(minimumRole)
  }
}
