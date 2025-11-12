'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function GoogleAuthButton() {
  const { googleAuth, isGoogleAuthing } = useAuth();
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      await googleAuth({ credential: credentialResponse.credential });
      router.push('/chat');
    } catch (error) {
      console.error('Google auth error:', error);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap
    />
  );
}

