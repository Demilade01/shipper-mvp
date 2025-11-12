'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-[#f8fafb] py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            <span>Real-time chat made simple</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Connect with your team
            <br />
            <span className="text-primary">instantly</span>
          </h1>

          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Send messages, see who&apos;s online, and chat in real-time.
            <br />
            Fast, secure, and free to use.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required • Free forever
          </p>
        </div>
      </div>
    </section>
  );
}

