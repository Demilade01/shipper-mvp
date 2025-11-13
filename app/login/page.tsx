'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#070825]/60">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1
            className="text-3xl md:text-4xl font-bold tracking-tight text-[#070825]"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Welcome back
          </h1>
          <p className="text-[#070825]/60">
            Sign in to your account to continue
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-sm">
          <span className="text-[#070825]/60">Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="font-medium text-[#070825] hover:text-[#070825]/80 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
