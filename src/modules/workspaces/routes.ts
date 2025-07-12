import { Router } from 'express'
import * as workspaceController from './workspace.controller'

import { authMiddleware } from '@/middleware/auth.middleware'

import validate from '@/middleware/validate.middleware'
import { workspaceSchema } from './schema'

const router = Router()

router.use(authMiddleware)

// @route   POST /api/workspaces
// @desc    Create a new workspace
router.post(
  '/',
  validate.body(workspaceSchema),
  workspaceController.createWorkspace,
)

// @route   GET /api/workspaces
// @desc    Get all workspaces the current user is a member of
router.get('/', workspaceController.getUserWorkspaces)

// @route   GET /api/workspaces/:workspaceId
// @desc    Get a single workspace by its ID
router.get('/:workspaceId', workspaceController.getWorkspaceById)

// @route   PATCH /api/workspaces/:workspaceId
// @desc    Update a workspace's name
router.patch(
  '/:workspaceId',
  validate.body(workspaceSchema),
  workspaceController.updateWorkspace,
)

// @route   DELETE /api/workspaces/:workspaceId
// @desc    Delete a workspace
router.delete('/:workspaceId', workspaceController.deleteWorkspace)

export default router
