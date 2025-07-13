import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'
import { acceptInviteSchema } from './schema'
import validate from '@/middleware/validate.middleware'
import {
  acceptInviteController,
  verifyInviteTokenController,
} from './controllers'

const router = Router()

// --- Public Invitation Routes ---

// @route   GET /api/invites/verify/:token
// @desc    Check if an invite token is valid before user logs in/registers
// @access  Public
router.get('/verify/:token', verifyInviteTokenController)

// @route   POST /api/invites/accept
// @desc    Accept an invitation and join a workspace. User must be logged in.
// @access  Authenticated
router.post(
  '/accept',
  authMiddleware,
  validate.body(acceptInviteSchema),
  acceptInviteController,
)

export default router
