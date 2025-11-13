'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-[#f8fafb] py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Real-time chat made simple</span>
          </div>

          <h1 className="mb-4 sm:mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Connect with your team
            <br className="hidden sm:block" />
            <span className="text-primary">instantly</span>
          </h1>

          <p className="mb-6 sm:mb-8 text-base text-muted-foreground sm:text-lg md:text-xl lg:text-2xl px-2">
            Send messages, see who&apos;s online, and chat in real-time.
            <br className="hidden sm:block" />
            Fast, secure, and free to use.
          </p>

          <div className="flex flex-col items-stretch sm:items-center justify-center gap-3 sm:gap-4 sm:flex-row px-2">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground px-2">
            No credit card required • Free forever
          </p>
        </div>
      </div>
    </section>
  );
}

