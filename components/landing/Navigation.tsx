'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#features', label: 'Features' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#about', label: 'About' },
    { href: '/#contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-[20px] shadow-sm border-b border-gray-100/50'
          : 'bg-white/60 backdrop-blur-[20px]'
      }`}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="text-xl md:text-2xl font-bold text-[#070825] tracking-tight"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Shipper
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="text-sm font-medium text-[#070825]/70 hover:text-[#070825] transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#070825] transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
              <div className="h-9 w-24 animate-pulse rounded-md bg-gray-200" />
            </div>
          ) : isAuthenticated ? (
            <>
              <Link href="/chat">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-[#070825]/70 hover:text-[#070825]"
                >
                  Chat
                </Button>
              </Link>
              <Link href="/chat">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-[#070825] hover:bg-[#070825]/90 text-white text-sm font-medium px-6 rounded-full shadow-lg shadow-[#070825]/20">
                    Go to Chat
                  </Button>
                </motion.div>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-sm font-medium text-[#070825]/70 hover:text-[#070825]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-[#070825]/70 hover:text-[#070825]"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-[#070825] hover:bg-[#070825]/90 text-white text-sm font-medium px-6 rounded-full shadow-lg shadow-[#070825]/20">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-[#070825]/70 hover:text-[#070825] hover:bg-white/50 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white/80 backdrop-blur-[20px] border-t border-gray-100/50"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block py-2 text-sm font-medium text-[#070825]/70 hover:text-[#070825] transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-4 border-t border-gray-100/50 space-y-3">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                    <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <Link href="/chat" onClick={closeMobileMenu}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium text-[#070825]/70 hover:text-[#070825]"
                      >
                        Chat
                      </Button>
                    </Link>
                    <Link href="/chat" onClick={closeMobileMenu}>
                      <Button className="w-full bg-[#070825] hover:bg-[#070825]/90 text-white text-sm font-medium rounded-full shadow-lg shadow-[#070825]/20">
                        Go to Chat
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-sm font-medium text-[#070825]/70 hover:text-[#070825]"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMobileMenu}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-medium text-[#070825]/70 hover:text-[#070825]"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={closeMobileMenu}>
                      <Button className="w-full bg-[#070825] hover:bg-[#070825]/90 text-white text-sm font-medium rounded-full shadow-lg shadow-[#070825]/20">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
