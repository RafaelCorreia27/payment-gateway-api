import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRoleType } from '#types/user_role'
import { ApiResponse } from '#services/api_response'
import '#types/http_context' // Importa extensão do HttpContext

/**
 * Middleware de autorização por roles
 * Verifica se o usuário tem uma das roles permitidas
 * 
 * Uso: router.get('/admin', [AuthMiddleware, roleMiddleware(['ADMIN', 'MANAGER'])], ...)
 */
export default function roleMiddleware(allowedRoles: Array<UserRoleType>) {
  return async (ctx: HttpContext, next: NextFn) => {
    const { response, authUser } = ctx

    // Verifica se o usuário está autenticado (deve ter passado pelo AuthMiddleware primeiro)
    if (!authUser) {
      return response.unauthorized(
        ApiResponse.error('Authentication required', null, 'UNAUTHORIZED')
      )
    }

    // Verifica se o usuário tem uma das roles permitidas
    if (!allowedRoles.includes(authUser.role)) {
      return response.forbidden(
        ApiResponse.error(
          `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
          null,
          'FORBIDDEN'
        )
      )
    }

    // Usuário tem permissão, continua
    await next()
  }
}
