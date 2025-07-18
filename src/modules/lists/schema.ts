import { z } from 'zod'

export const reorderListSchema = z
  .object({
    lists: z.array(
      z.object({
        id: z.uuid('A valid list ID is required'),
        position: z.number().int().min(0),
      }),
    ),
  })
  .strict()

export const validateListParams = z.object({
  workspaceId: z.uuid('A valid workspace ID is required'),
  boardId: z.uuid('A valid board ID is required'),
})

export type ReorderListData = z.infer<typeof reorderListSchema>
