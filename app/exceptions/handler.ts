import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@adonisjs/vinejs'
import { ApiResponse } from '#services/api_response'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !this.app.inProduction

  /**
   * Handle known errors and return standardized JSON responses.
   */
  async handle(error: unknown, ctx: HttpContext) {
    const { response, request, logger } = ctx

    // Erros de validação (VineJS)
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return response.status(error.status).send(
        ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
      )
    }

    // Erros HTTP genéricos com status e message
    if (typeof error === 'object' && error !== null) {
      const anyError = error as any

      // Erros de autenticação
      if (anyError.code === 'E_UNAUTHORIZED_ACCESS' || anyError.code === 'E_INVALID_AUTH_UID') {
        return response.unauthorized(
          ApiResponse.error('Unauthorized', null, 'UNAUTHORIZED')
        )
      }

      // Erros de autorização (sem permissão / role)
      if (anyError.code === 'E_FORBIDDEN_ACCESS') {
        return response.forbidden(
          ApiResponse.error('Forbidden', null, 'FORBIDDEN')
        )
      }

      // Rotas não encontradas
      if (anyError.status === 404 || anyError.code === 'E_ROUTE_NOT_FOUND') {
        return response.notFound(
          ApiResponse.error('Route not found', null, 'ROUTE_NOT_FOUND')
        )
      }
    }

    // Para erros não tratados especificamente, logamos e retornamos erro 500 padronizado
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

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not await the call to logger to avoid blocking the event loop
   */
  async report(error: unknown, ctx: HttpContext) {
    // Mantém o comportamento padrão (pode ser estendido futuramente para enviar para serviços externos)
    return super.report(error, ctx)
  }
}
