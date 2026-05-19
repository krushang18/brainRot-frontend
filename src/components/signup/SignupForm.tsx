'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Input, Button } from 'sketchbook-ui';
import SocialAuthButtons from '../auth/SocialAuthButtons';
import { useAuthForm } from '@/hooks/useAuthForm';

interface SignupFormProps {
  onToggle?: () => void;
}

const initialState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function SignupForm({ onToggle }: Readonly<SignupFormProps>) {
  const validate = (values: typeof initialState) => {
    const newErrors: Record<string, string> = {};
    if (!values.name.trim()) newErrors.name = 'Name is required';
    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (
      values.email.length > 254 ||
      !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(values.email)
    ) {
      newErrors.email = 'Invalid email format';
    }
    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (values.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const { formData, errors, isLoading, handleChange, handleSubmit } = useAuthForm({
    initialState,
    validate,
    onSubmit: async (values) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Signup data:', values);
    },
  });

  return (
    <Card variant="notebook" className="w-full max-w-lg bg-white shadow-xl">
      <div className="p-8">
        {/* Sliding Tabs Switcher */}
        <div className="bg-alabaster-grey border-dust-grey/30 mb-8 flex rounded-xl border p-1">
          <button
            type="button"
            onClick={onToggle}
            className="text-ash-grey hover:text-gunmetal flex-1 cursor-pointer rounded-lg py-2.5 text-center text-lg font-semibold transition-all"
          >
            Log In
          </button>
          <button
            type="button"
            className="text-granite flex-1 rounded-lg bg-white py-2.5 text-center text-lg font-semibold shadow-sm transition-all"
          >
            Sign Up
          </button>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-granite mb-2 text-4xl font-bold">Create an account</h2>
          <p className="text-ash-grey text-lg font-medium">
            Join us today! It only takes a minute.
          </p>
        </div>

        {errors.form && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-base text-red-600">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="mb-1 ml-1 block text-lg font-semibold" htmlFor="name">
              Full Name
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              size="lg"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              colors={{
                stroke: errors.name ? '#ef4444' : undefined,
              }}
            />
            {errors.name && <p className="mt-1 text-base text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 ml-1 block text-lg font-semibold" htmlFor="email">
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              size="lg"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              colors={{
                stroke: errors.email ? '#ef4444' : undefined,
              }}
            />
            {errors.email && <p className="mt-1 text-base text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 ml-1 block text-lg font-semibold" htmlFor="password">
              Password
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              size="lg"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              colors={{
                stroke: errors.password ? '#ef4444' : undefined,
              }}
            />
            {errors.password && <p className="mt-1 text-base text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-1 ml-1 block text-lg font-semibold" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              size="lg"
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

          <Button
            type="submit"
            data-testid="submit-button"
            disabled={isLoading}
            className="flex w-full items-center justify-center"
          >
            {isLoading ? (
              <svg
                className="h-5 w-5 animate-spin text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
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
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
        <SocialAuthButtons />
      </div>
      <div className="bg-alabaster-grey/30 border-dust-grey/30 border-t py-4 text-center">
        <p className="text-lg">
          Already have an account?{' '}
          {onToggle ? (
            <button
              type="button"
              onClick={onToggle}
              className="text-granite cursor-pointer font-semibold transition-colors hover:text-[#34412f]"
            >
              Log in
            </button>
          ) : (
            <Link
              href="/auth"
              className="text-granite font-semibold transition-colors hover:text-[#34412f]"
            >
              Log in
            </Link>
          )}
        </p>
      </div>
    </Card>
  );
}
