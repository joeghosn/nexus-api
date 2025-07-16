import { NextFunction, Request, Response } from 'express'
import { ForbiddenException } from '@/exceptions/forbidden.exception'
import { NotFoundException } from '@/exceptions/not-found.exception'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { Membership } from '@prisma/client'

/**
 * Middleware factory that validates three things in a single database call:
 * 1. The workspace with the given :workspaceId exists.
 * 2. The authenticated user is a member of that workspace.
 * 3. The user's role within that workspace is one of the allowed roles.
 *
 * @param allowedRoles An array of roles that are allowed to access the route.
 */
export const validateWorkspaceAccess = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params
      const user = req.user!

      // This single, efficient query checks for membership and gets the role.
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: workspaceId,
          },
        },
      })

      // If no membership is found, it means either the workspace doesn't exist
      // or the user is not a member of it. For security, we give a generic error.
      if (!membership) {
        throw new ForbiddenException(
          'You do not have access to this workspace.',
        )
      }

      // Now, check if the member's role is in the list of allowed roles.
      if (!allowedRoles.includes(membership.role)) {
        throw new ForbiddenException(
          "You don't have the required permissions to perform this action.",
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
