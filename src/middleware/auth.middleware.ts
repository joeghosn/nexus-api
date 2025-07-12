import { NextFunction, Request, Response } from 'express'
import { jwtUtils } from '../lib/auth/jwt.util'
import { UnauthorizedException } from '../exceptions/unauthorized.exception'

declare global {
  namespace Express {
    interface Request {
      user?: 
    }
  }
}

const extractToken = (req: Request): string | null => {
  // First, check httpOnly cookies (desktop browsers)
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken
  }

  // Fallback to Authorization header (mobile apps, browsers without cookie support)
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req)

    if (!token) {
      throw new UnauthorizedException('Authentication required')
    }

    // Verify the token
    const payload = jwtUtils.verifyAccessToken(token)

    // Check if user has admin role
    if (payload.role !== 'admin') {
      throw new UnauthorizedException('Admin access required')
    }

    // Attach user info from token to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    }

    next()
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      return next(error)
    }

    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return next(new UnauthorizedException('Token has expired'))
      }

      if (error.name === 'JsonWebTokenError') {
        return next(new UnauthorizedException('Invalid token'))
      }

      if (error.name === 'NotBeforeError') {
        return next(new UnauthorizedException('Token not active yet'))
      }
    }

    next(new UnauthorizedException('Authentication failed'))
  }
}
