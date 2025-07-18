import asyncHandler from '@/utils/async-handler'
import {
  ForgotPasswordData,
  LoginData,
  RegisterData,
  ResetPasswordData,
  ResendVerificationData,
  VerifyEmailData,
} from './schema'

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
import { Request, Response } from 'express'
import { config } from '@/config'
import {
  forgotPassword,
  getMe,
  login,
  refreshToken,
  register,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from './services'
import { BadRequestException } from '@/exceptions'

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body as RegisterData

    await register({ name, email, password })

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message:
        'Registration successful. Please check your email to verify your account.',
      data: {
        name,
        email,
      },
    })
  },
)

/**
 * @desc    Authenticate a user and get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password }: LoginData = req.body

    const result = await login({ email, password })

    // Check if user requires email verification
    if ('requiresVerification' in result) {
      return res.status(200).json({
        status: 'success',
        statusCode: 200,
        message:
          'Please check your email and verify your account before logging in. A new verification code has been sent.',
        data: {
          email: email,
        },
      })
    }

    // User is verified, proceed with setting tokens
    // Get cookie settings based on the environment
    const cookieSettings = config.cookies.getSettings(config.isProduction())

    // Set the refresh token in a secure, httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieSettings,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Send the access token in the response body
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
      },
    })
  },
)

/**
 * @desc    Get a new access token using a refresh token
 * @route   POST /api/auth/refresh
 * @access  Public (via cookie)
 */
export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken

    if (!token) {
      throw new BadRequestException('Refresh token is required.')
    }

    const result = await refreshToken(token)

    const cookieSettings = config.cookies.getSettings(config.isProduction())

    res.cookie('refreshToken', result.refreshToken, {
      ...cookieSettings,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
      },
    })
  },
)

/**
 * @desc    Request a password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPasswordData

    await forgotPassword(email)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'A password reset link has been sent to your email.',
      data: {
        email,
      },
    })
  },
)

/**
 * @desc    Reset a user's password using a token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const resetData = req.body as ResetPasswordData

    await resetPassword(resetData)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Password has been reset successfully. You can now log in.',
      data: null,
    })
  },
)

/**
 * @desc    Send (or resend) a verification OTP to a user's email
 * @route   POST /api/auth/send-verification-email
 * @access  Public
 */
export const sendVerificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as ResendVerificationData

    await sendVerificationEmail(email)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'A verification code has been sent to your email',
      data: {
        email,
      },
    })
  },
)

/**
 * @desc    Verify a user's email with the submitted OTP and log them in
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const verifyData = req.body as VerifyEmailData

    const result = await verifyEmail(verifyData)

    // Get cookie settings based on the environment
    const cookieSettings = config.cookies.getSettings(config.isProduction())

    // Set the refresh token in a secure, httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieSettings,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Send the access token in the response body
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Email has been verified successfully. You are now logged in.',
      data: {
        accessToken: result.accessToken,
      },
    })
  },
)

/**
 * @desc    Get the profile of the currently logged-in user
 * @route   GET /api/auth/me
 * @access  Authenticated
 */
export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    // The authMiddleware will add the user payload to the request object.
    // It adds `req.user` which contains the user's ID.
    const user = req.user!

    const me = await getMe(user.id)

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'User profile fetched successfully',
      data: me,
    })
  },
)

/**
 * @desc    Logout a user
 * @route   POST /api/auth/logout
 * @access  Authenticated
 */
export const logoutController = asyncHandler(
  async (_req: Request, res: Response) => {
    // Get cookie settings to ensure correct domain/path for clearing
    const cookieSettings = config.cookies.getSettings(config.isProduction())

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', cookieSettings)

    // Send a successful response
    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Logout successful',
      data: null,
    })
  },
)
