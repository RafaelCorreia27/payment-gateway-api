import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import type { JwtPayload } from '#types/jwt'
import User from '#models/user'
import { ApiResponse } from '#services/api_response'
import '#types/http_context'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response } = ctx
    const authHeader = request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized(
        ApiResponse.error('Authentication required. Please provide a valid token.', null, 'UNAUTHORIZED')
      )
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, env.get('JWT_SECRET')) as JwtPayload
      const user = await User.find(decoded.userId)

      if (!user) {
        return response.unauthorized(
          ApiResponse.error('User not found', null, 'USER_NOT_FOUND')
        )
      }

      ctx.authUser = user
      ctx.authPayload = decoded
      await next()
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return response.unauthorized(
          ApiResponse.error('Invalid token', null, 'INVALID_TOKEN')
        )
      }

      if (error instanceof jwt.TokenExpiredError) {
        return response.unauthorized(
          ApiResponse.error('Token expired', null, 'TOKEN_EXPIRED')
        )
      }

      return response.unauthorized(
        ApiResponse.error('Authentication failed', null, 'AUTHENTICATION_FAILED')
      )
    }
  }
}
