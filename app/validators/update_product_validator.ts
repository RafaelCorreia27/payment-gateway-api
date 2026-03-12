import vine from '@adonisjs/vinejs'

/**
 * Validator para validação de dados de atualização de produto
 * 
 * Todos os campos são opcionais (apenas os enviados serão atualizados)
 * 
 * Campos validados:
 * - name: Nome do produto (opcional)
 * - amount: Valor do produto em centavos (opcional)
 */
export const updateProductValidator = vine.compile(
  vine.object({
    name: vine
      .string()
      .trim()
      .minLength(2, 'Product name must be at least 2 characters')
      .maxLength(255, 'Product name must not exceed 255 characters')
      .optional(),

    amount: vine
      .number()
      .min(1, 'Amount must be greater than 0')
      .withoutDecimals()
      .optional(),
  })
)
