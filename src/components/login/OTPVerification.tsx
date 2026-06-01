'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input } from 'sketchbook-ui';
import { SubmitButton } from '../auth/SubmitButton';

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  onSubmitOtp: (otp: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
}

export default function OTPVerification({
  email,
  onSuccess,
  onBack,
  onSubmitOtp,
  onResendOtp,
}: Readonly<OTPVerificationProps>) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await onSubmitOtp(otp);
      setSuccessMessage('Device verified successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Invalid or expired OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await onResendOtp();
      setSuccessMessage('A fresh verification code has been dispatched to your email.');
      setResendCooldown(60); // 60s cooldown timer
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Could not resend OTP. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Keep only numeric characters and restrict length to 6
    const numericVal = rawVal.replaceAll(/\D/g, '').slice(0, 6);
    setOtp(numericVal);
    if (error) setError('');
  };

  return (
    <Card variant="notebook" className="w-full max-w-xl bg-white shadow-xl">
      <div className="p-8">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-6 text-center">
            {/* Hand-drawn sketchbook style cursive title */}
            <h2 className="text-granite mb-2 font-['Caveat',_cursive] text-4xl font-bold tracking-wide">
              Device Verification
            </h2>
            <p className="text-gunmetal text-lg font-medium">
              A signup or login attempt from a new device was requested.
            </p>
          </div>

          {/* Alert Notification System */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-base font-semibold text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-base font-semibold text-green-600">
              {successMessage}
            </div>
          )}

          {/* Description box using wobbly border shadow */}
          <div className="border-granite bg-alabaster-grey/20 mb-8 rounded-xl border-2 p-5 text-center shadow-[4px_4px_0px_0px_rgba(71,88,65,0.4)]">
            <p className="text-gunmetal text-base leading-relaxed font-semibold">
              Enter the 6-digit OTP code sent to:{' '}
              <span className="text-granite font-bold break-all underline">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6" noValidate>
            <div>
              <label
                className="text-gunmetal mb-2 block text-center text-lg font-semibold"
                htmlFor="otp"
              >
                Verification Code
              </label>
              <Input
                type="text"
                id="otp"
                name="otp"
                size="lg"
                className="w-full text-center text-3xl font-bold tracking-[0.5em] placeholder:text-lg placeholder:font-normal placeholder:tracking-normal"
                value={otp}
                onChange={handleOtpChange}
                placeholder="••••••"
                disabled={isLoading}
                colors={{
                  stroke: error ? '#ef4444' : undefined,
                }}
              />
            </div>

            <div className="flex justify-center pt-2">
              <SubmitButton isLoading={isLoading} disabled={otp.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify Device'}
              </SubmitButton>
            </div>
          </form>
        </div>
      </div>

      {/* Sketchbook back-row action panel */}
      <div className="bg-alabaster-grey/30 border-dust-grey/30 flex w-full items-center justify-between border-t px-8 py-4 text-base">
        <button
          type="button"
          onClick={onBack}
          className="text-ash-grey inline-flex cursor-pointer items-center gap-1.5 font-semibold transition-colors hover:text-[#34412f]"
        >
          <span>←</span> Back to Login
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          className={`cursor-pointer font-semibold transition-colors ${
            resendCooldown > 0
              ? 'text-ash-grey cursor-not-allowed'
              : 'text-granite underline hover:text-[#34412f]'
          }`}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </button>
      </div>
    </Card>
  );
}
