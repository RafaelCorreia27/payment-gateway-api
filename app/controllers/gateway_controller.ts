import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'
import { updateGatewayValidator } from '#validators/update_gateway_validator'
import { ApiResponse } from '#services/api_response'
import logger from '@adonisjs/core/services/logger'

export default class GatewayController {
  async toggle({ params, response }: HttpContext) {
    try {
      const gateway = await Gateway.find(params.id)

      if (!gateway) {
        return response.notFound(ApiResponse.error('Gateway not found', null, 'NOT_FOUND'))
      }

      gateway.isActive = !gateway.isActive
      await gateway.save()

      return response.ok(
        ApiResponse.success(
          {
            gateway: {
              id: gateway.id,
              name: gateway.name,
              isActive: gateway.isActive,
              priority: gateway.priority,
            },
          },
          `Gateway ${gateway.isActive ? 'activated' : 'deactivated'} successfully`
        )
      )
    } catch (error) {
      logger.error({ err: error }, '[GatewayController] Error in toggle')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while toggling gateway status',
          null,
          'GATEWAY_TOGGLE_ERROR'
        )
      )
    }
  }

  async updatePriority({ params, request, response }: HttpContext) {
    try {
      const gateway = await Gateway.find(params.id)

      if (!gateway) {
        return response.notFound(ApiResponse.error('Gateway not found', null, 'NOT_FOUND'))
      }

      const { priority } = await updateGatewayValidator.validate(request.all())

      if (priority === undefined) {
        return response.unprocessableEntity(
          ApiResponse.error('Priority is required', null, 'VALIDATION_ERROR')
        )
      }

      gateway.priority = priority
      await gateway.save()

      return response.ok(
        ApiResponse.success(
          {
            gateway: {
              id: gateway.id,
              name: gateway.name,
              isActive: gateway.isActive,
              priority: gateway.priority,
            },
          },
          'Gateway priority updated successfully'
        )
      )
    } catch (error: any) {
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      logger.error({ err: error }, '[GatewayController] Error in updatePriority')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while updating gateway priority',
          null,
          'GATEWAY_PRIORITY_ERROR'
        )
      )
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const gateway = await Gateway.find(params.id)

      if (!gateway) {
        return response.notFound(ApiResponse.error('Gateway not found', null, 'NOT_FOUND'))
      }

      // Valida dados de entrada
      const data = await updateGatewayValidator.validate(request.all())

      // Atualiza apenas os campos enviados
      if (data.isActive !== undefined) {
        gateway.isActive = data.isActive
      }

      if (data.priority !== undefined) {
        gateway.priority = data.priority
      }

      await gateway.save()

      return response.ok(
        ApiResponse.success(
          {
            gateway: {
              id: gateway.id,
              name: gateway.name,
              isActive: gateway.isActive,
              priority: gateway.priority,
            },
          },
          'Gateway updated successfully'
        )
      )
    } catch (error: any) {
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      logger.error({ err: error }, '[GatewayController] Error in update')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while updating gateway',
          null,
          'GATEWAY_UPDATE_ERROR'
        )
      )
    }
  }
}
