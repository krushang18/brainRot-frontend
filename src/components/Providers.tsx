'use client';

import React from 'react';
import { SketchProvider } from 'sketchbook-ui';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SketchProvider>
      <AuthProvider>{children}</AuthProvider>
    </SketchProvider>
  );
}
