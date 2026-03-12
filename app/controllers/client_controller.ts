import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'

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

      return response.ok({
        message: 'Clients retrieved successfully',
        clients: clients.map((client) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        })),
      })
    } catch (error) {
      console.error('[ClientController] Error in index:', error)
      return response.internalServerError({
        message: 'An error occurred while retrieving clients',
      })
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
        return response.notFound({
          message: 'Client not found',
        })
      }

      // Carrega transações do cliente com relacionamentos
      await client.load('transactions', (transactionsQuery) => {
        transactionsQuery
          .preload('gateway')
          .preload('products', (productsQuery) => {
            productsQuery.pivotColumns(['quantity'])
          })
          .orderBy('createdAt', 'desc')
      })

      // Formata transações para resposta
      const transactions = client.transactions.map((transaction) => ({
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
        products: transaction.products.map((product) => ({
          id: product.id,
          name: product.name,
          amount: product.amount,
          quantity: product.$extras.pivot_quantity,
        })),
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      }))

      return response.ok({
        message: 'Client retrieved successfully',
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
          transactions,
        },
      })
    } catch (error) {
      console.error('[ClientController] Error in show:', error)
      return response.internalServerError({
        message: 'An error occurred while retrieving client',
      })
    }
  }
}
