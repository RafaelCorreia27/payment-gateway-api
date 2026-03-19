import vine from '@vinejs/vine'

export const refundTransactionValidator = vine.compile(
  vine.object({
    transactionId: vine
      .number()
      .min(1)
      .withoutDecimals(),
  })
)
