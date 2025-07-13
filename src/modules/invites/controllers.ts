import { Request, Response } from 'express'
import asyncHandler from '@/utils/async-handler'

import { AccessTokenPayload } from '@/types/auth.types'
import { AcceptInviteData } from './schema'
import { acceptInvite, verifyInviteToken } from './services'

/**
 * @desc    Check if an invite token is valid
 * @route   GET /api/invites/verify/:token
 * @access  Public
 */
export const verifyInviteTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params
    const inviteDetails = await verifyInviteToken(token)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Invite token is valid.',
      data: inviteDetails,
    })
  },
)

/**
 * @desc    Accept an invitation and join a workspace
 * @route   POST /api/invites/accept
 * @access  Authenticated
 */
export const acceptInviteController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AccessTokenPayload
    const { token }: AcceptInviteData = req.body

    await acceptInvite(token, user)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message:
        'Invitation accepted successfully. You have joined the workspace.',
      data: null,
    })
  },
)
