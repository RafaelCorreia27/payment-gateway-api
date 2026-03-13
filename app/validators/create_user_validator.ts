import vine from '@vinejs/vine'
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
      .email()
      .trim()
      .normalizeEmail(),

    password: vine
      .string()
      .minLength(6)
      .maxLength(255),

    role: vine
      .enum(Object.values(UserRole) as [string, ...string[]])
      .optional(),
  })
)
