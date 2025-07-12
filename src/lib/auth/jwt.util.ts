import jwt from 'jsonwebtoken'
import { config } from '@/config'
import { AccessTokenPayload, RefreshTokenPayload } from '@/types/auth.types'

export const jwtUtils = {
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' })
  },

  generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: '7d',
    })
  },

  verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.secret) as AccessTokenPayload
  },

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload
  },
}
