import { prisma } from '@/lib/prisma/client'

import { NotFoundException } from '@/exceptions/not-found.exception'
import { User } from '@prisma/client'
import { WorkspaceData } from './schema'

/**
 * Creates a new workspace and makes the creator the OWNER.
 * This function uses a transaction to ensure both the workspace
 * and the membership record are created successfully.
 *
 * @param workspaceData The name of the new workspace.
 * @param userId The ID of the user creating the workspace.
 * @returns The newly created workspace.
 */
export const createWorkspace = async (
  workspaceData: WorkspaceData,
  userId: string,
) => {
  const workspace = await prisma.$transaction(async (tx) => {
    // Step 1: Create the new workspace
    const newWorkspace = await tx.workspace.create({
      data: {
        name: workspaceData.name,
      },
    })

    // Step 2: Automatically create a membership record, making the creator the OWNER
    await tx.membership.create({
      data: {
        userId: userId,
        workspaceId: newWorkspace.id,
        role: 'OWNER',
      },
    })

    return newWorkspace
  })

  return workspace
}

/**
 * Fetches all workspaces a specific user is a member of.
 * @param userId The ID of the user.
 * @returns A list of workspaces.
 */
export const getUserWorkspaces = async (userId: string) => {
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },

    include: {
      members: {
        where: {
          userId: userId,
        },
        select: {
          role: true,
        },
      },
    },
  })

  return workspaces
}

/**
 * Fetches the details of a single workspace by its ID.
 * Throws an error if the workspace is not found.
 * @param workspaceId The ID of the workspace.
 * @returns The workspace object.
 */
export const getWorkspaceById = async (workspaceId: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  })

  if (!workspace) {
    throw new NotFoundException('Workspace not found.')
  }

  return workspace
}

/**
 * Updates the name of a workspace.
 * @param workspaceId The ID of the workspace to update.
 * @param workspaceData The new data for the workspace.
 * @returns The updated workspace object.
 */
export const updateWorkspace = async (
  workspaceId: string,
  workspaceData: WorkspaceData,
) => {
  // Step 1: Ensure the workspace exists before attempting to update.
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  })

  if (!existingWorkspace) {
    throw new NotFoundException('Workspace not found.')
  }

  // Step 2: Proceed with the update.
  const updatedWorkspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: workspaceData.name,
    },
  })

  return updatedWorkspace
}

/**
 * Deletes a workspace.
 * @param workspaceId The ID of the workspace to delete.
 */
export const deleteWorkspace = async (workspaceId: string) => {
  // Step 1: Ensure the workspace exists before attempting to delete.
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  })

  if (!existingWorkspace) {
    throw new NotFoundException('Workspace not found.')
  }

  await prisma.workspace.delete({
    where: { id: workspaceId },
  })
}
