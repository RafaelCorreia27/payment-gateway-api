import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import Transaction from '#models/transaction'
import Product from '#models/product'
import { ApiResponse } from '#services/api_response'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { ManyToManyQueryBuilderContract } from '@adonisjs/lucid/types/relations'

/**
 * Controller responsável por visualizar clientes
 * 
 * Funcionalidades:
 * - Listar todos os clientes
 * - Detalhes de cliente com todas suas compras
 * 
 * Requer autenticação (qualquer role autenticada)
 */
export default class ClientController {
  /**
   * Lista todos os clientes
   * GET /clients
   * 
   * Retorna lista de clientes com informações básicas
   */
  async index({ response }: HttpContext) {
    try {
      const clients = await Client.all()

      return response.ok(
        ApiResponse.success(
          {
            clients: clients.map((client) => ({
              id: client.id,
              name: client.name,
              email: client.email,
              createdAt: client.createdAt,
              updatedAt: client.updatedAt,
            })),
          },
          'Clients retrieved successfully'
        )
      )
    } catch (error) {
      console.error('[ClientController] Error in index:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving clients',
          null,
          'CLIENT_LIST_ERROR'
        )
      )
    }
  }

  /**
   * Retorna detalhes de um cliente específico com todas suas compras
   * GET /clients/:id
   * 
   * Retorna informações do cliente e lista de todas suas transações
   */
  async show({ params, response }: HttpContext) {
    try {
      const client = await Client.find(params.id)

      if (!client) {
        return response.notFound(ApiResponse.error('Client not found', null, 'NOT_FOUND'))
      }

      // Carrega transações do cliente com relacionamentos
      await client.load('transactions', (transactionsQuery: ModelQueryBuilderContract<typeof Transaction>) => {
        transactionsQuery
          .preload('gateway')
          .preload('products', (productsQuery: ManyToManyQueryBuilderContract<typeof Product, Product>) => {
            productsQuery.pivotColumns(['quantity'])
          })
          .orderBy('createdAt', 'desc')
      })

      // Formata transações para resposta
      const transactions = client.transactions.map((transaction: Transaction) => ({
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        cardLastNumbers: transaction.cardLastNumbers,
        gateway: transaction.gateway
          ? {
              id: transaction.gateway.id,
              name: transaction.gateway.name,
            }
          : null,
        externalId: transaction.externalId,
        products: transaction.products.map((product: Product) => ({
          id: product.id,
          name: product.name,
          amount: product.amount,
          quantity: product.$extras.pivot_quantity,
        })),
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      }))

      return response.ok(
        ApiResponse.success(
          {
            client: {
              id: client.id,
              name: client.name,
              email: client.email,
              createdAt: client.createdAt,
              updatedAt: client.updatedAt,
              transactions,
            },
          },
          'Client retrieved successfully'
        )
      )
    } catch (error) {
      console.error('[ClientController] Error in show:', error)
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while retrieving client',
          null,
          'CLIENT_SHOW_ERROR'
        )
      )
    }
  }
}
