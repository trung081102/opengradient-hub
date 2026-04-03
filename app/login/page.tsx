'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const authError = searchParams.get('error');
  const { signIn, signInWithGitHub, signInWithGoogle, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    authError === 'auth_callback_failed' ? 'Authentication failed. Please try again.' : null
  );
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #00D4AA)' }}
          >
            OG
          </div>
          <span className="text-white font-bold text-xl">OpenGradient Hub</span>
        </Link>
        <p className="text-og-text-secondary mt-2 text-sm">
          The Front Page of Verifiable AI
        </p>
      </div>

      {/* Card */}
      <div className="bg-og-card border border-og-border rounded-xl p-6">
        <h1 className="text-white text-xl font-bold mb-6 text-center">Welcome back</h1>

        {!isConfigured && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <p className="text-yellow-400 text-xs text-center">
              Demo mode - Supabase not configured. Set environment variables to enable auth.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={signInWithGitHub}
            disabled={!isConfigured}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-og-purple hover:bg-og-purple-dark text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>

          <button
            onClick={signInWithGoogle}
            disabled={!isConfigured}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-og-border" />
          <span className="text-og-text-muted text-xs">or continue with email</span>
          <div className="flex-1 h-px bg-og-border" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-og-text-secondary text-sm mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 bg-og-dark border border-og-border rounded-lg text-white text-sm placeholder-og-text-muted focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-og-text-secondary text-sm mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2.5 bg-og-dark border border-og-border rounded-lg text-white text-sm placeholder-og-text-muted focus:outline-none focus:border-og-purple focus:ring-1 focus:ring-og-purple transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="w-full py-2.5 bg-og-purple hover:bg-og-purple-dark text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-og-text-secondary text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-og-purple hover:text-og-purple-light transition-colors">
            Create one
          </Link>
        </p>
      </div>

      {/* Back to home */}
      <p className="text-center mt-4">
        <Link href="/" className="text-og-text-muted text-sm hover:text-og-text-secondary transition-colors">
          &larr; Back to OpenGradient Hub
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-og-dark flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-og-purple border-t-transparent rounded-full" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
