'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Input, Button } from 'sketchbook-ui';
import { useAuthForm } from '@/hooks/useAuthForm';

const initialState = {
  password: '',
  confirmPassword: '',
};

function ResetPasswordFormContent() {
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const validate = (values: typeof initialState) => {
    const newErrors: Record<string, string> = {};

    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(values.password) && !/[!@#$%^&*(),.?":{}|<>]/.test(values.password)) {
      newErrors.password = 'Password must contain at least one number or special character';
    }

    if (!values.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (values.confirmPassword !== values.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const { formData, errors, isLoading, handleChange, handleSubmit } = useAuthForm({
    initialState,
    validate,
    onSubmit: async () => {
      // Simulate API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Password reset successful with token:', token);
      setIsSuccess(true);
    },
  });

  return (
    <Card variant="notebook" className="w-full max-w-xl bg-white shadow-xl">
      <div className="p-8">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-8 text-center">
            <h2 className="text-granite mb-2 font-['Caveat',_cursive] text-4xl font-bold tracking-wide">
              Choose New Password
            </h2>
            {!isSuccess && (
              <p className="text-gunmetal text-lg font-medium">
                Enter and confirm your new credentials below
              </p>
            )}
          </div>

          {errors.form && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-base text-red-600">
              {errors.form}
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6">
              {/* Hand-drawn wobbly success alert box */}
              <div
                data-testid="success-alert"
                className="border-granite bg-alabaster-grey/20 rounded-xl border-2 p-6 text-center shadow-[4px_4px_0px_0px_rgba(71,88,65,0.4)]"
              >
                <p className="text-gunmetal text-lg leading-relaxed font-semibold">
                  Password updated successfully! You can now log in with your new credentials.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <Link href="/auth">
                  <Button
                    type="button"
                    colors={{
                      bg: '#fff',
                      stroke: 'var(--granite)',
                      text: 'var(--granite)',
                    }}
                  >
                    Go to Log In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label
                  className="text-gunmetal mb-1 ml-1 block text-lg font-semibold"
                  htmlFor="password"
                >
                  New Password
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  size="lg"
                  className="w-full"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  colors={{
                    stroke: errors.password ? '#ef4444' : undefined,
                  }}
                />
                {errors.password && (
                  <p className="mt-1 text-base text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  className="text-gunmetal mb-1 ml-1 block text-lg font-semibold"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  size="lg"
                  className="w-full"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  colors={{
                    stroke: errors.confirmPassword ? '#ef4444' : undefined,
                  }}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-base text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Secure Token display (purely for QA/Verification) */}
              <input type="hidden" name="token" value={token} data-testid="token-input" />

              <div className="flex justify-center pt-2">
                <Button type="submit" data-testid="submit-button" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        data-testid="loading-spinner"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="bg-alabaster-grey/30 border-dust-grey/30 border-t py-4 text-center">
        <Link
          href="/auth"
          className="text-granite inline-flex items-center gap-1.5 text-base font-semibold transition-colors hover:text-[#34412f]"
        >
          <span>←</span> Back to Log In
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
