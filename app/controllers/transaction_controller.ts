import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import { refundTransactionValidator } from '#validators/refund_transaction_validator'
import { GatewayOrchestrator } from '#services/gateway_orchestrator'
import { ApiResponse } from '#services/api_response'

/**
 * Controller responsável por visualizar e gerenciar transações
 * 
 * Funcionalidades:
 * - Listar todas as transações
 * - Detalhes de transação
 * - Processar reembolso de transação
 * 
 * Requer autenticação para visualização
 * Requer role ADMIN ou FINANCE para reembolso
 */
export default class TransactionController {
  /**
   * Lista todas as transações
   * GET /transactions
   * 
   * Retorna lista de transações com informações básicas
   * Ordenadas por data (mais recentes primeiro)
   */
  async index({ response }: HttpContext) {
    try {
      const transactions = await Transaction.query()
        .preload('client')
        .preload('gateway')
        .orderBy('createdAt', 'desc')
        .exec()

      return response.ok(
        ApiResponse.success(
          {
            transactions: transactions.map((transaction) => ({
              id: transaction.id,
              status: transaction.status,
              amount: transaction.amount,
              cardLastNumbers: transaction.cardLastNumbers,
              client: {
                id: transaction.client.id,
                name: transaction.client.name,
                email: transaction.client.email,
              },
              gateway: transaction.gateway
                ? {
                    id: transaction.gateway.id,
                    name: transaction.gateway.name,
                  }
                : null,
              externalId: transaction.externalId,
              createdAt: transaction.createdAt,
              updatedAt: transaction.updatedAt,
            })),
          },
          'Transactions retrieved successfully'
        )
      )
    } catch (error) {
      console.error('[TransactionController] Error in index:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving transactions',
          null,
          'TRANSACTION_LIST_ERROR'
        )
      )
    }
  }

  /**
   * Retorna detalhes de uma transação específica
   * GET /transactions/:id
   * 
   * Retorna informações completas da transação incluindo cliente, gateway e produtos
   */
  async show({ params, response }: HttpContext) {
    try {
      const transaction = await Transaction.query()
        .where('id', params.id)
        .preload('client')
        .preload('gateway')
        .preload('products', (productsQuery) => {
          productsQuery.pivotColumns(['quantity'])
        })
        .first()

      if (!transaction) {
        return response.notFound(ApiResponse.error('Transaction not found', null, 'NOT_FOUND'))
      }

      return response.ok(
        ApiResponse.success(
          {
            transaction: {
              id: transaction.id,
              status: transaction.status,
              amount: transaction.amount,
              cardLastNumbers: transaction.cardLastNumbers,
              client: {
                id: transaction.client.id,
                name: transaction.client.name,
                email: transaction.client.email,
              },
              gateway: transaction.gateway
                ? {
                    id: transaction.gateway.id,
                    name: transaction.gateway.name,
                    isActive: transaction.gateway.isActive,
                    priority: transaction.gateway.priority,
                  }
                : null,
              externalId: transaction.externalId,
              products: transaction.products.map((product) => ({
                id: product.id,
                name: product.name,
                amount: product.amount,
                quantity: product.$extras.pivot_quantity,
              })),
              createdAt: transaction.createdAt,
              updatedAt: transaction.updatedAt,
            },
          },
          'Transaction retrieved successfully'
        )
      )
    } catch (error) {
      console.error('[TransactionController] Error in show:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving transaction',
          null,
          'TRANSACTION_SHOW_ERROR'
        )
      )
    }
  }

  /**
   * Processa reembolso de uma transação
   * POST /transactions/:id/refund
   * 
   * Processa reembolso através do gateway que processou a transação original
   * Atualiza status da transação para 'refunded' se bem-sucedido
   * 
   * Requer role ADMIN ou FINANCE
   */
  async refund({ params, response }: HttpContext) {
    try {
      // Busca transação pelo ID
      const transaction = await Transaction.query()
        .where('id', params.id)
        .preload('gateway')
        .first()

      if (!transaction) {
        return response.notFound(ApiResponse.error('Transaction not found', null, 'NOT_FOUND'))
      }

      // Verifica se transação já foi reembolsada
      if (transaction.status === 'refunded') {
        return response.unprocessableEntity(
          ApiResponse.error(
            'Transaction has already been refunded',
            null,
            'ALREADY_REFUNDED'
          )
        )
      }

      // Verifica se transação foi aprovada (só pode reembolsar transações aprovadas)
      if (transaction.status !== 'approved') {
        return response.unprocessableEntity(
          ApiResponse.error(
            'Only approved transactions can be refunded',
            null,
            'INVALID_STATUS_FOR_REFUND'
          )
        )
      }

      // Verifica se transação tem gateway (necessário para reembolso)
      if (!transaction.gatewayId || !transaction.externalId) {
        return response.unprocessableEntity(
          ApiResponse.error(
            'Transaction does not have gateway information for refund',
            null,
            'MISSING_GATEWAY_INFO'
          )
        )
      }

      // Orquestra reembolso através do gateway
      const orchestrator = new GatewayOrchestrator()

      const refundResult = await orchestrator.processRefund(
        {
          transactionId: transaction.externalId,
        },
        transaction.gateway.name
      )

      // Se reembolso bem-sucedido, atualiza status da transação
      if (refundResult.success) {
        transaction.status = 'refunded'
        await transaction.save()

        return response.ok(
          ApiResponse.success(
            {
              transaction: {
                id: transaction.id,
                status: transaction.status,
                amount: transaction.amount,
                gateway: transaction.gateway.name,
                updatedAt: transaction.updatedAt,
              },
            },
            'Refund processed successfully'
          )
        )
      } else {
        // Reembolso falhou
        return response.unprocessableEntity(
          ApiResponse.error('Refund processing failed', {
            error: refundResult.error,
            attempts: refundResult.attempts,
          }, 'REFUND_FAILED')
        )
      }
    } catch (error) {
      console.error('[TransactionController] Error in refund:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while processing refund',
          null,
          'REFUND_ERROR'
        )
      )
    }
  }
}
