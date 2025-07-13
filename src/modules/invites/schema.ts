import z from 'zod'

export const acceptInviteSchema = z
  .object({
    token: z.string(),
  })
  .strict()

export type AcceptInviteData = z.infer<typeof acceptInviteSchema>
