import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/auth';

/**
 * Get current user from server-side (for Server Components)
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  const user = await getUserFromToken(accessToken);
  return user;
}

