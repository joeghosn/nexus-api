import { Router } from 'express'

import { authMiddleware } from '@/middleware/auth.middleware'
import { changePasswordSchema } from './schema'
import validate from '@/middleware/validate.middleware'
import { changePasswordController } from './controller'

const router = Router()

// All routes in this file are for authenticated users
router.use(authMiddleware)

// @route   POST /api/user/change-password
// @desc    Authenticated user changes their own password
// @access  Authenticated
router.post(
  '/change-password',
  validate.body(changePasswordSchema),
  changePasswordController,
)

export default router
