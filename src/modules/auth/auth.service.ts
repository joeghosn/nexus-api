import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma/client'
import { jwtUtils } from '@/lib/auth/jwt.util'
import { UnauthorizedException } from '@/exceptions/unauthorized.exception'
import { LoginData } from '@/schemas/auth.schema'
import { LoginResponse } from '@/types/auth.types'

export class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    const { email, password } = data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = jwtUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = jwtUtils.generateRefreshToken({
      userId: user.id,
    })

    return {
      accessToken,
      refreshToken,
    }
  }
  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = jwtUtils.verifyRefreshToken(refreshToken)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const accessToken = jwtUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const newRefreshToken = jwtUtils.generateRefreshToken({
      userId: user.id,
    })

    return { accessToken, refreshToken: newRefreshToken }
  }
}
