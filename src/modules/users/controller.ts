import { Request, Response } from 'express'

import asyncHandler from '@/utils/async-handler'

import { AccessTokenPayload } from '@/types/auth.types'
import { ChangePasswordData } from './schema'
import { changePassword } from './services'

/**
 * @desc    Authenticated user changes their own password
 * @route   POST /api/user/change-password
 * @access  Authenticated
 */
export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    // The authMiddleware has already run, so we know req.user exists.
    const user = req.user as AccessTokenPayload
    const passwordData: ChangePasswordData = req.body

    // Pass the user's ID and the password data to the service layer
    await changePassword(user.id, passwordData)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Password changed successfully.',
      data: null,
    })
  },
)
