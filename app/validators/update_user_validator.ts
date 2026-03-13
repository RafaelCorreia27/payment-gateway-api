import vine from '@vinejs/vine'
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
      .email()
      .trim()
      .normalizeEmail()
      .optional(),

    password: vine
      .string()
      .minLength(6)
      .maxLength(255)
      .optional(),

    role: vine
      .enum(Object.values(UserRole) as [string, ...string[]])
      .optional(),
  })
)
