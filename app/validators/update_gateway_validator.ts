import vine from '@adonisjs/vinejs'

/**
 * Validator para validação de dados de atualização de gateway
 * 
 * Todos os campos são opcionais (apenas os enviados serão atualizados)
 * 
 * Campos validados:
 * - isActive: Status ativo/inativo do gateway (opcional)
 * - priority: Prioridade do gateway (número positivo, opcional)
 */
export const updateGatewayValidator = vine.compile(
  vine.object({
    isActive: vine.boolean().optional(),

    priority: vine
      .number()
      .min(1, 'Priority must be at least 1')
      .withoutDecimals()
      .optional(),
  })
)
