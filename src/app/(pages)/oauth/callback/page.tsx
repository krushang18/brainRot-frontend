'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Badge } from 'sketchbook-ui';
import { authService } from '@/services/authService';

// Error message map keyed by the ?error= query param value
const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'Google login failed, please try again',
  no_email: 'No verified email found on your Google account',
  github_oauth_failed: 'GitHub login failed, please try again',
  github_no_email: 'No verified email found on your GitHub account',
};

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const tempCode = searchParams.get('temp_code');
  const provider = searchParams.get('provider') ?? 'github';

  const resolveErrorMessage = () => {
    if (errorParam) {
      return ERROR_MESSAGES[errorParam] ?? 'Login failed, please try again';
    }
    if (!tempCode) return 'Invalid access code';
    return '';
  };

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() =>
    errorParam || !tempCode ? 'error' : 'loading'
  );
  const [errorMessage, setErrorMessage] = useState(resolveErrorMessage);

  useEffect(() => {
    if (errorParam || !tempCode) return;

    let isSubscribed = true;

    async function exchangeCode() {
      try {
        // Call the correct exchange endpoint based on the OAuth provider
        const data =
          provider === 'google'
            ? await authService.googleExchange(tempCode!)
            : await authService.githubExchange(tempCode!);

        if (!isSubscribed) return;

        if (data.access_token && data.refresh_token) {
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('refreshToken', data.refresh_token);
          setStatus('success');
          // Hard-navigate so AuthContext re-hydrates from localStorage
          globalThis.window.location.href = '/';
        } else {
          throw new Error('Tokens not returned');
        }
      } catch (err) {
        if (!isSubscribed) return;
        console.error('OAuth exchange error:', err);
        setStatus('error');
        setErrorMessage('Login failed, please try again');
      }
    }

    exchangeCode();
    return () => {
      isSubscribed = false;
    };
  }, [tempCode, errorParam, provider]);

  const providerLabel = provider === 'google' ? 'Google' : 'GitHub';

  if (status === 'loading') {
    return (
      <Card variant="notebook" className="w-full max-w-xl bg-white shadow-xl">
        <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
            <svg
              className="text-granite h-12 w-12 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-granite mb-2 font-['Caveat',_cursive] text-3xl font-bold">
            Scribbling credentials...
          </h2>
          <p className="text-gunmetal/60 text-sm font-medium tracking-wider uppercase">
            Exchanging secure keys with {providerLabel}
          </p>
        </div>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card variant="notebook" className="w-full max-w-xl bg-white shadow-xl">
        <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 animate-bounce text-5xl select-none">✏️</div>
          <h2 className="text-granite mb-2 font-['Caveat',_cursive] text-3xl font-bold">
            Workspace verified!
          </h2>
          <p className="text-gunmetal/60 text-sm font-medium tracking-wider uppercase">
            Loading your personal sketchbook...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="notebook" className="w-full max-w-xl bg-white shadow-xl">
      <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-5xl select-none">⚠️</div>
        <h2 className="mb-2 font-['Caveat',_cursive] text-3xl font-bold text-red-600">
          Authentication Error
        </h2>
        <p className="text-gunmetal mb-6 font-['Patrick_Hand',_cursive] text-base">
          {errorMessage}
        </p>
        <Button
          onClick={() => router.push('/auth')}
          colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
          className="px-6 py-2 text-sm font-semibold"
        >
          Try Again
        </Button>
      </div>
    </Card>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <Badge
            size="lg"
            colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
            typography={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'Caveat, cursive' }}
          >
            BrainRot
          </Badge>
        </div>
        <Suspense
          fallback={
            <Card variant="notebook" className="w-full max-w-xl bg-white shadow-xl">
              <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <h2 className="text-granite mb-2 font-['Caveat',_cursive] text-3xl font-bold">
                  Preparing page...
                </h2>
              </div>
            </Card>
          }
        >
          <OAuthCallbackHandler />
        </Suspense>
      </main>
    </div>
  );
}
