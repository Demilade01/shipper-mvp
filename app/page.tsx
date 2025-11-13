import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connect with your team instantly',
  description: 'Send messages, see who\'s online, and chat in real-time. Fast, secure, and free to use. Real-time chat made simple.',
  keywords: [
    'real-time chat',
    'team communication',
    'instant messaging',
    'online chat',
    'team collaboration',
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Hero />
      </main>
    </div>
  );
}
