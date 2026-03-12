import vine from '@adonisjs/vinejs'

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
      .min(1, 'Product ID must be greater than 0')
      .withoutDecimals(),

    quantity: vine
      .number()
      .min(1, 'Quantity must be at least 1')
      .withoutDecimals(),

    name: vine
      .string()
      .trim()
      .minLength(2, 'Name must be at least 2 characters')
      .maxLength(255, 'Name must not exceed 255 characters'),

    email: vine
      .string()
      .email('Invalid email format')
      .trim()
      .normalizeEmail(),

    cardNumber: vine
      .string()
      .trim()
      .regex(/^\d{16}$/, 'Card number must be exactly 16 digits'),

    cvv: vine
      .string()
      .trim()
      .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  })
)
