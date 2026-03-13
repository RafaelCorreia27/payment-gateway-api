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

/**
 * Interface para resultado da orquestração
 */
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

/**
 * Service responsável por orquestrar múltiplos gateways
 * 
 * Funcionalidades:
 * - Busca gateways ativos do banco ordenados por prioridade
 * - Tenta processar pagamento em cada gateway por ordem de prioridade
 * - Implementa lógica de fallback (se primeiro falhar, tenta segundo)
 * - Retorna sucesso se qualquer gateway funcionar
 * - Retorna erro apenas se todos falharem
 */
export class GatewayOrchestrator {
  /**
   * Mapeia nomes de gateways para suas classes de serviço
   * Facilita a criação de instâncias dinamicamente
   */
  private readonly gatewayServices: Map<string, () => IGateway> = new Map<string, () => IGateway>([
    ['Gateway 1', () => new Gateway1Service()],
    ['Gateway 2', () => new Gateway2Service()],
    // Adicionar novos gateways aqui:
    // ['Gateway 3', () => new Gateway3Service()],
  ])

  /**
   * Busca gateways ativos do banco de dados ordenados por prioridade
   * 
   * @returns Array de gateways ordenados por prioridade (menor número = maior prioridade)
   */
  private async getActiveGateways(): Promise<Gateway[]> {
    return await Gateway.query()
      .where('isActive', true)
      .orderBy('priority', 'asc')
      .exec()
  }

  /**
   * Cria uma instância do serviço do gateway baseado no nome
   * 
   * @param gatewayName Nome do gateway (ex: "Gateway 1", "Gateway 2")
   * @returns Instância do serviço do gateway ou null se não encontrado
   */
  private getGatewayService(gatewayName: string): IGateway | null {
    const serviceFactory = this.gatewayServices.get(gatewayName)
    if (!serviceFactory) {
      logger.warn(`[GatewayOrchestrator] Gateway service not found: ${gatewayName}`)
      return null
    }
    return serviceFactory()
  }

  /**
   * Processa um pagamento tentando gateways por ordem de prioridade
   * 
   * Fluxo:
   * 1. Busca gateways ativos ordenados por prioridade
   * 2. Para cada gateway:
   *    a. Cria instância do serviço
   *    b. Tenta processar pagamento
   *    c. Se sucesso, retorna imediatamente
   *    d. Se falha, registra erro e tenta próximo gateway
   * 3. Se todos falharem, retorna erro
   * 
   * @param data Dados da transação
   * @returns Resultado da orquestração com informações do gateway que processou ou erros
   */
  async processPayment(data: CreateTransactionRequest): Promise<OrchestrationResult> {
    // Busca gateways ativos ordenados por prioridade
    const gateways = await this.getActiveGateways()

    if (gateways.length === 0) {
      return {
        success: false,
        error: 'No active gateways available',
        attempts: [],
      }
    }

    const attempts: Array<{ gatewayName: string; success: boolean; error?: string }> = []

    // Tenta cada gateway por ordem de prioridade
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
        // Tenta processar pagamento no gateway atual
        const result = await gatewayService.createTransaction(data)

        // Registra tentativa
        attempts.push({
          gatewayName: gateway.name,
          success: result.success,
          error: result.error,
        })

        // Se sucesso, retorna imediatamente
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

        // Se falhou, continua para próximo gateway
        logger.info(
          `[GatewayOrchestrator] Gateway ${gateway.name} failed: ${result.error}. Trying next gateway...`
        )
      } catch (error) {
        // Erro inesperado ao processar no gateway
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        attempts.push({
          gatewayName: gateway.name,
          success: false,
          error: errorMessage,
        })
        logger.error({ err: error, gatewayName: gateway.name }, `[GatewayOrchestrator] Error processing with ${gateway.name}`)
      }
    }

    // Todos os gateways falharam
    return {
      success: false,
      error: 'All gateways failed to process payment',
      attempts,
    }
  }

  /**
   * Processa um reembolso tentando gateways por ordem de prioridade
   * 
   * Diferente do processPayment, o reembolso precisa saber qual gateway processou
   * a transação original. Por isso, tenta todos os gateways até encontrar o correto.
   * 
   * @param data Dados do reembolso (deve conter transactionId e externalId se disponível)
   * @param gatewayName Nome do gateway que processou a transação original (opcional)
   * @returns Resultado do reembolso
   */
  async processRefund(
    data: RefundTransactionRequest,
    gatewayName?: string
  ): Promise<OrchestrationResult> {
    // Se sabemos qual gateway processou, tenta apenas esse
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

    // Se não sabemos qual gateway processou, tenta todos por ordem de prioridade
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

        // Se sucesso, retorna imediatamente
        if (result.success) {
          return {
            success: true,
            gatewayName: gateway.name,
            message: `Refund processed successfully via ${gateway.name}`,
            attempts,
          }
        }

        // Se erro específico de "não encontrado", pode ser que não seja este gateway
        // Continua tentando outros gateways
        if (result.error?.includes('not found')) {
          continue
        }

        // Outros erros também continuam para próximo gateway
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        attempts.push({
          gatewayName: gateway.name,
          success: false,
          error: errorMessage,
        })
      }
    }

    // Todos os gateways falharam
    return {
      success: false,
      error: 'All gateways failed to process refund',
      attempts,
    }
  }

  /**
   * Retorna lista de gateways disponíveis e suas prioridades
   * Útil para debug e monitoramento
   * 
   * @returns Array com informações dos gateways
   */
  async getAvailableGateways(): Promise<Array<{ name: string; priority: number; isActive: boolean }>> {
    const gateways = await this.getActiveGateways()
    return gateways.map((g) => ({
      name: g.name,
      priority: g.priority,
      isActive: g.isActive,
    }))
  }
}
