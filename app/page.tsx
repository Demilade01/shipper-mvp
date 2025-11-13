import { Navigation } from '@/components/landing/Navigation';
import { Hero } from '@/components/landing/Hero';

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
