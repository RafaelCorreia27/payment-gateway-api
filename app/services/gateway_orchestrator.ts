import type { IGateway } from './interfaces/igateway.js'
import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  RefundTransactionRequest,
  RefundTransactionResponse,
} from '#types/gateway'
import Gateway from '#models/gateway'
import { Gateway1Service } from './gateway1_service.js'
import { Gateway2Service } from './gateway2_service.js'
import logger from '@adonisjs/core/services/logger'

export interface OrchestrationResult {
  success: boolean
  gatewayName?: string
  transactionId?: string
  externalId?: string
  message?: string
  error?: string
  attempts?: Array<{
    gatewayName: string
    success: boolean
    error?: string
  }>
}

export class GatewayOrchestrator {
  private readonly gatewayServices: Map<string, () => IGateway> = new Map<string, () => IGateway>([
    ['Gateway 1', () => new Gateway1Service()],
    ['Gateway 2', () => new Gateway2Service()],
  ])

  private async getActiveGateways(): Promise<Gateway[]> {
    return await Gateway.query()
      .where('isActive', true)
      .orderBy('priority', 'asc')
      .exec()
  }

  private getGatewayService(gatewayName: string): IGateway | null {
    const serviceFactory = this.gatewayServices.get(gatewayName)
    if (!serviceFactory) {
      logger.warn(`[GatewayOrchestrator] Gateway service not found: ${gatewayName}`)
      return null
    }
    return serviceFactory()
  }

  async processPayment(data: CreateTransactionRequest): Promise<OrchestrationResult> {
    const gateways = await this.getActiveGateways()

    if (gateways.length === 0) {
      return {
        success: false,
        error: 'No active gateways available',
        attempts: [],
      }
    }

    const attempts: Array<{ gatewayName: string; success: boolean; error?: string }> = []

    for (const gateway of gateways) {
      const gatewayService = this.getGatewayService(gateway.name)

      if (!gatewayService) {
        attempts.push({
          gatewayName: gateway.name,
          success: false,
          error: 'Gateway service not found',
        })
        continue
      }

      try {
        const result = await gatewayService.createTransaction(data)

        attempts.push({
          gatewayName: gateway.name,
          success: result.success,
          error: result.error,
        })

        if (result.success) {
          return {
            success: true,
            gatewayName: gateway.name,
            transactionId: result.transactionId,
            externalId: result.externalId,
            message: `Payment processed successfully via ${gateway.name}`,
            attempts,
          }
        }

        logger.info(
          `[GatewayOrchestrator] Gateway ${gateway.name} failed: ${result.error}. Trying next gateway...`
        )
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        attempts.push({
          gatewayName: gateway.name,
          success: false,
          error: errorMessage,
        })
        logger.error({ err: error, gatewayName: gateway.name }, `[GatewayOrchestrator] Error processing with ${gateway.name}`)
      }
    }

    return {
      success: false,
      error: 'All gateways failed to process payment',
      attempts,
    }
  }

  async processRefund(
    data: RefundTransactionRequest,
    gatewayName?: string
  ): Promise<OrchestrationResult> {
    if (gatewayName) {
      const gatewayService = this.getGatewayService(gatewayName)
      if (!gatewayService) {
        return {
          success: false,
          error: `Gateway service not found: ${gatewayName}`,
        }
      }

      const result = await gatewayService.refundTransaction(data)
      return {
        success: result.success,
        gatewayName,
        message: result.message,
        error: result.error,
      }
    }

    const gateways = await this.getActiveGateways()
    const attempts: Array<{ gatewayName: string; success: boolean; error?: string }> = []

    for (const gateway of gateways) {
      const gatewayService = this.getGatewayService(gateway.name)

      if (!gatewayService) {
        attempts.push({
          gatewayName: gateway.name,
          success: false,
          error: 'Gateway service not found',
        })
        continue
      }

      try {
        const result = await gatewayService.refundTransaction(data)

        attempts.push({
          gatewayName: gateway.name,
          success: result.success,
          error: result.error,
        })

        if (result.success) {
          return {
            success: true,
            gatewayName: gateway.name,
            message: `Refund processed successfully via ${gateway.name}`,
            attempts,
          }
        }

        if (result.error?.includes('not found')) {
          continue
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        attempts.push({
          gatewayName: gateway.name,
          success: false,
          error: errorMessage,
        })
      }
    }

    return {
      success: false,
      error: 'All gateways failed to process refund',
      attempts,
    }
  }

  async getAvailableGateways(): Promise<Array<{ name: string; priority: number; isActive: boolean }>> {
    const gateways = await this.getActiveGateways()
    return gateways.map((g) => ({
      name: g.name,
      priority: g.priority,
      isActive: g.isActive,
    }))
  }
}
