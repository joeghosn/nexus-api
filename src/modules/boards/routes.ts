import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'
import { hasWorkspaceRole } from '@/middleware/authorization.middleware'

import validate from '@/middleware/validate.middleware'
import { addBoardMemberSchema, boardSchema } from './schema'
import {
  addMemberToBoardController,
  createBoardController,
  deleteBoardController,
  getBoardByIdController,
  getBoardsInWorkspaceController,
  removeMemberFromBoardController,
  updateBoardController,
} from './controllers'

const router = Router({ mergeParams: true })

// All routes in this file require the user to be authenticated
router.use(authMiddleware)

// --- Core Board Routes ---

// @route   POST /api/workspaces/:workspaceId/boards
// @desc    Create a new board
// @access  Authenticated (Admin or Owner)
router.post(
  '/',
  hasWorkspaceRole(['OWNER', 'ADMIN']),
  validate.body(boardSchema),
  createBoardController,
)

// @route   GET /api/workspaces/:workspaceId/boards
// @desc    Get all boards in a workspace
// @access  Authenticated (Any Member)
router.get(
  '/',
  hasWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER']),
  getBoardsInWorkspaceController,
)

// @route   GET /api/workspaces/:workspaceId/boards/:boardId
// @desc    Get a single board by ID
// @access  Authenticated (Any Member with access)
router.get(
  '/:boardId',
  hasWorkspaceRole(['OWNER', 'ADMIN', 'MEMBER']),
  getBoardByIdController,
)

// @route   PATCH /api/workspaces/:workspaceId/boards/:boardId
// @desc    Update a board's details
// @access  Authenticated (Admin or Owner)
router.patch(
  '/:boardId',
  hasWorkspaceRole(['OWNER', 'ADMIN']),
  validate.body(boardSchema),
  updateBoardController,
)

// @route   DELETE /api/workspaces/:workspaceId/boards/:boardId
// @desc    Delete a board
// @access  Authenticated (Admin or Owner)
router.delete(
  '/:boardId',
  hasWorkspaceRole(['OWNER', 'ADMIN']),
  deleteBoardController,
)

// --- Private Board Member Management Routes ---

// @route   POST /api/workspaces/:workspaceId/boards/:boardId/members
// @desc    Add a workspace member to a private board
// @access  Authenticated (Admin or Owner)
router.post(
  '/:boardId/members',
  hasWorkspaceRole(['OWNER', 'ADMIN']),
  validate.body(addBoardMemberSchema),
  addMemberToBoardController,
)

// @route   DELETE /api/workspaces/:workspaceId/boards/:boardId/members/:userId
// @desc    Remove a member's access from a private board
// @access  Authenticated (Admin or Owner)
router.delete(
  '/:boardId/members/:userId',
  hasWorkspaceRole(['OWNER', 'ADMIN']),
  removeMemberFromBoardController,
)

export default router
