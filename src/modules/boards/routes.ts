import { Router } from 'express'
import * as boardController from './board.controller'

import { boardSchema } from './schema'
import { authMiddleware } from '@/middleware/auth.middleware'
import validate from '@/middleware/validate.middleware'

const router = Router({ mergeParams: true })

// All routes in this file will be protected by the authMiddleware
router.use(authMiddleware)

// @route   POST /api/workspaces/:workspaceId/boards
// @desc    Create a new board within a workspace
// @access  Authenticated
router.post('/', validate.body(boardSchema), boardController.createBoard)

// @route   GET /api/workspaces/:workspaceId/boards
// @desc    Get all boards for a specific workspace
// @access  Authenticated
router.get('/', boardController.getBoardsInWorkspace)

// @route   GET /api/workspaces/:workspaceId/boards/:boardId
// @desc    Get a single board by its ID
// @access  Authenticated
router.get('/:boardId', boardController.getBoardById)

// @route   PATCH /api/workspaces/:workspaceId/boards/:boardId
// @desc    Update a board's name
// @access  Authenticated
router.patch(
  '/:boardId',
  validate.body(boardSchema),
  boardController.updateBoard,
)

// @route   DELETE /api/workspaces/:workspaceId/boards/:boardId
// @desc    Delete a board
// @access  Authenticated
router.delete('/:boardId', boardController.deleteBoard)

// @route   POST /api/workspaces/:workspaceId/boards/:boardId/members
// @desc    Add a workspace member to a private board
// @access  Authenticated (Admin/Owner)
router.post(
  '/:boardId/members',
  validate.body(addBoardMemberSchema),
  boardMemberController.addMemberToBoard,
)

// @route   DELETE /api/workspaces/:workspaceId/boards/:boardId/members/:userId
// @desc    Remove a member's access from a private board
// @access  Authenticated (Admin/Owner)
router.delete(
  '/:boardId/members/:userId',
  boardMemberController.removeMemberFromBoard,
)

export default router
