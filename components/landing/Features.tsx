'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Shield, History, Sparkles } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Real-Time Messaging',
    description: 'Send and receive messages instantly with WebSocket technology. No delays, no waiting.',
  },
  {
    icon: Users,
    title: 'See Who\'s Online',
    description: 'Know who\'s available and start conversations instantly. Online status updates in real-time.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Sign in with Google or email. Your messages are secure, private, and encrypted.',
  },
  {
    icon: History,
    title: 'Message History',
    description: 'All your conversations are saved and accessible anytime. Never lose a message.',
  },
  {
    icon: Sparkles,
    title: 'Chat with AI',
    description: 'Get instant help with AI-powered chat assistance. Ask questions and get smart answers.',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-[#f9f9f9] py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="mb-3 sm:mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Everything you need to chat
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Powerful features to keep you connected with your team
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="transition-all hover:shadow-lg hover:bg-[#f8fafb]"
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <CardTitle className="text-base sm:text-lg mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

