import { cookies } from 'next/headers';

// Cookie names
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Set access token cookie
 */
export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    ...cookieOptions,
    maxAge: 15 * 60, // 15 minutes in seconds
  });
}

/**
 * Set refresh token cookie
 */
export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Get access token from cookie
 */
export async function getAccessTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE);
  return token?.value || null;
}

/**
 * Get refresh token from cookie
 */
export async function getRefreshTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REFRESH_TOKEN_COOKIE);
  return token?.value || null;
}

/**
 * Clear access token cookie
 */
export async function clearAccessTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

/**
 * Clear refresh token cookie
 */
export async function clearRefreshTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * Clear all auth cookies
 */
export async function clearAuthCookies() {
  await clearAccessTokenCookie();
  await clearRefreshTokenCookie();
}

/**
 * Set both tokens in cookies
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  await setAccessTokenCookie(accessToken);
  await setRefreshTokenCookie(refreshToken);
}

