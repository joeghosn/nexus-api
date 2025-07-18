import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'
import validate from '@/middleware/validate.middleware'
import { validateWorkspaceParams, workspaceSchema } from './schema'
import {
  createWorkspaceController,
  deleteWorkspaceController,
  getUserWorkspacesController,
  getWorkspaceByIdController,
  updateWorkspaceController,
} from './controllers'
import { validateWorkspaceAccess } from '@/middleware/validate-workspace-access'

const router = Router()

// All routes in this file require the user to be authenticated first.
router.use(authMiddleware)

// --- Workspace Routes ---

// @route   POST /api/workspaces
// @desc    Create a new workspace
// @access  Authenticated
router.post('/', validate.body(workspaceSchema), createWorkspaceController)

// @route   GET /api/workspaces
// @desc    Get all workspaces the current user is a member of
// @access  Authenticated
router.get('/', getUserWorkspacesController)

// @route   GET /api/workspaces/:workspaceId
// @desc    Get a single workspace by its ID
// @access  Authenticated (Any member of the workspace)
router.get(
  '/:workspaceId',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN', 'MEMBER']),
  getWorkspaceByIdController,
)

// @route   PATCH /api/workspaces/:workspaceId
// @desc    Update a workspace's name
// @access  Authenticated (Admin or Owner of the workspace)
router.patch(
  '/:workspaceId',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  validate.body(workspaceSchema),
  updateWorkspaceController,
)

// @route   DELETE /api/workspaces/:workspaceId
// @desc    Delete a workspace
// @access  Authenticated (Owner of the workspace only)
router.delete(
  '/:workspaceId',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER']),
  deleteWorkspaceController,
)

export default router
