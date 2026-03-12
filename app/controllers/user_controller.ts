import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/create_user_validator'
import { updateUserValidator } from '#validators/update_user_validator'
import bcrypt from 'bcrypt'

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

      return response.ok({
        message: 'Users retrieved successfully',
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
      })
    } catch (error) {
      console.error('[UserController] Error in index:', error)
      return response.internalServerError({
        message: 'An error occurred while retrieving users',
      })
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
        return response.notFound({
          message: 'User not found',
        })
      }

      return response.ok({
        message: 'User retrieved successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      console.error('[UserController] Error in show:', error)
      return response.internalServerError({
        message: 'An error occurred while retrieving user',
      })
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
        return response.unprocessableEntity({
          message: 'Email already exists',
        })
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(data.password, 10)

      // Cria usuário
      const user = await User.create({
        email: data.email,
        password: hashedPassword,
        role: data.role || 'USER', // Padrão: USER
      })

      return response.created({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      })
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      console.error('[UserController] Error in store:', error)
      return response.internalServerError({
        message: 'An error occurred while creating user',
      })
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
        return response.notFound({
          message: 'User not found',
        })
      }

      // Valida dados de entrada
      const data = await request.validateUsing(updateUserValidator)

      // Verifica se email já existe para outro usuário (validação adicional)
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findBy('email', data.email)
        if (existingUser) {
          return response.unprocessableEntity({
            message: 'Email already exists',
          })
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

      return response.ok({
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      console.error('[UserController] Error in update:', error)
      return response.internalServerError({
        message: 'An error occurred while updating user',
      })
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
        return response.notFound({
          message: 'User not found',
        })
      }

      await user.delete()

      return response.ok({
        message: 'User deleted successfully',
      })
    } catch (error) {
      console.error('[UserController] Error in destroy:', error)
      return response.internalServerError({
        message: 'An error occurred while deleting user',
      })
    }
  }
}
