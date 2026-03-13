import vine from '@vinejs/vine'

/**
 * Validator para validação de dados de login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)
