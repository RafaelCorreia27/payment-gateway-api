import vine from '@vinejs/vine'

export const updateGatewayValidator = vine.compile(
  vine.object({
    isActive: vine.boolean().optional(),

    priority: vine
      .number()
      .min(1)
      .max(1000)
      .withoutDecimals()
      .optional(),
  })
)
