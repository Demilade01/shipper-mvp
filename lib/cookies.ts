import { cookies } from 'next/headers';

// Cookie names
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const SOCKET_TOKEN_COOKIE = 'socket_token'; // Non-HttpOnly cookie for Socket.io

// Cookie options for HttpOnly cookies (API requests)
const httpOnlyCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Cookie options for non-HttpOnly cookies (Socket.io client-side access)
const socketCookieOptions = {
  httpOnly: false, // Must be false for client-side access
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Set access token cookie (HttpOnly for API requests)
 */
export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    ...httpOnlyCookieOptions,
    maxAge: 15 * 60, // 15 minutes in seconds
  });
}

/**
 * Set socket token cookie (non-HttpOnly for Socket.io client-side access)
 */
export async function setSocketTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SOCKET_TOKEN_COOKIE, token, {
    ...socketCookieOptions,
    maxAge: 15 * 60, // 15 minutes in seconds
  });
}

/**
 * Set refresh token cookie
 */
export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    ...httpOnlyCookieOptions,
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
 * Clear socket token cookie
 */
export async function clearSocketTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SOCKET_TOKEN_COOKIE);
}

/**
 * Clear refresh token cookie
 */
export async function clearRefreshTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * Clear all auth cookies (including socket token)
 */
export async function clearAuthCookies() {
  await clearAccessTokenCookie();
  await clearSocketTokenCookie();
  await clearRefreshTokenCookie();
}

/**
 * Set both tokens in cookies (including socket token for client-side access)
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  await setAccessTokenCookie(accessToken);
  await setSocketTokenCookie(accessToken); // Also set non-HttpOnly cookie for Socket.io
  await setRefreshTokenCookie(refreshToken);
}

