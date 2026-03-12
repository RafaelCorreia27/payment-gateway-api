import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'
import type { JwtPayload } from '#types/jwt'

/**
 * Estende o HttpContext do AdonisJS para incluir informações de autenticação
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    authUser?: User
    authPayload?: JwtPayload
  }
}
