'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { loading, error, success, signUp } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    if (password !== confirmPassword) { setValidationError('Passwords do not match.'); return; }
    await signUp(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
        {(validationError || error) && <div role="alert" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{validationError || error}</div>}
        {success && <div role="status" className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</Button>
        </form>
        <p className="text-center mt-4 text-gray-600">Already have an account? <Link href="/auth/login" className="text-primary-600 hover:underline">Login</Link></p>
      </Card>
    </div>
  );
}
