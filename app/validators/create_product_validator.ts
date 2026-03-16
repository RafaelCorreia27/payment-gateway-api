import vine from '@vinejs/vine'

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
      .max(999999999)
      .withoutDecimals(),
  })
)
