import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OTPVerification from './OTPVerification';

describe('OTPVerification', () => {
  const defaultProps = {
    email: 'test@example.com',
    onSuccess: vi.fn(),
    onBack: vi.fn(),
    onSubmitOtp: vi.fn().mockImplementation(() => Promise.resolve()),
    onResendOtp: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct sketchbook details and email', () => {
    render(<OTPVerification {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /device verification/i })).toBeInTheDocument();
    expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify device/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend code/i })).toBeInTheDocument();
  });

  it('restricts input to numbers only and a max length of 6', async () => {
    render(<OTPVerification {...defaultProps} />);
    const user = userEvent.setup();
    const otpInput = screen.getByPlaceholderText('••••••') as HTMLInputElement;

    // Type non-numeric characters and extra digits
    await user.type(otpInput, 'abc123456789');
    expect(otpInput.value).toBe('123456');
  });

  it('validates incomplete OTP length on submit', () => {
    render(<OTPVerification {...defaultProps} />);
    const otpInput = screen.getByPlaceholderText('••••••');

    // Set short OTP value
    fireEvent.change(otpInput, { target: { value: '1234' } });

    // Submit the form directly since the submit button is disabled when otp.length !== 6
    const form = otpInput.closest('form')!;
    fireEvent.submit(form);

    expect(
      screen.getByText(/please enter the complete 6-digit verification code/i)
    ).toBeInTheDocument();
    expect(defaultProps.onSubmitOtp).not.toHaveBeenCalled();
  });

  it('submits successfully with 6-digit OTP code and triggers onSuccess', async () => {
    render(<OTPVerification {...defaultProps} />);
    const user = userEvent.setup();
    const otpInput = screen.getByPlaceholderText('••••••');

    await user.type(otpInput, '654321');
    fireEvent.click(screen.getByRole('button', { name: /verify device/i }));

    // Buttons should show loading state/be disabled
    expect(screen.getByRole('button', { name: /verifying\.\.\./i })).toBeDisabled();

    await waitFor(() => {
      expect(defaultProps.onSubmitOtp).toHaveBeenCalledWith('654321');
      expect(screen.getByText(/device verified successfully!/i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      },
      { timeout: 1500 }
    );
  });

  it('displays API error message on submission failure', async () => {
    const errorProps = {
      ...defaultProps,
      onSubmitOtp: vi
        .fn()
        .mockImplementation(() => Promise.reject(new Error('Invalid verification code'))),
    };
    render(<OTPVerification {...errorProps} />);
    const user = userEvent.setup();
    const otpInput = screen.getByPlaceholderText('••••••');

    await user.type(otpInput, '000000');
    fireEvent.click(screen.getByRole('button', { name: /verify device/i }));

    expect(await screen.findByText(/invalid verification code/i)).toBeInTheDocument();
    expect(errorProps.onSuccess).not.toHaveBeenCalled();
  });

  it('triggers resend OTP with cooldown and shows success message', async () => {
    render(<OTPVerification {...defaultProps} />);

    const resendBtn = screen.getByRole('button', { name: /resend code/i });
    fireEvent.click(resendBtn);

    expect(defaultProps.onResendOtp).toHaveBeenCalled();
    expect(
      await screen.findByText(/a fresh verification code has been dispatched to your email/i)
    ).toBeInTheDocument();

    // Verify button shows cooldown state and is disabled
    expect(screen.getByRole('button', { name: /resend in 60s/i })).toBeDisabled();
  });

  it('displays API error message on submission failure when error is not an instance of Error', async () => {
    const errorProps = {
      ...defaultProps,
      onSubmitOtp: vi
        .fn()
        .mockImplementation(() => Promise.reject('Generic non-error object rejection')),
    };
    render(<OTPVerification {...errorProps} />);
    const user = userEvent.setup();
    const otpInput = screen.getByPlaceholderText('••••••');

    await user.type(otpInput, '000000');
    fireEvent.click(screen.getByRole('button', { name: /verify device/i }));

    expect(
      await screen.findByText(/invalid or expired otp\. please try again\./i)
    ).toBeInTheDocument();
    expect(errorProps.onSuccess).not.toHaveBeenCalled();
  });

  it('displays error message on resend OTP failure', async () => {
    const errorProps = {
      ...defaultProps,
      onResendOtp: vi
        .fn()
        .mockImplementation(() => Promise.reject(new Error('Failed to send verification email'))),
    };
    render(<OTPVerification {...errorProps} />);

    const resendBtn = screen.getByRole('button', { name: /resend code/i });
    fireEvent.click(resendBtn);

    expect(errorProps.onResendOtp).toHaveBeenCalled();
    expect(await screen.findByText(/failed to send verification email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend code/i })).not.toHaveTextContent(
      /resend in/i
    );
  });

  it('displays fallback error message on resend OTP failure when error is not an instance of Error', async () => {
    const errorProps = {
      ...defaultProps,
      onResendOtp: vi.fn().mockImplementation(() => Promise.reject('Raw string failure')),
    };
    render(<OTPVerification {...errorProps} />);

    const resendBtn = screen.getByRole('button', { name: /resend code/i });
    fireEvent.click(resendBtn);

    expect(errorProps.onResendOtp).toHaveBeenCalled();
    expect(
      await screen.findByText(/could not resend otp\. please try again later\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend code/i })).not.toHaveTextContent(
      /resend in/i
    );
  });

  it('triggers onBack callback when clicking back to login link', () => {
    render(<OTPVerification {...defaultProps} />);

    const backBtn = screen.getByRole('button', { name: /back to login/i });
    fireEvent.click(backBtn);

    expect(defaultProps.onBack).toHaveBeenCalled();
  });
});
