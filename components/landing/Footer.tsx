'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-[#f9f9f9] py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:space-y-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sm sm:text-base">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Shipper</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Real-time chat application for teams and individuals.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Product</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground px-2">
          <p>
            © {new Date().getFullYear()} Shipper. Built with Next.js, Prisma, and Socket.io.
          </p>
        </div>
      </div>
    </footer>
  );
}

