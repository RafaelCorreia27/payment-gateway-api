import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * The middleware is used to force JSON response for all the HTTP
 * requests, regardless of the "Accept" header value.
 */
export default class ForceJsonResponseMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    ctx.request.updateAcceptHeader('application/json')

    return next()
  }
}
