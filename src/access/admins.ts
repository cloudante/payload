import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAdmin = (args: AccessArgs<User>) => boolean

export const admins: isAdmin = ({ req: { user } }) => {
  // In a real application, you'd check for admin role/permissions
  // For now, simply check if user is authenticated
  return Boolean(user)
} 