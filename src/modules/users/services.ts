import { prisma } from '@/lib/prisma/client'

import { NotFoundException } from '@/exceptions/not-found.exception'
import { UnauthorizedException } from '@/exceptions/unauthorized.exception'
import bcrypt from 'bcrypt'
import { ChangePasswordData } from './schema'

/**
 * Allows an authenticated user to change their password.
 * @param userId The ID of the user changing their password.
 * @param passwordData The current and new password data.
 */
export const changePassword = async (
  userId: string,
  passwordData: ChangePasswordData,
) => {
  const { currentPassword, newPassword } = passwordData

  // 1. Find the user in the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  // This is a safety check, but should be unlikely if authMiddleware is working
  if (!user) {
    throw new NotFoundException('User not found.')
  }

  // 2. Verify their current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
  if (!isPasswordValid) {
    throw new UnauthorizedException('Incorrect current password.')
  }

  // 3. Hash the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  // 4. Update the user's password in the database
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
    },
  })
}
