import vine from '@vinejs/vine'

export const createPurchaseValidator = vine.compile(
  vine.object({
    productId: vine
      .number()
      .min(1)
      .withoutDecimals(),

    quantity: vine
      .number()
      .min(1)
      .max(1000)
      .withoutDecimals(),

    name: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(255),

    email: vine
      .string()
      .email()
      .trim()
      .normalizeEmail(),

    cardNumber: vine
      .string()
      .trim()
      .regex(/^\d{13,19}$/),

    cvv: vine
      .string()
      .trim()
      .regex(/^\d{3,4}$/),
  })
)
