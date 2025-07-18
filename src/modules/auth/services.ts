import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma/client'
import { jwtUtils } from '@/lib/auth/jwt.util'
import { UnauthorizedException } from '@/exceptions/unauthorized.exception'
import { ConflictException } from '@/exceptions/conflict.exception'
import { NotFoundException } from '@/exceptions/not-found.exception'

import {
  AccessTokenPayload,
  LoginResponse,
  LoginResult,
} from '@/types/auth.types'
import {
  LoginData,
  RegisterData,
  ResetPasswordData,
  VerifyEmailData,
} from './schema'
import { User } from '@prisma/client'
import { generateAlphanumericOtp } from '@/utils/otp'
// import { User } from '@prisma/client'

/**
 * Generates access and refresh tokens for a given user.
 * @param user The user object to generate tokens for.
 * @returns An object containing the accessToken and refreshToken.
 */
const generateAuthTokens = async (user: User): Promise<LoginResponse> => {
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    select: {
      workspaceId: true,
      role: true,
    },
  })

  const accessTokenPayload: AccessTokenPayload = {
    id: user.id,
    name: user.name,
    emailVerified: user.emailVerified,
    memberships: memberships.map((m) => ({
      workspaceId: m.workspaceId,
      role: m.role,
    })),
  }

  const accessToken = jwtUtils.generateAccessToken(accessTokenPayload)
  const refreshToken = jwtUtils.generateRefreshToken({ id: user.id })

  return { accessToken, refreshToken }
}

/**
 * INTERNAL HELPER: Creates and sends a verification token for a given user object.
 * @param user The user object.
 */
const _sendVerificationEmailForUser = async (user: User): Promise<void> => {
  if (user.emailVerified) {
    throw new ConflictException('User email is already verified.')
  }
  const token = generateAlphanumericOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // Expires in 10 minutes

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  })

  // Here you would call a real email service
  // For example: await emailService.sendOtp(user.email, token);
  console.log(`Verification OTP for ${user.email}: ${token}`)
}

/**
 * PUBLIC SERVICE: Finds a user by email and sends a verification email.
 * @param email The user's email address.
 */
export const sendVerificationEmail = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } })

  // We only send if the user exists and is not yet verified.
  if (user && !user.emailVerified) {
    await _sendVerificationEmailForUser(user)
  } else {
    throw new ConflictException('User email is already verified')
  }
}

/**
 * Handles user registration and sends verification email.
 * @param registerData The user's registration data.
 */
export const register = async (registerData: RegisterData): Promise<void> => {
  const { email, name, password } = registerData

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new ConflictException('An account with this email already exists.')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  })

  // Immediately send a verification email upon registration
  await _sendVerificationEmailForUser(user)
}

/**
 * Handles user login.
 * @param loginData The user's login credentials.
 * @returns An object with access and refresh tokens, or user data if verification required.
 */
export const login = async (loginData: LoginData): Promise<LoginResult> => {
  const { email, password } = loginData

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new UnauthorizedException('Invalid credentials.')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials.')
  }

  if (!user.emailVerified) {
    await _sendVerificationEmailForUser(user)
    return { requiresVerification: true }
  }

  return generateAuthTokens(user)
}

/**
 * Generates a new pair of tokens from a valid refresh token.
 * @param token The incoming refresh token from the cookie.
 * @returns A new accessToken and refreshToken.
 */
export const refreshToken = async (token: string): Promise<LoginResponse> => {
  // 1. Verify the refresh token
  const payload = jwtUtils.verifyRefreshToken(token)

  // 2. Check if the user still exists
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  })

  if (!user) {
    throw new UnauthorizedException('User not found.')
  }

  // 3. Generate a new pair of tokens
  return generateAuthTokens(user)
}

/**
 * Handles the "forgot password" request.
 * @param email The user's email address.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new NotFoundException('User with that email does not exist.')
  }

  const token = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    },
  })

  console.log(token)

  // Here you would call a service to send the password reset email with the unhashed token
  // For example: await emailService.sendPasswordResetEmail(user, token);
}

/**
 * Resets a user's password using a valid token.
 * @param resetData The token and new password.
 */
export const resetPassword = async (
  resetData: ResetPasswordData,
): Promise<void> => {
  const { token, password } = resetData
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: hashedToken,
      expiresAt: { gte: new Date() },
    },
  })

  if (!resetToken) {
    throw new UnauthorizedException('Invalid or expired password reset token.')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),

    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ])
}

/**
 * Verifies a user's email with an OTP and logs them in.
 * @param verifyData The user's email and the OTP.
 * @returns An object with access and refresh tokens.
 */
export const verifyEmail = async (
  verifyData: VerifyEmailData,
): Promise<LoginResponse> => {
  const { email, token } = verifyData

  const verificationToken = await prisma.emailVerificationToken.findFirst({
    where: {
      user: { email },
      token,
      expiresAt: { gte: new Date() },
    },
    include: { user: true },
  })

  if (!verificationToken) {
    throw new UnauthorizedException('Invalid or expired verification code.')
  }

  const user = verificationToken.user

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    }),
  ])

  return generateAuthTokens(user)
}

/**
 * Fetches the profile of the currently authenticated user.
 * @param userId The ID of the user.
 * @returns The user's public profile data.
 */
export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new NotFoundException('User not found.')
  }

  return user
}
