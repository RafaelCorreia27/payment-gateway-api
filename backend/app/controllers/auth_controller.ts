import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/login_validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import { UserRole } from '#types/user_role'
import { ApiResponse } from '#services/api_response'
import logger from '@adonisjs/core/services/logger'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    try {
      const { email, password } = await loginValidator.validate(request.all())
      const user = await User.findBy('email', email)

      if (!user) {
        return response.unauthorized(
          ApiResponse.error('Invalid credentials', null, 'INVALID_CREDENTIALS')
        )
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return response.unauthorized(
          ApiResponse.error('Invalid credentials', null, 'INVALID_CREDENTIALS')
        )
      }

      const jwtSecret = String(env.get('JWT_SECRET'))
      const jwtExpiresIn = String(env.get('JWT_EXPIRES_IN'))
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        jwtSecret,
        {
          expiresIn: jwtExpiresIn,
        } as jwt.SignOptions
      )

      return response.ok(
        ApiResponse.success(
          {
            token,
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
            },
          },
          'Login successful'
        )
      )
    } catch (error: any) {
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }
      // Erro de DB/bcrypt: retorno 401 pra não vazar detalhes
      logger.error({ err: error }, '[AuthController] Error during login')
      return response.unauthorized(
        ApiResponse.error('Invalid credentials', null, 'INVALID_CREDENTIALS')
      )
    }
  }
}
