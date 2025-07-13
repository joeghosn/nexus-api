import { Request, Response } from 'express'

import asyncHandler from '@/utils/async-handler'

import { AccessTokenPayload } from '@/types/auth.types'
import { CreateInviteData, UpdateMemberRoleData } from './schema'
import {
  getPendingInvites,
  getWorkspaceMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
} from './services'

/**
 * @desc    Invite a new member to the workspace
 * @route   POST /api/workspaces/:workspaceId/members/invite
 * @access  Authenticated (Admin or Owner)
 */
export const inviteMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const inviteData: CreateInviteData = req.body

    await inviteMember(workspaceId, inviteData)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Invitation sent successfully.',
      data: inviteData,
    })
  },
)

/**
 * @desc    Get all pending invites for the workspace
 * @route   GET /api/workspaces/:workspaceId/members/invites
 * @access  Authenticated (Admin or Owner)
 */
export const getPendingInvitesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const invites = await getPendingInvites(workspaceId)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Pending invites fetched successfully.',
      data: invites,
    })
  },
)

/**
 * @desc    Get all current members of the workspace
 * @route   GET /api/workspaces/:workspaceId/members
 * @access  Authenticated (Any Member)
 */
export const getWorkspaceMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params
    const members = await getWorkspaceMembers(workspaceId)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Workspace members fetched successfully.',
      data: members,
    })
  },
)

/**
 * @desc    Update a member's role
 * @route   PATCH /api/workspaces/:workspaceId/members/:membershipId
 * @access  Authenticated (Admin or Owner)
 */
export const updateMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const { membershipId } = req.params
    const roleData: UpdateMemberRoleData = req.body

    const updatedMembership = await updateMemberRole(membershipId, roleData)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: "Member's role updated successfully.",
      data: updatedMembership,
    })
  },
)

/**
 * @desc    Remove a member from the workspace
 * @route   DELETE /api/workspaces/:workspaceId/members/:membershipId
 * @access  Authenticated (Admin or Owner)
 */
export const removeMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const { membershipId } = req.params
    await removeMember(membershipId)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Member removed successfully.',
      data: null,
    })
  },
)
