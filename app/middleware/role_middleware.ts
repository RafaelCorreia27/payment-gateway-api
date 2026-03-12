import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import '#types/http_context' // Importa extensão do HttpContext

/**
 * Middleware de autorização por roles
 * Verifica se o usuário tem uma das roles permitidas
 * 
 * Uso: router.get('/admin', [AuthMiddleware, roleMiddleware(['ADMIN', 'MANAGER'])], ...)
 */
export default function roleMiddleware(allowedRoles: Array<'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER'>) {
  return async (ctx: HttpContext, next: NextFn) => {
    const { response, authUser } = ctx

    // Verifica se o usuário está autenticado (deve ter passado pelo AuthMiddleware primeiro)
    if (!authUser) {
      return response.unauthorized({
        message: 'Authentication required',
      })
    }

    // Verifica se o usuário tem uma das roles permitidas
    if (!allowedRoles.includes(authUser.role)) {
      return response.forbidden({
        message: 'Insufficient permissions. Required roles: ' + allowedRoles.join(', '),
      })
    }

    // Usuário tem permissão, continua
    await next()
  }
}
