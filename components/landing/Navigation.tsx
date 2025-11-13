'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Navigation() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if clicking outside the nav element
      if (mobileMenuOpen && !target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b rounded-b-lg shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Logo and Navigation Links */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
            <span className="text-lg md:text-xl font-serif font-bold text-[#1e3a8a] tracking-tight">
              Shipper
            </span>
          </Link>

          <Separator orientation="vertical" className="hidden md:block h-5 bg-gray-300" />

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

        {/* Right side - Auth Links and Button (Desktop) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {isLoading ? (
            <div className="flex items-center gap-4 lg:gap-6">
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
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg px-4 lg:px-5 text-sm">
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
                <Button className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-lg px-4 lg:px-6 font-medium text-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-2">
              <Link
                href="/blog"
                className="block py-2 text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors"
                onClick={closeMobileMenu}
              >
                Blog
              </Link>
              <Link
                href="/community"
                className="block py-2 text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors"
                onClick={closeMobileMenu}
              >
                Community
              </Link>
              <Link
                href="/pricing"
                className="block py-2 text-sm font-normal text-gray-500 hover:text-gray-700 transition-colors"
                onClick={closeMobileMenu}
              >
                Pricing
              </Link>
            </div>

            <Separator />

            {/* Auth Links */}
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-2">
                <Link href="/chat" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Playable Demo
                  </Button>
                </Link>
                <Link href="/chat" onClick={closeMobileMenu}>
                  <Button className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-sm">
                    Go to Chat
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/chat" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Playable Demo
                  </Button>
                </Link>
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMobileMenu}>
                  <Button className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white text-sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
