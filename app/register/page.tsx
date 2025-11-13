'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
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
            Create an account
          </h1>
          <p className="text-[#070825]/60">
            Get started with Shipper in seconds
          </p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-[#070825]/60">Already have an account? </span>
          <Link
            href="/login"
            className="font-medium text-[#070825] hover:text-[#070825]/80 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
