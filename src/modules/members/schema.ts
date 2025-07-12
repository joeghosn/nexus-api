import { z } from 'zod'

export const createInviteSchema = z
  .object({
    email: z.email({ message: 'A valid email is required' }),
    role: z.enum(['ADMIN', 'MEMBER']),
  })
  .strict()

export const updateMemberRoleSchema = z
  .object({
    role: z.enum(['ADMIN', 'MEMBER']),
  })
  .strict()

export type CreateInviteData = z.infer<typeof createInviteSchema>
export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>
