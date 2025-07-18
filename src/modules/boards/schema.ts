import { z } from 'zod'

// For creating a new board
export const boardSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Board name must be at least 3 characters' }),
    visibility: z.enum(['PUBLIC', 'PRIVATE']),
  })
  .strict()

// For adding a member to a private board
export const addBoardMemberSchema = z
  .object({
    userId: z.uuid({ message: 'A valid user ID is required' }),
  })
  .strict()

export const validateWorkspaceParams = z.object({
  workspaceId: z.uuid({ message: 'A valid workspace ID is required' }),
})

export const validateBoardParams = z.object({
  workspaceId: z.uuid({ message: 'A valid workspace ID is required' }),
  boardId: z.uuid({ message: 'A valid board ID is required' }),
})

export const validateBoardMemberParams = z.object({
  workspaceId: z.uuid({ message: 'A valid workspace ID is required' }),
  boardId: z.uuid({ message: 'A valid board ID is required' }),
  userId: z.uuid({ message: 'A valid user ID is required' }),
})

export type BoardData = z.infer<typeof boardSchema>
export type AddBoardMemberData = z.infer<typeof addBoardMemberSchema>

export type ValidateWorkspaceParams = z.infer<typeof validateWorkspaceParams>
export type ValidateBoardParams = z.infer<typeof validateBoardParams>
export type ValidateBoardMemberParams = z.infer<
  typeof validateBoardMemberParams
>
