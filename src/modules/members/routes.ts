import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'
import {
  createInviteSchema,
  updateMemberRoleSchema,
  validateMemberParams,
} from './schema'
import validate from '@/middleware/validate.middleware'
import {
  getPendingInvitesController,
  getWorkspaceMembersController,
  inviteMemberController,
  removeMemberController,
  updateMemberRoleController,
} from './controllers'
import { validateWorkspaceAccess } from '@/middleware/validate-workspace-access'
import { validateWorkspaceParams } from '../workspaces/schema'

// The { mergeParams: true } option is crucial for accessing :workspaceId from the parent router
const router = Router({ mergeParams: true })

// All routes in this file are for authenticated users
router.use(authMiddleware)

// --- Member & Invite Management Routes ---

// @route   POST /api/workspaces/:workspaceId/members/invite
// @desc    Invite a new member to the workspace
// @access  Authenticated (Admin or Owner)
router.post(
  '/invite',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  validate.body(createInviteSchema),
  inviteMemberController,
)

// @route   GET /api/workspaces/:workspaceId/members/invites
// @desc    Get all pending invites for the workspace
// @access  Authenticated (Admin or Owner)
router.get(
  '/invites',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  getPendingInvitesController,
)

// @route   GET /api/workspaces/:workspaceId/members
// @desc    Get all current members of the workspace
// @access  Authenticated (Any Member)
router.get(
  '/',
  validate.params(validateWorkspaceParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN', 'MEMBER']),
  getWorkspaceMembersController,
)

// @route   PATCH /api/workspaces/:workspaceId/members/:membershipId
// @desc    Update a member's role
// @access  Authenticated (Admin or Owner)
router.patch(
  '/:membershipId',
  validate.params(validateMemberParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  validate.body(updateMemberRoleSchema),
  updateMemberRoleController,
)

// @route   DELETE /api/workspaces/:workspaceId/members/:membershipId
// @desc    Remove a member from the workspace
// @access  Authenticated (Admin or Owner)
router.delete(
  '/:membershipId',
  validate.params(validateMemberParams),
  validateWorkspaceAccess(['OWNER', 'ADMIN']),
  removeMemberController,
)

export default router
