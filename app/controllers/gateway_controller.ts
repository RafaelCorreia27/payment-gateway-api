import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'
import { updateGatewayValidator } from '#validators/update_gateway_validator'

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
        return response.notFound({
          message: 'Gateway not found',
        })
      }

      // Alterna o status
      gateway.isActive = !gateway.isActive
      await gateway.save()

      return response.ok({
        message: `Gateway ${gateway.isActive ? 'activated' : 'deactivated'} successfully`,
        gateway: {
          id: gateway.id,
          name: gateway.name,
          isActive: gateway.isActive,
          priority: gateway.priority,
        },
      })
    } catch (error) {
      console.error('[GatewayController] Error in toggle:', error)
      return response.internalServerError({
        message: 'An error occurred while toggling gateway status',
      })
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
        return response.notFound({
          message: 'Gateway not found',
        })
      }

      // Valida dados de entrada
      const { priority } = await request.validateUsing(updateGatewayValidator)

      if (priority === undefined) {
        return response.unprocessableEntity({
          message: 'Priority is required',
        })
      }

      // Atualiza a prioridade
      gateway.priority = priority
      await gateway.save()

      return response.ok({
        message: 'Gateway priority updated successfully',
        gateway: {
          id: gateway.id,
          name: gateway.name,
          isActive: gateway.isActive,
          priority: gateway.priority,
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

      console.error('[GatewayController] Error in updatePriority:', error)
      return response.internalServerError({
        message: 'An error occurred while updating gateway priority',
      })
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
        return response.notFound({
          message: 'Gateway not found',
        })
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

      return response.ok({
        message: 'Gateway updated successfully',
        gateway: {
          id: gateway.id,
          name: gateway.name,
          isActive: gateway.isActive,
          priority: gateway.priority,
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

      console.error('[GatewayController] Error in update:', error)
      return response.internalServerError({
        message: 'An error occurred while updating gateway',
      })
    }
  }
}
