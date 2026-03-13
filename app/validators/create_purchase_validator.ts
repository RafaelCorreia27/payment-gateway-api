import vine from '@vinejs/vine'

/**
 * Validator para validação de dados de compra
 * 
 * Nível 2: Valor da compra vem do produto e suas quantidades calculada via back
 * 
 * Campos validados:
 * - productId: ID do produto (deve existir no banco)
 * - quantity: Quantidade do produto (número positivo)
 * - name: Nome do comprador
 * - email: Email do comprador
 * - cardNumber: Número do cartão (16 dígitos)
 * - cvv: CVV do cartão (3-4 dígitos)
 */
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
