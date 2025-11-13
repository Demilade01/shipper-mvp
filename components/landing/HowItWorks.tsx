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
    <section id="how-it-works" className="bg-[#f8fafb] py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="mb-3 sm:mb-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Get started in four simple steps
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="h-full transition-all hover:shadow-lg hover:bg-[#f9f9f9]">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-muted-foreground/20">
                        {step.step}
                      </span>
                    </div>
                    <CardTitle className="text-base sm:text-lg mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">{step.description}</CardDescription>
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

