import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRoleType } from '#types/user_role'
import { ApiResponse } from '#services/api_response'
import '#types/http_context'

export default function roleMiddleware(allowedRoles: Array<UserRoleType>) {
  return async (ctx: HttpContext, next: NextFn) => {
    const { response, authUser } = ctx

    if (!authUser) {
      return response.unauthorized(
        ApiResponse.error('Authentication required', null, 'UNAUTHORIZED')
      )
    }

    if (!allowedRoles.includes(authUser.role)) {
      return response.forbidden(
        ApiResponse.error(
          `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
          null,
          'FORBIDDEN'
        )
      )
    }

    await next()
  }
}
