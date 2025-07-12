import { z } from 'zod'

export const commentSchema = z
  .object({
    content: z.string(),
  })
  .strict()

export type CommentData = z.infer<typeof commentSchema>
