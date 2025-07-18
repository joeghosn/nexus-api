import { Router } from 'express'

import validate from '@/middleware/validate.middleware'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from './schema'
import { authMiddleware } from '@/middleware/auth.middleware'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
  sendVerificationController,
  meController,
  verifyEmailController,
  refreshController,
} from './controllers'

const router = Router()

router.post('/register', validate.body(registerSchema), registerController)
router.post('/login', validate.body(loginSchema), loginController)

// @route   POST /api/auth/refresh
// @desc    Get a new access token using a refresh token
// @access  Public (uses refresh token cookie)
router.post('/refresh', refreshController)

// @route   POST /api/auth/forgot-password
// @desc    User requests a password reset link
// @access  Public
router.post(
  '/forgot-password',
  validate.body(forgotPasswordSchema),
  forgotPasswordController,
)

// @route   POST /api/auth/reset-password
// @desc    User submits a new password with a valid token
// @access  Public
router.post(
  '/reset-password',
  validate.body(resetPasswordSchema),
  resetPasswordController,
)

// @route   POST /api/auth/verify-email
// @desc    Verify a user's email with a token from a link
// @access  Public
router.post(
  '/verify-email',
  validate.body(verifyEmailSchema),
  verifyEmailController,
)

// @route   POST /api/user/resend-verification
// @desc    Resend the email verification link to the logged-in user
// @access  Authenticated
router.post(
  '/send-verification',
  validate.body(resendVerificationSchema),
  sendVerificationController,
)

router.post('/logout', authMiddleware, logoutController)
router.get('/me', authMiddleware, meController)

export default router
