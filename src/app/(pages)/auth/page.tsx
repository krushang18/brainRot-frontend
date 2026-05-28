'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from 'sketchbook-ui';
import LoginForm from '@/components/login/LoginForm';
import SignupForm from '@/components/signup/SignupForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4 md:p-8">
      <main
        className={`w-full transition-all duration-300 ease-in-out ${isLogin ? 'max-w-lg' : 'max-w-3xl'}`}
      >
        <div className="mb-8 flex justify-center">
          <Link href="/" className="cursor-pointer transition-transform hover:scale-105">
            <Badge
              size="lg"
              colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
              typography={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                fontFamily: 'Caveat, cursive',
              }}
            >
              BrainRot
            </Badge>
          </Link>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {isLogin ? <LoginForm onToggle={handleToggle} /> : <SignupForm onToggle={handleToggle} />}
        </div>
      </main>
    </div>
  );
}
