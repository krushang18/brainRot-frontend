'use client';

import React from 'react';
import { Badge } from 'sketchbook-ui';
import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-xl transition-all duration-300 ease-in-out">
        <div className="mb-8 flex justify-center">
          <Badge
            size="lg"
            colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
            typography={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'Caveat, cursive' }}
          >
            BrainRot
          </Badge>
        </div>

        <div className="transition-all duration-300 ease-in-out">
          <ResetPasswordForm />
        </div>
      </main>
    </div>
  );
}
