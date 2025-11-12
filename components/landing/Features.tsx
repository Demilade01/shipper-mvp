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
    <section id="features" className="bg-[#f9f9f9] py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to chat
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features to keep you connected with your team
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="transition-all hover:shadow-lg hover:bg-[#f8fafb]"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

