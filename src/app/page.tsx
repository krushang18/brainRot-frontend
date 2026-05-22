'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/settings');
      } else {
        router.push('/auth');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="border-granite h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="text-gunmetal mt-4 font-['Caveat',_cursive] text-xl font-bold">
          Redirecting...
        </p>
      </div>
    </div>
  );
}
