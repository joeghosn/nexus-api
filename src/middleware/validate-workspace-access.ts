import { NextFunction, Request, Response } from 'express'
import { ForbiddenException } from '@/exceptions/forbidden.exception'
import { NotFoundException } from '@/exceptions/not-found.exception'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { Membership } from '@prisma/client'

// Extend the Request type to include the membership for later use
declare global {
  namespace Express {
    interface Request {
      membership?: Membership
    }
  }
}

/**
 * Middleware factory that validates workspace access with detailed error handling.
 * 1. Checks if the workspace exists.
 * 2. Checks if the user is a member.
 * 3. Checks if the user's role is sufficient.
 * 4. Attaches the membership to the request object.
 *
 * @param allowedRoles An array of roles that are allowed to access the route.
 */
export const validateWorkspaceAccess = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workspaceId } = req.params
      const user = req.user!

      // Step 1: Check if the workspace exists.
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true },
      })

      if (!workspace) {
        throw new NotFoundException('Workspace not found.')
      }

      // Step 2: Check if the user is a member of this workspace.
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId: workspaceId,
          },
        },
      })

      if (!membership) {
        throw new ForbiddenException('You are not a member of this workspace.')
      }

      // Step 3: Check if the member's role is in the list of allowed roles.
      if (!allowedRoles.includes(membership.role)) {
        throw new ForbiddenException(
          "You don't have the required permissions to perform this action.",
        )
      }

      // Step 4: Attach the membership to the request for potential use later.
      req.membership = membership

      next()
    } catch (error) {
      next(error)
    }
  }
}
