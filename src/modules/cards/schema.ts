import { z } from 'zod'

// For creating a new card (listId comes from URL)
export const createCardSchema = z
  .object({
    title: z.string(),
  })
  .strict()

// For updating a card's core details
export const updateCardSchema = z
  .object({
    title: z.string(),
    description: z.string().nullable().optional(),
    status: z.enum(['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  })
  .strict()

// For reordering cards between/within lists
export const reorderCardSchema = z
  .object({
    cards: z.array(
      z.object({
        id: z.uuid(),
        position: z.number().int().min(0),
        listId: z.uuid(),
      }),
    ),
  })
  .strict()

// For assigning a user to a card
export const assignCardSchema = z
  .object({
    assigneeId: z.uuid().nullable(),
  })
  .strict()
