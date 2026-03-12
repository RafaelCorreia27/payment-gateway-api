import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import Gateway from '#models/gateway'
import { createPurchaseValidator } from '#validators/create_purchase_validator'
import { GatewayOrchestrator } from '#services/gateway_orchestrator'

/**
 * Controller responsável por processar compras (transações)
 * 
 * Funcionalidades:
 * - Valida dados de compra
 * - Calcula valor total (produto × quantidade)
 * - Cria ou atualiza cliente
 * - Orquestra gateways para processar pagamento
 * - Salva transação no banco de dados
 */
export default class PurchaseController {
  /**
   * Processa uma nova compra
   * POST /purchases
   * 
   * Fluxo:
   * 1. Valida dados de entrada
   * 2. Busca produto pelo ID
   * 3. Calcula valor total (produto.amount × quantity)
   * 4. Cria ou atualiza cliente
   * 5. Orquestra gateways para processar pagamento
   * 6. Salva transação no banco
   * 7. Associa produto à transação
   */
  async store({ request, response }: HttpContext) {
    try {
      // 1. Valida dados de entrada
      const data = await request.validateUsing(createPurchaseValidator)

      // 2. Busca produto pelo ID
      const product = await Product.find(data.productId)

      if (!product) {
        return response.notFound({
          message: 'Product not found',
        })
      }

      // 3. Calcula valor total (produto.amount × quantity)
      // produto.amount já está em centavos
      const totalAmount = product.amount * data.quantity

      // 4. Cria ou atualiza cliente
      // Se cliente já existe com esse email, atualiza nome se necessário
      // Se não existe, cria novo cliente
      const client = await Client.updateOrCreate(
        { email: data.email },
        {
          name: data.name,
          email: data.email,
        }
      )

      // 5. Orquestra gateways para processar pagamento
      const orchestrator = new GatewayOrchestrator()

      const paymentResult = await orchestrator.processPayment({
        amount: totalAmount,
        name: data.name,
        email: data.email,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
      })

      // 6. Determina status da transação baseado no resultado do pagamento
      let transactionStatus: 'pending' | 'approved' | 'rejected' | 'refunded' = 'rejected'
      let gatewayId: number | null = null
      let externalId: string | null = null

      if (paymentResult.success && paymentResult.gatewayName) {
        transactionStatus = 'approved'
        externalId = paymentResult.externalId || paymentResult.transactionId || null

        // Busca gateway pelo nome para obter o ID
        const gateway = await Gateway.findBy('name', paymentResult.gatewayName)
        if (gateway) {
          gatewayId = gateway.id
        }
      }

      // Extrai últimos 4 dígitos do cartão para armazenar
      const cardLastNumbers = data.cardNumber.slice(-4)

      // 7. Salva transação no banco
      const transaction = await Transaction.create({
        clientId: client.id,
        gatewayId,
        externalId,
        status: transactionStatus,
        amount: totalAmount,
        cardLastNumbers,
      })

      // 8. Associa produto à transação através da tabela pivot
      await transaction.related('products').attach({
        [product.id]: {
          quantity: data.quantity,
        },
      })

      // Retorna resposta baseada no resultado do pagamento
      if (paymentResult.success) {
        return response.created({
          message: 'Purchase processed successfully',
          transaction: {
            id: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            gateway: paymentResult.gatewayName,
            externalId: transaction.externalId,
            createdAt: transaction.createdAt,
          },
        })
      } else {
        // Pagamento falhou em todos os gateways
        return response.unprocessableEntity({
          message: 'Payment processing failed',
          error: paymentResult.error,
          transaction: {
            id: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            createdAt: transaction.createdAt,
          },
          attempts: paymentResult.attempts,
        })
      }
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      // Outros erros
      console.error('[PurchaseController] Error:', error)
      return response.internalServerError({
        message: 'An error occurred while processing the purchase',
      })
    }
  }
}
