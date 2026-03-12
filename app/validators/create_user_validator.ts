import vine from '@adonisjs/vinejs'
import { UserRole } from '#types/user_role'

/**
 * Validator para validação de dados de criação de usuário
 * 
 * Campos validados:
 * - email: Email único e válido
 * - password: Senha com mínimo de 6 caracteres
 * - role: Role válido (ADMIN, MANAGER, FINANCE, USER)
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email('Invalid email format')
      .trim()
      .normalizeEmail()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),

    password: vine
      .string()
      .minLength(6, 'Password must be at least 6 characters')
      .maxLength(255, 'Password must not exceed 255 characters'),

    role: vine
      .enum(Object.values(UserRole) as [string, ...string[]])
      .optional(),
  })
)
