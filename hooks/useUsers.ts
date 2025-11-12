'use client';

import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

/**
 * Get all users
 */
async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const data = await response.json();
  return data.users;
}

/**
 * Custom hook for fetching users
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
  });
}

