import vine from '@vinejs/vine'

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
      .minLength(2)
      .maxLength(255),

    amount: vine
      .number()
      .min(1)
      .withoutDecimals(),
  })
)
