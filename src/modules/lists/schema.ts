import { z } from 'zod'

export const reorderListSchema = z
  .object({
    lists: z.array(
      z.object({
        id: z.uuid(),
        position: z.number().int().min(0),
      }),
    ),
  })
  .strict()

export type ReorderListData = z.infer<typeof reorderListSchema>
