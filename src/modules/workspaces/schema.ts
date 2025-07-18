import { z } from 'zod'

export const workspaceSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Workspace name must be at least 3 characters' }),
  })
  .strict()

export const validateWorkspaceParams = z
  .object({
    workspaceId: z.uuid(),
  })
  .strict()

export type WorkspaceData = z.infer<typeof workspaceSchema>
export type WorkspaceParams = z.infer<typeof validateWorkspaceParams>
