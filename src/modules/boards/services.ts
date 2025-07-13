import { prisma } from '@/lib/prisma/client'

import { NotFoundException } from '@/exceptions/not-found.exception'
import { ForbiddenException } from '@/exceptions/forbidden.exception'
import { AccessTokenPayload } from '@/types/auth.types'
import { BoardData } from './schema'
import { ConflictException } from '@/exceptions'

/**
 * Creates a new board and its default lists.
 * @param workspaceId The ID of the parent workspace.
 * @param boardData The name for the new board.
 * @returns The newly created board.
 */
export const createBoard = async (
  workspaceId: string,
  boardData: BoardData,
) => {
  // Use a transaction to ensure the board and its lists are created together
  const newBoard = await prisma.$transaction(async (tx) => {
    const board = await tx.board.create({
      data: {
        name: boardData.name,
        workspaceId,
      },
    })

    // Create default lists for the new board
    await tx.list.createMany({
      data: [
        { name: 'To Do', boardId: board.id, position: 1 },
        { name: 'In Progress', boardId: board.id, position: 2 },
        { name: 'In Review', boardId: board.id, position: 3 },
        { name: 'Done', boardId: board.id, position: 4 },
      ],
    })

    return board
  })

  return newBoard
}

/**
 * Fetches all boards in a workspace that a specific user has access to.
 * This includes all public boards and any private boards they are a member of.
 * @param workspaceId The ID of the workspace.
 * @param userId The ID of the user making the request.
 * @returns A list of accessible boards.
 */
export const getBoardsInWorkspace = async (
  workspaceId: string,
  userId: string,
) => {
  const boards = await prisma.board.findMany({
    where: {
      workspaceId,
      OR: [
        // Condition 1: The board is public
        { visibility: 'PUBLIC' },
        // Condition 2: The board is private AND the user is a member of it
        {
          visibility: 'PRIVATE',
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  })
  return boards
}

/**
 * Fetches a single board and verifies the user's access.
 * @param boardId The ID of the board to fetch.
 * @param user The authenticated user payload from the JWT.
 * @returns The full board details including lists and cards.
 */
export const getBoardForUser = async (
  boardId: string,
  user: AccessTokenPayload,
) => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      lists: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
          },
        },
      },
    },
  })

  if (!board) {
    throw new NotFoundException('Board not found.')
  }

  // The `hasWorkspaceRole` middleware already confirmed the user is in the workspace.
  // Now, we just need to do the final check for private boards.
  if (board.visibility === 'PRIVATE') {
    const boardMembership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: boardId,
          userId: user.id,
        },
      },
    })
    if (!boardMembership) {
      throw new ForbiddenException(
        "You don't have access to this private board.",
      )
    }
  }

  return board
}

/**
 * Updates a board's name and/or visibility.
 * @param boardId The ID of the board to update.
 * @param boardData The new data for the board.
 * @returns The updated board.
 */
export const updateBoard = async (boardId: string, boardData: BoardData) => {
  const existingBoard = await prisma.board.findUnique({
    where: { id: boardId },
  })
  if (!existingBoard) {
    throw new NotFoundException('Board not found.')
  }

  const updatedBoard = await prisma.board.update({
    where: { id: boardId },
    data: boardData,
  })

  return updatedBoard
}

/**
 * Deletes a board.
 * @param boardId The ID of the board to delete.
 */
export const deleteBoard = async (boardId: string) => {
  const existingBoard = await prisma.board.findUnique({
    where: { id: boardId },
  })
  if (!existingBoard) {
    throw new NotFoundException('Board not found.')
  }

  // The `onDelete: Cascade` in the schema will handle deleting related data
  await prisma.board.delete({
    where: { id: boardId },
  })
}

export const addMemberToBoard = async (boardId: string, userId: string) => {
  // Use a transaction to perform multiple checks and the final creation
  return await prisma.$transaction(async (tx) => {
    // 1. Find the board and include its parent workspace ID
    const board = await tx.board.findUnique({
      where: { id: boardId },
      select: { workspaceId: true, visibility: true },
    })

    if (!board) {
      throw new NotFoundException('Board not found.')
    }

    // 2. Ensure the board is actually private
    if (board.visibility !== 'PRIVATE') {
      throw new ForbiddenException(
        'This board is public; all workspace members have access.',
      )
    }

    // 3. Verify that the user being added is a member of the parent workspace
    const workspaceMembership = await tx.membership.findFirst({
      where: {
        userId: userId,
        workspaceId: board.workspaceId,
      },
    })

    if (!workspaceMembership) {
      throw new ForbiddenException(
        'Cannot add a user who is not a member of the workspace.',
      )
    }

    // 4. Check if the user is already a member of the board
    const existingBoardMember = await tx.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    })

    if (existingBoardMember) {
      throw new ConflictException('This user is already a member of the board.')
    }

    // 5. Create the board membership
    const newMember = await tx.boardMember.create({
      data: {
        boardId,
        userId,
      },
    })

    return newMember
  })
}

/**
 * Removes a member's access from a private board.
 * @param boardId The ID of the private board.
 * @param userId The ID of the user to remove.
 */
export const removeMemberFromBoard = async (
  boardId: string,
  userId: string,
) => {
  // Check if the membership exists before trying to delete
  const existingBoardMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  })

  if (!existingBoardMember) {
    throw new NotFoundException('This user is not a member of the board.')
  }

  await prisma.boardMember.delete({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  })
}
