'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterInput } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { GoogleAuthButton } from './GoogleAuthButton';
import { AlertCircle } from 'lucide-react';

export function RegisterForm() {
  const [error, setError] = useState('');
  const { register, isRegistering } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError('');
    try {
      await register(data);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-[20px] border border-gray-100/50 shadow-xl shadow-[#070825]/5">
      <CardHeader>
        <CardTitle className="text-[#070825]">Register</CardTitle>
        <CardDescription className="text-[#070825]/60">
          Create a new account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#070825]">Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      className="border-gray-200 focus:border-[#070825] focus:ring-[#070825]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#070825]">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="border-gray-200 focus:border-[#070825] focus:ring-[#070825]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#070825]">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="border-gray-200 focus:border-[#070825] focus:ring-[#070825]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[#070825]/50">
                    Must be at least 8 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#070825] hover:bg-[#070825]/90 text-white rounded-full shadow-lg shadow-[#070825]/20 transition-all duration-300"
              disabled={isRegistering}
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#070825]/50">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleAuthButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
