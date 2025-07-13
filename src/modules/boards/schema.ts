import { z } from 'zod'

export const boardSchema = z
  .object({
    name: z.string(),
  })
  .strict()

// For adding a member to a private board
export const addBoardMemberSchema = z
  .object({
    userId: z.uuid({ message: 'A valid user ID is required' }),
  })
  .strict()

export type BoardData = z.infer<typeof boardSchema>
export type AddBoardMemberData = z.infer<typeof addBoardMemberSchema>
