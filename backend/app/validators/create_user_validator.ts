import vine from '@vinejs/vine'
import { UserRole } from '#types/user_role'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .trim()
      .normalizeEmail(),

    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),

    role: vine
      .enum(Object.values(UserRole) as [string, ...string[]])
      .optional(),
  })
)
