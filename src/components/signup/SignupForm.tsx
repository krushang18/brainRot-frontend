'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Input } from 'sketchbook-ui';
import { SubmitButton } from '../auth/SubmitButton';
import SocialAuthButtons from '../auth/SocialAuthButtons';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuth } from '@/hooks/useAuth';

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
  const { signup } = useAuth();
  const router = useRouter();

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
    } else if (values.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(
        values.password
      )
    ) {
      newErrors.password =
        'Password must contain uppercase, lowercase, number, and special character';
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
      await signup(values.name, values.email, values.password, values.confirmPassword);
      router.push('/');
    },
  });

  return (
    <Card variant="notebook" className="w-full max-w-3xl bg-white shadow-xl">
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
          <p className="text-gunmetal text-lg font-medium">
            Join us today! It only takes a minute.
          </p>
        </div>

        {errors.form && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-base text-red-600">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <div>
              <label className="mb-1 ml-1 block text-lg font-semibold" htmlFor="name">
                Full Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                size="md"
                className="w-full"
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
                size="md"
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

            <div>
              <label className="mb-1 ml-1 block text-lg font-semibold" htmlFor="password">
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                size="md"
                className="w-full"
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
                size="md"
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
          </div>

          <div className="flex justify-center pt-2">
            <SubmitButton isLoading={isLoading}>Sign Up</SubmitButton>
          </div>
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
