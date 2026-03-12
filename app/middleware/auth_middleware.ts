import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import type { JwtPayload } from '#types/jwt'
import User from '#models/user'
import '#types/http_context' // Importa extensão do HttpContext

/**
 * Middleware de autenticação
 * Verifica se o usuário está autenticado através do token JWT
 */
export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx

    // Extrai o token do header Authorization
    const authHeader = request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized({
        message: 'Authentication required. Please provide a valid token.',
      })
    }

    // Remove "Bearer " e pega apenas o token
    const token = authHeader.substring(7)

    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, env.get('JWT_SECRET')) as JwtPayload

      // Busca o usuário no banco para garantir que ainda existe
      const user = await User.find(decoded.userId)

      if (!user) {
        return response.unauthorized({
          message: 'User not found',
        })
      }

      // Adiciona o usuário e o payload do token ao contexto
      // Isso permite que os controllers acessem essas informações
      ctx.authUser = user
      ctx.authPayload = decoded

      // Continua para o próximo middleware ou rota
      await next()
    } catch (error) {
      // Token inválido, expirado ou malformado
      if (error instanceof jwt.JsonWebTokenError) {
        return response.unauthorized({
          message: 'Invalid token',
        })
      }

      if (error instanceof jwt.TokenExpiredError) {
        return response.unauthorized({
          message: 'Token expired',
        })
      }

      // Outros erros
      return response.unauthorized({
        message: 'Authentication failed',
      })
    }
  }
}
