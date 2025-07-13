import z from 'zod'

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const strongPasswordErrorMessage =
  'Password must be at least 8 characters long and contain one uppercase letter, one lowercase letter, one number, and one special character.'

// For when a logged-in user changes their password
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current password is required' }),
    newPassword: z.string().regex(strongPasswordRegex, {
      message: strongPasswordErrorMessage,
    }),
  })
  .strict()

export type ChangePasswordData = z.infer<typeof changePasswordSchema>
