'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b rounded-b-lg shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and Navigation Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-serif font-bold text-[#1e3a8a] tracking-tight">
              Shipper
            </span>
          </Link>

          <Separator orientation="vertical" className="h-5 bg-gray-300" />

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/blog"
              className="text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/community"
              className="text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors"
            >
              Community
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Right side - Auth Links and Button */}
        <div className="flex items-center gap-6">
          {isLoading ? (
            <div className="flex items-center gap-6">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-28 animate-pulse rounded-md bg-gray-200" />
            </div>
          ) : isAuthenticated ? (
            <>
              <Link href="/chat">
                <span className="text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors">
                  Playable Demo
                </span>
              </Link>
              <Link href="/chat">
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg px-5">
                  Go to Chat
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm font-normal"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/chat">
                <span className="text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors">
                  Playable Demo
                </span>
              </Link>
              <Link href="/login">
                <span className="text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors">
                  Login
                </span>
              </Link>
              <Link href="/register">
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg px-6 font-medium">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
