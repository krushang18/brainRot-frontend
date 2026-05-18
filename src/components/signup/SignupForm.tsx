'use client';

import React from 'react';
import Link from 'next/link';
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

export default function SignupForm({ onToggle }: SignupFormProps) {
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
    <div className="text-gunmetal w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
      <div className="p-8">
        {/* Sliding Tabs Switcher */}
        <div className="bg-alabaster-grey border-dust-grey/30 mb-8 flex rounded-xl border p-1">
          <button
            type="button"
            onClick={onToggle}
            className="text-ash-grey hover:text-gunmetal flex-1 cursor-pointer rounded-lg py-2.5 text-center text-sm font-semibold transition-all"
          >
            Log In
          </button>
          <button
            type="button"
            className="text-granite flex-1 rounded-lg bg-white py-2.5 text-center text-sm font-semibold shadow-sm transition-all"
          >
            Sign Up
          </button>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-granite mb-2 text-3xl font-bold">Create an account</h2>
          <p className="text-ash-grey font-medium">Join us today! It only takes a minute.</p>
        </div>

        {errors.form && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
                errors.name
                  ? 'border-red-500 bg-red-50 focus:ring-red-200'
                  : 'border-dust-grey focus:border-granite focus:ring-ash-grey/30 bg-alabaster-grey/50'
              }`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
                errors.email
                  ? 'border-red-500 bg-red-50 focus:ring-red-200'
                  : 'border-dust-grey focus:border-granite focus:ring-ash-grey/30 bg-alabaster-grey/50'
              }`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
                errors.password
                  ? 'border-red-500 bg-red-50 focus:ring-red-200'
                  : 'border-dust-grey focus:border-granite focus:ring-ash-grey/30 bg-alabaster-grey/50'
              }`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none ${
                errors.confirmPassword
                  ? 'border-red-500 bg-red-50 focus:ring-red-200'
                  : 'border-dust-grey focus:border-granite focus:ring-ash-grey/30 bg-alabaster-grey/50'
              }`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            data-testid="submit-button"
            disabled={isLoading}
            className="bg-granite flex w-full items-center justify-center rounded-lg px-4 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#34412f] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
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
              'Create Account'
            )}
          </button>
        </form>
        <SocialAuthButtons />
      </div>
      <div className="bg-alabaster-grey/30 border-dust-grey/30 border-t py-4 text-center">
        <p className="text-sm">
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
              href="/login"
              className="text-granite font-semibold transition-colors hover:text-[#34412f]"
            >
              Log in
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
