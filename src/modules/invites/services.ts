import { prisma } from '@/lib/prisma/client'
import { NotFoundException } from '@/exceptions/not-found.exception'
import { ForbiddenException } from '@/exceptions/forbidden.exception'
import { AccessTokenPayload } from '@/types/auth.types'

/**
 * Verifies an invite token and returns its details.
 * @param token The invitation token from the URL.
 * @returns The email and workspace name associated with the invite.
 */
export const verifyInviteToken = async (token: string) => {
  const invite = await prisma.invite.findUnique({
    where: {
      token,
      expiresAt: { gte: new Date() },
    },
    include: {
      workspace: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!invite) {
    throw new NotFoundException('Invalid or expired invitation link.')
  }

  return {
    email: invite.email,
    workspaceName: invite.workspace.name,
  }
}

/**
 * Allows a logged-in user to accept an invitation.
 * @param token The invitation token.
 * @param user The authenticated user trying to accept the invite.
 */
export const acceptInvite = async (token: string, user: AccessTokenPayload) => {
  // Find the valid invitation
  const invite = await prisma.invite.findUnique({
    where: {
      token,
      expiresAt: { gte: new Date() },
    },
  })

  if (!invite) {
    throw new NotFoundException('Invalid or expired invitation link.')
  }

  // Security check: ensure the logged-in user's email matches the invite email
  const userRecord = await prisma.user.findUnique({ where: { id: user.id } })
  if (!userRecord || userRecord.email !== invite.email) {
    throw new ForbiddenException(
      'This invitation is intended for a different email address.',
    )
  }

  // Use a transaction to create the membership and delete the invite
  await prisma.$transaction(async (tx) => {
    // Add the user to the workspace
    await tx.membership.create({
      data: {
        userId: user.id,
        workspaceId: invite.workspaceId,
        role: invite.role,
      },
    })

    // Delete the used invitation
    await tx.invite.delete({
      where: { id: invite.id },
    })
  })
}
