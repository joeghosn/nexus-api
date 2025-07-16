import { Role, User } from '@prisma/client'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export type LoginResult = LoginResponse | { requiresVerification: true }

export type MembershipPayload = {
  workspaceId: string
  role: Role
}

export interface AccessTokenPayload {
  id: string
  name: string
  emailVerified: boolean
  memberships: MembershipPayload[]
}

export interface RefreshTokenPayload {
  id: string
}
