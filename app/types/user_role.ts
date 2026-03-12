/**
 * Enum para roles de usuário
 * Define os diferentes níveis de acesso no sistema
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  FINANCE = 'FINANCE',
  USER = 'USER',
}

/**
 * Tipo que representa um role válido
 */
export type UserRoleType = UserRole | 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'

/**
 * Tipo que representa um usuário com role
 * Útil para tipagem em funções que trabalham com usuários autenticados
 */
export interface UserWithRole {
  id: number
  email: string
  role: UserRoleType
}

/**
 * Array com todos os roles disponíveis
 */
export const USER_ROLES = Object.values(UserRole) as UserRoleType[]

/**
 * Helpers para verificação de roles
 */
export class RoleHelper {
  /**
   * Verifica se um role tem permissão de administrador
   */
  static isAdmin(role: UserRoleType): boolean {
    return role === UserRole.ADMIN
  }

  /**
   * Verifica se um role pode gerenciar produtos e usuários
   */
  static canManageProductsAndUsers(role: UserRoleType): boolean {
    return role === UserRole.ADMIN || role === UserRole.MANAGER
  }

  /**
   * Verifica se um role pode realizar reembolsos
   */
  static canRefund(role: UserRoleType): boolean {
    return role === UserRole.ADMIN || role === UserRole.FINANCE
  }

  /**
   * Verifica se um role pode gerenciar produtos
   */
  static canManageProducts(role: UserRoleType): boolean {
    return (
      role === UserRole.ADMIN ||
      role === UserRole.MANAGER ||
      role === UserRole.FINANCE
    )
  }

  /**
   * Verifica se um role tem uma das roles permitidas
   */
  static hasRole(role: UserRoleType, allowedRoles: UserRoleType[]): boolean {
    return allowedRoles.includes(role)
  }

  /**
   * Verifica se um role tem acesso total (ADMIN)
   */
  static hasFullAccess(role: UserRoleType): boolean {
    return role === UserRole.ADMIN
  }

  /**
   * Retorna o nível hierárquico do role (maior número = mais permissões)
   */
  static getRoleLevel(role: UserRoleType): number {
    const levels: Record<UserRoleType, number> = {
      [UserRole.USER]: 1,
      [UserRole.FINANCE]: 2,
      [UserRole.MANAGER]: 3,
      [UserRole.ADMIN]: 4,
    }
    return levels[role] || 0
  }

  /**
   * Verifica se um role tem nível igual ou superior a outro
   */
  static hasRoleOrHigher(userRole: UserRoleType, minimumRole: UserRoleType): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(minimumRole)
  }
}
