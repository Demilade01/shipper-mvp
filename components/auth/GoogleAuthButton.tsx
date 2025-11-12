'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function GoogleAuthButton() {
  const { googleAuth, isGoogleAuthing } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      setError(null);
      if (!credentialResponse?.credential) {
        setError('No credential received from Google');
        return;
      }
      await googleAuth({ credential: credentialResponse.credential });
      router.push('/chat');
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Google authentication failed. Please try again.');
    }
  };

  const handleError = () => {
    console.error('Google login failed');
    setError('Google login failed. Please try again.');
  };

  // Check if Google Client ID is configured
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <div className="text-sm text-muted-foreground text-center">
        Google OAuth is not configured. Please contact the administrator.
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
        />
      </div>
    </div>
  );
}
