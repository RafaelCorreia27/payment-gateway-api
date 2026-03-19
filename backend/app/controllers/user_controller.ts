import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/create_user_validator'
import { updateUserValidator } from '#validators/update_user_validator'
import bcrypt from 'bcrypt'
import { ApiResponse } from '#services/api_response'
import type { UserRoleType } from '#types/user_role'
import logger from '@adonisjs/core/services/logger'

export default class UserController {
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
      logger.error({ err: error }, '[UserController] Error in index')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving users',
          null,
          'USER_LIST_ERROR'
        )
      )
    }
  }

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
      logger.error({ err: error }, '[UserController] Error in show')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving user',
          null,
          'USER_SHOW_ERROR'
        )
      )
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = await createUserValidator.validate(request.all())
      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.unprocessableEntity(
          ApiResponse.error('Email already exists', null, 'EMAIL_ALREADY_EXISTS')
        )
      }

      const hashedPassword = await bcrypt.hash(data.password, 10)
      const user = await User.create({
        email: data.email,
        password: hashedPassword,
        role: (data.role || 'USER') as UserRoleType, // Padrão: USER
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
    } catch (error: any) {
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      logger.error({ err: error }, '[UserController] Error in store')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while creating user',
          null,
          'USER_CREATE_ERROR'
        )
      )
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.notFound(ApiResponse.error('User not found', null, 'NOT_FOUND'))
      }

      const data = await updateUserValidator.validate(request.all())

      if (data.email && data.email !== user.email) {
        const existingUser = await User.findBy('email', data.email)
        if (existingUser) {
          return response.unprocessableEntity(
            ApiResponse.error('Email already exists', null, 'EMAIL_ALREADY_EXISTS')
          )
        }
        user.email = data.email
      }

      if (data.password) {
        user.password = await bcrypt.hash(data.password, 10)
      }

      if (data.role !== undefined) {
        user.role = data.role as UserRoleType
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
    } catch (error: any) {
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      logger.error({ err: error }, '[UserController] Error in update')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while updating user',
          null,
          'USER_UPDATE_ERROR'
        )
      )
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.notFound(ApiResponse.error('User not found', null, 'NOT_FOUND'))
      }

      await user.delete()

      return response.ok(ApiResponse.success(null, 'User deleted successfully'))
    } catch (error) {
      logger.error({ err: error }, '[UserController] Error in destroy')
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
