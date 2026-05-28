'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from 'sketchbook-ui';
import ForgotPasswordForm from '@/components/forgot-password/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-xl transition-all duration-300 ease-in-out">
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
          <ForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
