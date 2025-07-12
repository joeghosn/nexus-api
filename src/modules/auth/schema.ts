import { z } from 'zod'

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const strongPasswordErrorMessage =
  'Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character.'

// Regex: Exactly 6 alphanumeric characters (case-insensitive)
const otpRegex = /^[A-Za-z0-9]{6}$/

export const loginSchema = z
  .object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string(),
  })
  .strict()

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Name must be at least 3 characters long' }),
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().regex(strongPasswordRegex, {
      message: strongPasswordErrorMessage,
    }),
  })
  .strict()

// For when a user forgets their password and enters their email
export const forgotPasswordSchema = z.object({
  email: z.email({ message: 'A valid email is required' }),
})

// For when a user submits the reset token and their new password
export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().regex(strongPasswordRegex, {
    message: strongPasswordErrorMessage,
  }),
})

// For when a user verifies their email using a token
export const verifyEmailSchema = z.object({
  email: z.email({ message: 'A valid email is required' }),
  token: z.string().regex(otpRegex, { message: 'Invalid OTP format' }),
})

// For requesting a new verification email to be sent
export const resendVerificationSchema = z.object({
  email: z.email({ message: 'A valid email is required' }),
})

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type VerifyEmailData = z.infer<typeof verifyEmailSchema>
export type ResendVerificationData = z.infer<typeof resendVerificationSchema>
