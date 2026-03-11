import vine from '@adonisjs/vinejs'

/**
 * Validator para validação de dados de login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(6),
  })
)
