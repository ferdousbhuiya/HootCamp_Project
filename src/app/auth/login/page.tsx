'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-slate-500">Welcome back</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Sign in and keep your workflow focused on the next match.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Access your uploaded documents, skill history, and recommendations from one clean workspace.
          </p>
          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <p>• A simple sign-in surface with the same visual language as the rest of the app.</p>
            <p>• Your name and email will appear in the top bar once you&apos;re signed in.</p>
            <p>• No extra clutter, no decorative noise, just the task.</p>
          </div>
        </section>

        <Card className="w-full max-w-md justify-self-start">
          <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
          <p className="mt-2 text-sm text-slate-600">Use the email address tied to your workspace profile.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-slate-900 underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
