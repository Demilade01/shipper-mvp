'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, MessageSquare, Zap } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Sign Up',
    description: 'Create your account with Google OAuth or email. It takes less than a minute.',
  },
  {
    icon: Users,
    step: '02',
    title: 'Find Users',
    description: 'Browse the user list to see who\'s online and available to chat.',
  },
  {
    icon: MessageSquare,
    step: '03',
    title: 'Start Chatting',
    description: 'Click on a user to start a conversation. Messages are delivered instantly.',
  },
  {
    icon: Zap,
    step: '04',
    title: 'Real-Time Updates',
    description: 'See messages appear in real-time. Chat history is automatically saved.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#f8fafb] py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in four simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="h-full transition-all hover:shadow-lg hover:bg-[#f9f9f9]">
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-4xl font-bold text-muted-foreground/20">
                        {step.step}
                      </span>
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

