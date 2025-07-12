import { Router } from 'express'
import * as memberController from './member.controller'

import validate from '@/middleware/validate.middleware'
import { authMiddleware } from '@/middleware/auth.middleware'
import { createInviteSchema, updateMemberRoleSchema } from './schema'

// The { mergeParams: true } option is crucial for accessing :workspaceId
const router = Router({ mergeParams: true })

router.use(authMiddleware)

// @route   POST /api/workspaces/:workspaceId/members/invite
// @desc    Admin invites a new member to the workspace
// @access  Authenticated (Admin Only - handled in controller)
router.post(
  '/invite',
  validate.body(createInviteSchema),
  memberController.inviteMember,
)

// @route   GET /api/workspaces/:workspaceId/members/invites
// @desc    Get all pending invites for a workspace
// @access  Authenticated (Admin Only)
router.get('/invites', memberController.getPendingInvites)

// @route   GET /api/workspaces/:workspaceId/members
// @desc    Get all members of the workspace
// @access  Authenticated
router.get('/', memberController.getWorkspaceMembers)

// @route   PATCH /api/workspaces/:workspaceId/members/:membershipId
// @desc    Admin updates a member's role
// @access  Authenticated (Admin Only)
router.patch(
  '/:membershipId',
  validate.body(updateMemberRoleSchema),
  memberController.updateMemberRole,
)

// @route   DELETE /api/workspaces/:workspaceId/members/:membershipId
// @desc    Admin removes a member from the workspace
// @access  Authenticated (Admin Only - handled in controller)
router.delete('/:membershipId', memberController.removeMember)

// You can also add a PATCH route here later to update a member's role

export default router
