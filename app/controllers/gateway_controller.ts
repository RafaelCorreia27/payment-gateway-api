import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'
import { updateGatewayValidator } from '#validators/update_gateway_validator'
import { ApiResponse } from '#services/api_response'

/**
 * Controller responsável por gerenciar gateways
 * 
 * Funcionalidades:
 * - Ativar/desativar gateway
 * - Alterar prioridade de gateway
 * 
 * Requer autenticação e roles ADMIN ou MANAGER
 */
export default class GatewayController {
  /**
   * Ativa ou desativa um gateway
   * PATCH /gateways/:id/toggle
   * 
   * Alterna o status isActive do gateway
   * Se está ativo, desativa. Se está inativo, ativa.
   */
  async toggle({ params, response }: HttpContext) {
    try {
      const gateway = await Gateway.find(params.id)

      if (!gateway) {
        return response.notFound(ApiResponse.error('Gateway not found', null, 'NOT_FOUND'))
      }

      // Alterna o status
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
      console.error('[GatewayController] Error in toggle:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while toggling gateway status',
          null,
          'GATEWAY_TOGGLE_ERROR'
        )
      )
    }
  }

  /**
   * Atualiza a prioridade de um gateway
   * PATCH /gateways/:id/priority
   * 
   * Atualiza apenas a prioridade do gateway
   * Valida que a prioridade é um número positivo
   */
  async updatePriority({ params, request, response }: HttpContext) {
    try {
      const gateway = await Gateway.find(params.id)

      if (!gateway) {
        return response.notFound(ApiResponse.error('Gateway not found', null, 'NOT_FOUND'))
      }

      // Valida dados de entrada
      const { priority } = await request.validateUsing(updateGatewayValidator)

      if (priority === undefined) {
        return response.unprocessableEntity(
          ApiResponse.error('Priority is required', null, 'VALIDATION_ERROR')
        )
      }

      // Atualiza a prioridade
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
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      console.error('[GatewayController] Error in updatePriority:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while updating gateway priority',
          null,
          'GATEWAY_PRIORITY_ERROR'
        )
      )
    }
  }

  /**
   * Atualiza gateway (método genérico)
   * PATCH /gateways/:id
   * 
   * Permite atualizar isActive e/ou priority
   * Ambos os campos são opcionais
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const gateway = await Gateway.find(params.id)

      if (!gateway) {
        return response.notFound(ApiResponse.error('Gateway not found', null, 'NOT_FOUND'))
      }

      // Valida dados de entrada
      const data = await request.validateUsing(updateGatewayValidator)

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
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      console.error('[GatewayController] Error in update:', error)
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
