'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Background with subtle glassy effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 md:mb-8 inline-flex items-center gap-2 rounded-full border border-[#070825]/10 bg-white/60 backdrop-blur-[10px] px-4 py-2 text-xs sm:text-sm text-[#070825]/70 shadow-sm"
          >
            <span>✨</span>
            <span>Real-time chat made simple</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6 md:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-[#070825] leading-tight"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Connect with your team
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#070825] to-[#070825]/70">
              instantly
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-8 md:mb-12 text-lg sm:text-xl md:text-2xl text-[#070825]/60 max-w-2xl mx-auto px-4 leading-relaxed"
          >
            Send messages, see who&apos;s online, and chat in real-time.
            <br className="hidden sm:block" />
            Fast, secure, and free to use.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg font-semibold px-8 sm:px-10 py-6 sm:py-7 bg-[#070825] hover:bg-[#070825]/90 text-white rounded-full shadow-xl shadow-[#070825]/20 hover:shadow-2xl hover:shadow-[#070825]/30 transition-all duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto text-base sm:text-lg font-medium px-8 sm:px-10 py-6 sm:py-7 text-[#070825]/70 hover:text-[#070825] hover:bg-white/80 border-2 border-[#070825]/10 rounded-full transition-all duration-300"
                >
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Secondary Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8 md:mt-10 text-sm sm:text-base text-[#070825]/50 px-4"
          >
            No credit card required • Free forever
          </motion.p>
        </div>
      </div>

      {/* Decorative elements with subtle motion */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#070825]/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#070825]/3 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </section>
  );
}
