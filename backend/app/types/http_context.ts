import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'
import type { JwtPayload } from '#types/jwt'

// Adiciona authUser e authPayload ao contexto (usado pelo middleware de auth)
declare module '@adonisjs/core/http' {
  interface HttpContext {
    authUser?: User
    authPayload?: JwtPayload
  }
}
