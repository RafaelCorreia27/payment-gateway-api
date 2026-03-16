import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Client from '#models/client'
import Transaction from '#models/transaction'
import Gateway from '#models/gateway'
import { createPurchaseValidator } from '#validators/create_purchase_validator'
import { GatewayOrchestrator } from '#services/gateway_orchestrator'
import { ApiResponse } from '#services/api_response'
import logger from '@adonisjs/core/services/logger'

export default class PurchaseController {
  async store({ request, response }: HttpContext) {
    try {
      const data = await createPurchaseValidator.validate(request.all())
      const product = await Product.find(data.productId)

      if (!product) {
        return response.notFound(ApiResponse.error('Product not found', null, 'NOT_FOUND'))
      }

      const totalAmount = product.amount * data.quantity

      const client = await Client.updateOrCreate(
        { email: data.email },
        {
          name: data.name,
          email: data.email,
        }
      )

      const orchestrator = new GatewayOrchestrator()

      const paymentResult = await orchestrator.processPayment({
        amount: totalAmount,
        name: data.name,
        email: data.email,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
      })

      let transactionStatus: 'pending' | 'approved' | 'rejected' | 'refunded' = 'rejected'
      let gatewayId: number | null = null
      let externalId: string | null = null

      if (paymentResult.success && paymentResult.gatewayName) {
        transactionStatus = 'approved'
        externalId = paymentResult.externalId || paymentResult.transactionId || null

        const gateway = await Gateway.findBy('name', paymentResult.gatewayName)
        if (gateway) {
          gatewayId = gateway.id
        }
      }

      const cardLastNumbers = data.cardNumber.slice(-4)

      const transaction = await Transaction.create({
        clientId: client.id,
        gatewayId,
        externalId,
        status: transactionStatus,
        amount: totalAmount,
        cardLastNumbers,
      })

      await transaction.related('products').attach({
        [product.id]: {
          quantity: data.quantity,
        },
      })

      if (paymentResult.success) {
        return response.created(
          ApiResponse.success(
            {
              transaction: {
                id: transaction.id,
                status: transaction.status,
                amount: transaction.amount,
                gateway: paymentResult.gatewayName,
                externalId: transaction.externalId,
                createdAt: transaction.createdAt,
              },
            },
            'Purchase processed successfully'
          )
        )
      } else {
        return response.unprocessableEntity(
          ApiResponse.error('Payment processing failed', {
            error: paymentResult.error,
            transaction: {
              id: transaction.id,
              status: transaction.status,
              amount: transaction.amount,
              createdAt: transaction.createdAt,
            },
            attempts: paymentResult.attempts,
          }, 'PAYMENT_FAILED')
        )
      }
    } catch (error: any) {
      if (error.messages) {
        return response.unprocessableEntity(
          ApiResponse.error('Validation failed', error.messages, 'VALIDATION_ERROR')
        )
      }

      logger.error({ err: error }, '[PurchaseController] Error')
      return response.internalServerError(
        ApiResponse.error(
          'An error occurred while processing the purchase',
          null,
          'PURCHASE_ERROR'
        )
      )
    }
  }
}
