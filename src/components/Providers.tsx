'use client';

import React from 'react';
import { SketchProvider } from 'sketchbook-ui';

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SketchProvider>{children}</SketchProvider>;
}
