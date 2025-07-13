import { NextFunction, Request, Response } from 'express'
import { ForbiddenException } from '@/exceptions/forbidden.exception'
import { Role } from '@prisma/client'

/**
 * Middleware factory to check if a user has one of the required roles for a specific workspace.
 * This middleware relies on the user's memberships being present in the JWT payload.
 *
 * @param allowedRoles An array of roles that are allowed to access the route.
 */
export const hasWorkspaceRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { workspaceId } = req.params
    const user = req.user

    if (!user || !workspaceId) {
      // This should ideally not happen if authMiddleware runs first
      throw new ForbiddenException('Access denied.')
    }

    // Find the user's membership for the specific workspace from the JWT payload
    const membership = user.memberships.find(
      (m) => m.workspaceId === workspaceId,
    )

    // If the user is not a member of this workspace, or their role is not in the allowed list
    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(
        "You don't have the required permissions for this workspace.",
      )
    }

    next()
  }
}
