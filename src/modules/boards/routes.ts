import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'

import validate from '@/middleware/validate.middleware'
import {
  addBoardMemberSchema,
  boardSchema,
  validateBoardMemberParams,
  validateBoardParams,
  validateWorkspaceParams,
} from './schema'
import {
  addMemberToBoardController,
  createBoardController,
  deleteBoardController,
  getBoardByIdController,
  getBoardsInWorkspaceController,
  removeMemberFromBoardController,
  updateBoardController,
} from './controllers'
import { validateWorkspaceAccess } from '@/middleware/validate-workspace-access'
import listRoutes from '../lists/routes'

const router = Router({ mergeParams: true })

// All routes in this file require the user to be authenticated
router.use(authMiddleware)

// --- Core Board Routes ---

// @route   POST /api/workspaces/:workspaceId/boards
// @desc    Create a new board
// @access  Authenticated (Admin or Owner)
router.post(
  '/',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  validate.body(boardSchema),
  createBoardController,
)

// @route   GET /api/workspaces/:workspaceId/boards
// @desc    Get all boards in a workspace
// @access  Authenticated (Any Member)
router.get(
  '/',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN', 'MEMBER']),
  getBoardsInWorkspaceController,
)

// @route   GET /api/workspaces/:workspaceId/boards/:boardId
// @desc    Get a single board by ID
// @access  Authenticated (Any Member with access)
router.get(
  '/:boardId',
  validate.params(validateBoardParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN', 'MEMBER']),
  getBoardByIdController,
)

// @route   PATCH /api/workspaces/:workspaceId/boards/:boardId
// @desc    Update a board's details
// @access  Authenticated (Admin or Owner)
router.patch(
  '/:boardId',
  validate.params(validateBoardParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  validate.body(boardSchema),
  updateBoardController,
)

// @route   DELETE /api/workspaces/:workspaceId/boards/:boardId
// @desc    Delete a board
// @access  Authenticated (Admin or Owner)
router.delete(
  '/:boardId',
  validate.params(validateBoardParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  deleteBoardController,
)

// --- Private Board Member Management Routes ---

router.post(
  '/:boardId/members',
  validate.params(validateBoardParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  validate.body(addBoardMemberSchema),
  addMemberToBoardController,
)

router.delete(
  '/:boardId/members/:userId',
  validate.params(validateBoardMemberParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  removeMemberFromBoardController,
)

router.use('/:boardId/lists', listRoutes)

export default router
