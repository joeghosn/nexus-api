import { Request, Response } from 'express'
import asyncHandler from '@/utils/async-handler'

import { AccessTokenPayload } from '@/types/auth.types'
import { AddBoardMemberData, BoardData } from './schema'
import {
  addMemberToBoard,
  createBoard,
  deleteBoard,
  getBoardForUser,
  getBoardsInWorkspace,
  removeMemberFromBoard,
  updateBoard,
} from './services'

/**
 * @desc    Create a new board within a workspace
 * @route   POST /api/workspaces/:workspaceId/boards
 * @access  Authenticated (Admin or Owner)
 */
export const createBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const boardData: BoardData = req.body

    const newBoard = await createBoard(workspaceId, boardData)

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Board created successfully',
      data: newBoard,
    })
  },
)

/**
 * @desc    Get all boards for a specific workspace
 * @route   GET /api/workspaces/:workspaceId/boards
 * @access  Authenticated (Any Member)
 */
export const getBoardsInWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const user = req.user as AccessTokenPayload

    const boards = await getBoardsInWorkspace(workspaceId, user.id)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Boards fetched successfully',
      data: boards,
    })
  },
)

/**
 * @desc    Get a single board by its ID
 * @route   GET /api/workspaces/:workspaceId/boards/:boardId
 * @access  Authenticated (Member with access)
 */
export const getBoardByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId } = req.params
    const user = req.user as AccessTokenPayload

    // The service layer will handle the complex authorization for private boards
    const board = await getBoardForUser(boardId, user)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Board details fetched successfully',
      data: board,
    })
  },
)

/**
 * @desc    Update a board's name or visibility
 * @route   PATCH /api/workspaces/:workspaceId/boards/:boardId
 * @access  Authenticated (Admin or Owner)
 */
export const updateBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId } = req.params
    const boardData: BoardData = req.body

    const updatedBoard = await updateBoard(boardId, boardData)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Board updated successfully',
      data: updatedBoard,
    })
  },
)

/**
 * @desc    Delete a board
 * @route   DELETE /api/workspaces/:workspaceId/boards/:boardId
 * @access  Authenticated (Admin or Owner)
 */
export const deleteBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId } = req.params

    await deleteBoard(boardId)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Board deleted successfully',
      data: null,
    })
  },
)

/**
 * @desc    Add a workspace member to a private board
 * @route   POST /api/workspaces/:workspaceId/boards/:boardId/members
 * @access  Authenticated (Admin or Owner)
 */
export const addMemberToBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId } = req.params
    const { userId }: AddBoardMemberData = req.body

    const newMember = await addMemberToBoard(boardId, userId)

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Member added to board successfully',
      data: newMember,
    })
  },
)

/**
 * @desc    Remove a member's access from a private board
 * @route   DELETE /api/workspaces/:workspaceId/boards/:boardId/members/:userId
 * @access  Authenticated (Admin or Owner)
 */
export const removeMemberFromBoardController = asyncHandler(
  async (req: Request, res: Response) => {
    const { boardId, userId } = req.params

    await removeMemberFromBoard(boardId, userId)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Member removed from board successfully',
      data: null,
    })
  },
)
