'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export function GoogleAuthButton() {
  const { googleAuth, isGoogleAuthing } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const googleLoginRef = useRef<HTMLDivElement>(null);

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
      <div className="text-sm text-[#070825]/60 text-center p-4 bg-white/50 backdrop-blur-[10px] rounded-lg border border-gray-200">
        Google OAuth is not configured. Please contact the administrator.
      </div>
    );
  }

  // Store reference to Google button for clicking
  const googleButtonRef = useRef<HTMLElement | null>(null);

  // Find and store Google button reference once it's rendered
  useEffect(() => {
    const findGoogleButton = () => {
      if (googleLoginRef.current) {
        // Look for the Google button (it might be in an iframe or a div with role="button")
        const button = googleLoginRef.current.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          googleButtonRef.current = button;
          return;
        }
        // Also check for iframe
        const iframe = googleLoginRef.current.querySelector('iframe') as HTMLElement;
        if (iframe) {
          googleButtonRef.current = iframe;
        }
      }
    };

    // Try immediately
    findGoogleButton();

    // Also try after a delay to account for async rendering
    const timeout = setTimeout(findGoogleButton, 500);

    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      findGoogleButton();
    });

    if (googleLoginRef.current) {
      observer.observe(googleLoginRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  // Handle custom button click to trigger Google OAuth
  const handleCustomClick = () => {
    // Try to click the stored Google button reference
    if (googleButtonRef.current) {
      googleButtonRef.current.click();
      return;
    }

    // Fallback: try to find and click the button
    if (googleLoginRef.current) {
      const button = googleLoginRef.current.querySelector('div[role="button"]') as HTMLElement;
      if (button) {
        button.click();
      }
    }
  };

  return (
    <div className="w-full">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm text-red-600">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* GoogleLogin component - hidden but functional */}
      <div ref={googleLoginRef} className="relative w-full">
        {/* Hidden GoogleLogin - rendered but invisible */}
        <div
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        >
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
          />
        </div>

        {/* Custom styled button overlay */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full relative z-10"
          style={{ pointerEvents: 'auto' }}
        >
          <Button
            type="button"
            onClick={handleCustomClick}
            disabled={isGoogleAuthing}
            className="w-full bg-white hover:bg-gray-50 text-[#070825] border-2 border-gray-200 hover:border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-300 font-medium py-6 sm:py-7 text-base sm:text-lg relative overflow-hidden group"
          >
            {isGoogleAuthing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in with Google...
              </>
            ) : (
              <>
                {/* Google Icon */}
                <svg
                  className="mr-3 h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
