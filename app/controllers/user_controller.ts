import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/create_user_validator'
import { updateUserValidator } from '#validators/update_user_validator'
import bcrypt from 'bcrypt'
import { ApiResponse } from '#services/api_response'

/**
 * Controller responsável por gerenciar usuários (CRUD)
 * 
 * Funcionalidades:
 * - Listar usuários
 * - Detalhes de usuário
 * - Criar usuário
 * - Atualizar usuário
 * - Deletar usuário
 * 
 * Requer autenticação e roles ADMIN ou MANAGER
 */
export default class UserController {
  /**
   * Lista todos os usuários
   * GET /users
   * 
   * Retorna lista de usuários (sem senhas)
   */
  async index({ response }: HttpContext) {
    try {
      const users = await User.all()

      return response.ok(
        ApiResponse.success(
          {
            users: users.map((user) => ({
              id: user.id,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            })),
          },
          'Users retrieved successfully'
        )
      )
    } catch (error) {
      console.error('[UserController] Error in index:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving users',
          null,
          'USER_LIST_ERROR'
        )
      )
    }
  }

  /**
   * Retorna detalhes de um usuário específico
   * GET /users/:id
   * 
   * Retorna informações do usuário (sem senha)
   */
  async show({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.notFound(ApiResponse.error('User not found', null, 'NOT_FOUND'))
      }

      return response.ok(
        ApiResponse.success(
          {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          },
          'User retrieved successfully'
        )
      )
    } catch (error) {
      console.error('[UserController] Error in show:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving user',
          null,
          'USER_SHOW_ERROR'
        )
      )
    }
  }

  /**
   * Cria um novo usuário
   * POST /users
   * 
   * Cria usuário com email, senha e role
   * Senha é hasheada antes de salvar
   */
  async store({ request, response }: HttpContext) {
    try {
      // Valida dados de entrada
      const data = await request.validateUsing(createUserValidator)

      // Verifica se email já existe (validação adicional)
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.unprocessableEntity(
          ApiResponse.error('Email already exists', null, 'EMAIL_ALREADY_EXISTS')
        )
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // Cria usuário
      const user = await User.create({
        email: data.email,
        password: hashedPassword,
        role: data.role || 'USER', // Padrão: USER
      })

      return response.created(
        ApiResponse.success(
          {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt,
            },
          },
          'User created successfully'
        )
      )
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      console.error('[UserController] Error in store:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while creating user',
          null,
          'USER_CREATE_ERROR'
        )
      )
    }
  }

  /**
   * Atualiza um usuário existente
   * PUT /users/:id
   * 
   * Atualiza email, senha e/ou role
   * Apenas campos enviados são atualizados
   * Senha é hasheada se fornecida
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.notFound(ApiResponse.error('User not found', null, 'NOT_FOUND'))
      }

      // Valida dados de entrada
      const data = await request.validateUsing(updateUserValidator)

      // Verifica se email já existe para outro usuário (validação adicional)
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findBy('email', data.email)
        if (existingUser) {
          return response.unprocessableEntity(
            ApiResponse.error('Email already exists', null, 'EMAIL_ALREADY_EXISTS')
          )
        }
        user.email = data.email
      }

      // Atualiza senha se fornecida
      if (data.password) {
        user.password = await bcrypt.hash(data.password, 10)
      }

      // Atualiza role se fornecido
      if (data.role !== undefined) {
        user.role = data.role
      }

      await user.save()

      return response.ok(
        ApiResponse.success(
          {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              updatedAt: user.updatedAt,
            },
          },
          'User updated successfully'
        )
      )
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      console.error('[UserController] Error in update:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while updating user',
          null,
          'USER_UPDATE_ERROR'
        )
      )
    }
  }

  /**
   * Deleta um usuário
   * DELETE /users/:id
   * 
   * Remove usuário do banco de dados
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.notFound(ApiResponse.error('User not found', null, 'NOT_FOUND'))
      }

      await user.delete()

      return response.ok(ApiResponse.success(null, 'User deleted successfully'))
    } catch (error) {
      console.error('[UserController] Error in destroy:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while deleting user',
          null,
          'USER_DELETE_ERROR'
        )
      )
    }
  }
}
