import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import { ApiResponse } from '#services/api_response'

export default class HttpExceptionHandler extends ExceptionHandler {
  protected debug = process.env.NODE_ENV !== 'production'

  async handle(error: unknown, ctx: HttpContext) {
    const { response, request, logger } = ctx

    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return response.status(error.status).send(
        ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
      )
    }

    if (typeof error === 'object' && error !== null) {
      const anyError = error as any

      if (anyError.code === 'E_UNAUTHORIZED_ACCESS' || anyError.code === 'E_INVALID_AUTH_UID') {
        return response.unauthorized(
          ApiResponse.error('Unauthorized', null, 'UNAUTHORIZED')
        )
      }

      if (anyError.code === 'E_FORBIDDEN_ACCESS') {
        return response.forbidden(
          ApiResponse.error('Forbidden', null, 'FORBIDDEN')
        )
      }

      if (anyError.status === 404 || anyError.code === 'E_ROUTE_NOT_FOUND') {
        return response.notFound(
          ApiResponse.error('Route not found', null, 'ROUTE_NOT_FOUND')
        )
      }
    }

    logger.error(
      {
        url: request.url(),
        method: request.method(),
        error,
      },
      '[HttpExceptionHandler] Unexpected error'
    )

    return response.internalServerError(
      ApiResponse.error(
        'Internal server error',
        this.debug ? (error as any) : null,
        'INTERNAL_SERVER_ERROR'
      )
    )
  }

  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
