import { Router } from 'express'
import * as inviteController from './invite.controller'

import { authMiddleware } from '@/middleware/auth.middleware'
import validate from '@/middleware/validate.middleware'
import { acceptInviteSchema } from './schema'

const router = Router()

// @route   GET /api/invites/verify/:token
// @desc    Check if an invite token is valid before user logs in/registers
// @access  Public
router.get('/verify/:token', inviteController.verifyInviteToken)

// @route   POST /api/invites/accept
// @desc    Accept an invitation and join a workspace. User must be logged in.
// @access  Authenticated
router.post(
  '/accept',
  authMiddleware,
  validate.body(acceptInviteSchema),
  inviteController.acceptInvite,
)

export default router
