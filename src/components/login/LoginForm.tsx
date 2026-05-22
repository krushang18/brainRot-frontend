'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from 'sketchbook-ui';
import SocialAuthButtons from '../auth/SocialAuthButtons';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import OTPVerification from './OTPVerification';

interface LoginFormProps {
  onToggle?: () => void;
}

const initialState = {
  email: '',
  password: '',
};

export default function LoginForm({ onToggle }: Readonly<LoginFormProps>) {
  const { login, verifyOtp } = useAuth();
  const router = useRouter();
  const [showOtp, setShowOtp] = useState(false);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

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
    if (!values.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const { formData, errors, isLoading, handleChange, handleSubmit } = useAuthForm({
    initialState,
    validate,
    onSubmit: async (values) => {
      const { otpRequired, deviceId: returnedDeviceId } = await login(
        values.email,
        values.password
      );
      if (otpRequired) {
        setDeviceId(returnedDeviceId);
        setShowOtp(true);
      } else {
        router.push('/');
      }
    },
  });

  if (showOtp) {
    return (
      <OTPVerification
        email={formData.email}
        onSuccess={() => {
          router.push('/');
        }}
        onBack={() => {
          setDeviceId(undefined);
          setShowOtp(false);
        }}
        onSubmitOtp={async (otp) => {
          await verifyOtp(formData.email, otp, deviceId);
        }}
        onResendOtp={async () => {
          await authService.resendOtp({ email: formData.email, device_id: deviceId });
        }}
      />
    );
  }

  return (
    <Card variant="notebook" className="w-full max-w-3xl bg-white shadow-xl">
      <div className="p-8">
        <div className="mx-auto w-full max-w-xl">
          {/* Sliding Tabs Switcher */}
          <div className="bg-alabaster-grey border-dust-grey/30 mb-8 flex rounded-xl border p-1">
            <button
              type="button"
              className="text-granite flex-1 rounded-lg bg-white py-2.5 text-center text-lg font-semibold shadow-sm transition-all"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="text-ash-grey hover:text-gunmetal flex-1 cursor-pointer rounded-lg py-2.5 text-center text-lg font-semibold transition-all"
            >
              Sign Up
            </button>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-granite mb-2 text-4xl font-bold">Welcome Back</h2>
            <p className="text-gunmetal text-lg font-medium">Log in to your BrainRot account</p>
          </div>

          {errors.form && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-base text-red-600">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="mb-1 ml-1 block text-lg font-semibold" htmlFor="email">
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

            <div>
              <div className="mb-1 ml-1 flex items-center justify-between">
                <label className="text-lg font-semibold" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-granite text-base font-semibold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
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
                <div className="mt-1">
                  <p className="text-base text-red-500">{errors.password}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <Button type="submit" data-testid="submit-button" disabled={isLoading}>
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
                  'Log In'
                )}
              </Button>
            </div>
          </form>

          <SocialAuthButtons />
        </div>
      </div>
      <div className="bg-alabaster-grey/30 border-dust-grey/30 border-t py-4 text-center">
        <p className="text-lg">
          Don&apos;t have an account?{' '}
          {onToggle ? (
            <button
              type="button"
              onClick={onToggle}
              className="text-granite cursor-pointer font-semibold transition-colors hover:text-[#34412f]"
            >
              Sign up
            </button>
          ) : (
            <Link
              href="/auth"
              className="text-granite font-semibold transition-colors hover:text-[#34412f]"
            >
              Sign up
            </Link>
          )}
        </p>
      </div>
    </Card>
  );
}
