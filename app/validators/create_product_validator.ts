import vine from '@adonisjs/vinejs'

/**
 * Validator para validação de dados de criação de produto
 * 
 * Campos validados:
 * - name: Nome do produto (2-255 caracteres)
 * - amount: Valor do produto em centavos (número positivo)
 */
export const createProductValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(2, 'Product name must be at least 2 characters')
      .maxLength(255, 'Product name must not exceed 255 characters'),

    amount: vine
      .number()
      .min(1, 'Amount must be greater than 0')
      .withoutDecimals(),
  })
)
