'use client';

import { useQuery } from '@tanstack/react-query';
import { User } from './useUsers';

/**
 * Get AI user information
 */
async function getAIUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/users/ai');
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
}

/**
 * Custom hook for fetching AI user
 */
export function useAIUser() {
  return useQuery({
    queryKey: ['ai-user'],
    queryFn: getAIUser,
    refetchOnWindowFocus: false,
    staleTime: Infinity, // AI user doesn't change
  });
}

