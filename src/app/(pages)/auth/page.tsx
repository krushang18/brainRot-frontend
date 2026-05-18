'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginForm from '@/components/login/LoginForm';
import SignupForm from '@/components/signup/SignupForm';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state once on mount from URL query param
  const [isLogin, setIsLogin] = useState(() => {
    return searchParams.get('mode') !== 'signup';
  });

  const handleToggle = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    // Dynamically update URL without reloading
    router.replace(`/auth?mode=${newIsLogin ? 'login' : 'signup'}`);
  };

  return (
    <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="bg-granite flex h-12 items-center justify-center rounded-xl px-5 shadow-lg">
            <span className="text-xl font-bold tracking-wide text-white">BrainRot</span>
          </div>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {isLogin ? <LoginForm onToggle={handleToggle} /> : <SignupForm onToggle={handleToggle} />}
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4">
          <div className="border-granite h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
