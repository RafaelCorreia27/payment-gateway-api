import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/login_validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import { UserRole } from '#types/user_role'
import { ApiResponse } from '#services/api_response'

export default class AuthController {
  /**
   * Realiza login do usuário e retorna token JWT
   * POST /login
   */
  async login({ request, response }: HttpContext) {
    try {
      // Valida os dados de entrada
      const { email, password } = await loginValidator.validate(request.all())

      // Busca o usuário pelo email
      const user = await User.findBy('email', email)

      // Verifica se o usuário existe
      if (!user) {
        return response.unauthorized(
          ApiResponse.error('Invalid credentials', null, 'INVALID_CREDENTIALS')
        )
      }

      // Verifica se a senha está correta
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return response.unauthorized(
          ApiResponse.error('Invalid credentials', null, 'INVALID_CREDENTIALS')
        )
      }

      // Gera o token JWT
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

      // Retorna o token e informações do usuário (sem senha)
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
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      // Outros erros
      return response.internalServerError(
        ApiResponse.error('An error occurred during login', null, 'LOGIN_ERROR')
      )
    }
  }
}
