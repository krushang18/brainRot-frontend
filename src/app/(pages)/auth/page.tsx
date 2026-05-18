'use client';

import React, { useState } from 'react';
import LoginForm from '@/components/login/LoginForm';
import SignupForm from '@/components/signup/SignupForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
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
