'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get('callbackUrl') ?? '/dashboard');
    setRegistered(params.get('registered') === 'true');
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrorMessage('Invalid email or password.');
      setIsSubmitting(false);
      return;
    }

    router.push(callbackUrl);
  };

  const handleGoogle = async () => {
    setIsSubmitting(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">
          Use your email and password, or Google.
        </p>

        {registered && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 mb-4">
            Account created successfully. Please sign in.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full cursor-pointer"
          onClick={handleGoogle}
          disabled={isSubmitting}
        >
          Continue with Google
        </Button>

        <p className="text-sm text-gray-600 mt-6 text-center">
          No account yet?{' '}
          <Link className="text-blue-600 hover:text-blue-700" href="/auth/register">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
