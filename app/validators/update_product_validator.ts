import vine from '@vinejs/vine'

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
      .minLength(2)
      .maxLength(255)
      .optional(),

    amount: vine
      .number()
      .min(1)
      .max(999999999)
      .withoutDecimals()
      .optional(),
  })
)
