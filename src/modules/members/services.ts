import { prisma } from '@/lib/prisma/client'

import { NotFoundException } from '@/exceptions/not-found.exception'
import { ConflictException } from '@/exceptions/conflict.exception'
import { ForbiddenException } from '@/exceptions/forbidden.exception'
import crypto from 'crypto'
import { CreateInviteData, UpdateMemberRoleData } from './schema'

/**
 * Creates an invitation for a new user to join a workspace.
 * @param workspaceId The ID of the workspace.
 * @param inviteData The email and role for the new member.
 */
export const inviteMember = async (
  workspaceId: string,
  inviteData: CreateInviteData,
) => {
  const { email, role } = inviteData

  // Check if the user is already a member of the workspace
  const existingMembership = await prisma.membership.findFirst({
    where: {
      workspaceId,
      user: { email },
    },
  })
  if (existingMembership) {
    throw new ConflictException(
      'This user is already a member of the workspace.',
    )
  }

  // Check if there's already a pending invite for this email
  const existingInvite = await prisma.invite.findFirst({
    where: {
      workspaceId,
      email,
      expiresAt: { gte: new Date() },
    },
  })
  if (existingInvite) {
    throw new ConflictException(
      'An active invitation for this email already exists.',
    )
  }

  // Create the invitation
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.invite.create({
    data: {
      workspaceId,
      email,
      role,
      token,
      expiresAt,
    },
  })

  // Here you would call a real email service to send the invite link
  // e.g., await emailService.sendWorkspaceInvite(email, token, workspaceName);
}

/**
 * Gets a list of all pending invites for a workspace.
 * @param workspaceId The ID of the workspace.
 * @returns A list of pending invites.
 */
export const getPendingInvites = async (workspaceId: string) => {
  return await prisma.invite.findMany({
    where: {
      workspaceId,
      expiresAt: { gte: new Date() },
    },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
    },
  })
}

/**
 * Gets a list of all current members in a workspace.
 * @param workspaceId The ID of the workspace.
 * @returns A list of members with their user details.
 */
export const getWorkspaceMembers = async (workspaceId: string) => {
  return await prisma.membership.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

/**
 * Updates the role of a member in a workspace.
 * @param membershipId The ID of the membership record.
 * @param roleData The new role.
 * @returns The updated membership record.
 */
export const updateMemberRole = async (
  membershipId: string,
  roleData: UpdateMemberRoleData,
) => {
  // Ensure the membership exists
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })
  if (!membership) {
    throw new NotFoundException('Membership not found.')
  }

  // Prevent changing the role of the OWNER
  if (membership.role === 'OWNER') {
    throw new ForbiddenException('The workspace owner role cannot be changed.')
  }

  return await prisma.membership.update({
    where: { id: membershipId },
    data: { role: roleData.role },
  })
}

/**
 * Removes a member from a workspace.
 * @param membershipId The ID of the membership record to delete.
 */
export const removeMember = async (membershipId: string) => {
  // Ensure the membership exists
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
  })
  if (!membership) {
    throw new NotFoundException('Membership not found.')
  }

  // Prevent the OWNER from being removed
  if (membership.role === 'OWNER') {
    throw new ForbiddenException('The workspace owner cannot be removed.')
  }

  await prisma.membership.delete({
    where: { id: membershipId },
  })
}
