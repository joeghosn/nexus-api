import { NextFunction, Request, Response } from 'express'
import { jwtUtils } from '@/lib/auth/jwt.util'
import { UnauthorizedException } from '@/exceptions/unauthorized.exception'
import { AccessTokenPayload } from '@/types/auth.types'

// This extends the global Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
    }
  }
}

/**
 * Extracts the JWT Access Token from the Authorization header.
 * @param req The Express request object.
 * @returns The token string or null if not found.
 */
const extractTokenFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Return the token part after "Bearer "
    return authHeader.substring(7)
  }
  return null
}

/**
 * Middleware to verify JWT and attach user payload to the request.
 * It only handles AUTHENTICATION, not authorization.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = extractTokenFromHeader(req)

    if (!token) {
      throw new UnauthorizedException(
        'Authentication required. No token provided.',
      )
    }

    // Verify the token and get the payload
    const payload = jwtUtils.verifyAccessToken(token)

    req.user = payload

    next()
  } catch (error) {
    next(error)
  }
}
