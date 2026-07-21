'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { loading, error, success, signUp } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    if (password !== confirmPassword) { setValidationError('Passwords do not match.'); return; }
    await signUp(email, password, fullName, phoneNumber);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-slate-500">Create your workspace</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Set up your profile once, then keep your career data in one place.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Register with your name and phone number so the dashboard header can show the right identity after sign-in.
          </p>
          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <p>• Keep a consistent identity across sign-in, matching, and uploads.</p>
            <p>• Collect contact details up front for a cleaner profile handoff later.</p>
            <p>• Use the same workspace after login without repeating your profile details.</p>
          </div>
        </section>

        <Card className="w-full max-w-md justify-self-start">
          <h2 className="text-2xl font-semibold text-slate-900">Sign Up</h2>
          <p className="mt-2 text-sm text-slate-600">Use your work identity and keep your profile visible in the header.</p>
          {(validationError || error) && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{validationError || error}</div>}
          {success && <div role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{success}</div>}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Full Name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required />
            <Input label="Phone Number" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} autoComplete="tel" required />
            <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link href="/auth/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">Login</Link></p>
        </Card>
      </div>
    </div>
  );
}
