'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Input, Button } from 'sketchbook-ui';
import { useAuthForm } from '@/hooks/useAuthForm';

const initialState = {
  email: '',
};

export default function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validate = (values: typeof initialState) => {
    const newErrors: Record<string, string> = {};
    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (
      values.email.length > 254 ||
      !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(values.email)
    ) {
      newErrors.email = 'Invalid email format';
    }
    return newErrors;
  };

  const { formData, errors, isLoading, handleChange, handleSubmit } = useAuthForm({
    initialState,
    validate,
    onSubmit: async (values) => {
      // Simulate API call to dispatch reset email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Password reset requested for:', values.email);
      setSubmittedEmail(values.email);
      setIsSuccess(true);
    },
  });

  return (
    <Card variant="notebook" className="w-full max-w-xl bg-white shadow-xl">
      <div className="p-8">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-8 text-center">
            <h2 className="text-granite mb-2 font-['Caveat',_cursive] text-4xl font-bold tracking-wide">
              Reset Password
            </h2>
            {!isSuccess && (
              <p className="text-gunmetal text-lg font-medium">
                Enter your email address to receive a password reset link
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
                  Check your inbox! A reset link has been dispatched to{' '}
                  <span className="text-granite font-bold break-all underline">
                    {submittedEmail}
                  </span>
                  .
                </p>
              </div>

              <div className="pt-2 text-center">
                <p className="text-gunmetal mb-4 text-base font-medium">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    colors={{
                      bg: '#0a0a0aff',
                      stroke: 'var(--granite)',
                      text: 'var(--granite)',
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label
                  className="text-gunmetal mb-1 ml-1 block text-lg font-semibold"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  size="lg"
                  className="w-full"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  colors={{
                    stroke: errors.email ? '#ef4444' : undefined,
                  }}
                />
                {errors.email && <p className="mt-1 text-base text-red-500">{errors.email}</p>}
              </div>

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
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
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
