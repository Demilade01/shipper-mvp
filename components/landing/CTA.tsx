'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-[#f9f9f9] py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 sm:mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl px-2">
            Ready to start chatting?
          </h2>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Join thousands of users already connected. Get started in seconds.
          </p>

          <div className="flex flex-col items-stretch sm:items-center justify-center gap-3 sm:gap-4 sm:flex-row px-2">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

