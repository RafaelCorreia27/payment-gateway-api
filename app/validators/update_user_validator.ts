import vine from '@adonisjs/vinejs'
import { UserRole } from '#types/user_role'

/**
 * Validator para validação de dados de atualização de usuário
 * 
 * Todos os campos são opcionais (apenas os enviados serão atualizados)
 * 
 * Campos validados:
 * - email: Email único e válido (opcional)
 * - password: Senha com mínimo de 6 caracteres (opcional)
 * - role: Role válido (opcional)
 */
export const updateUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email('Invalid email format')
      .trim()
      .normalizeEmail()
      .optional(),

    password: vine
      .string()
      .minLength(6, 'Password must be at least 6 characters')
      .maxLength(255, 'Password must not exceed 255 characters')
      .optional(),

    role: vine
      .enum(Object.values(UserRole) as [string, ...string[]])
      .optional(),
  })
)
