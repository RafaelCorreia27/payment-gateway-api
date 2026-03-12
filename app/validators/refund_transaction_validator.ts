import vine from '@adonisjs/vinejs'

/**
 * Validator para validação de dados de reembolso de transação
 * 
 * Campos validados:
 * - transactionId: ID da transação (número inteiro positivo)
 */
export const refundTransactionValidator = vine.compile(
  vine.object({
    transactionId: vine
      .number()
      .min(1, 'Transaction ID must be greater than 0')
      .withoutDecimals(),
  })
)
