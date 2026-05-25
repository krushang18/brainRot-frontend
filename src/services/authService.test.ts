import { describe, it, expect, vi } from 'vitest';
import { authService } from './authService';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService', () => {
  it('calls signup endpoint correctly', async () => {
    const signupData = {
      full_name: 'Test User',
      email: 'test@brainrot.com',
      password: 'Password123!',
      confirm_password: 'Password123!',
    };
    const mockResponse = { data: { otp_required: false } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.signup(signupData);
    expect(api.post).toHaveBeenCalledWith('/auth/signup', signupData);
    expect(result).toEqual(mockResponse.data);
  });

  it('calls login endpoint correctly', async () => {
    const loginData = {
      email: 'test@brainrot.com',
      password: 'Password123!',
    };
    const mockResponse = { data: { otp_required: true } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.login(loginData);
    expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
    expect(result).toEqual(mockResponse.data);
  });

  it('calls verifyOtp endpoint correctly', async () => {
    const otpData = {
      email: 'test@brainrot.com',
      otp: '123456',
      device_id: 'dev123',
    };
    const mockResponse = { data: { access_token: 'token123' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.verifyOtp(otpData);
    expect(api.post).toHaveBeenCalledWith('/auth/verify-otp', otpData);
    expect(result).toEqual(mockResponse.data);
  });

  it('calls resendOtp endpoint correctly', async () => {
    const resendData = {
      email: 'test@brainrot.com',
      device_id: 'dev123',
    };
    const mockResponse = { data: { message: 'OTP sent' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.resendOtp(resendData);
    expect(api.post).toHaveBeenCalledWith('/auth/resend-otp', resendData);
    expect(result).toEqual(mockResponse.data);
  });

  it('calls forgotPassword endpoint correctly', async () => {
    const forgotData = { email: 'test@brainrot.com' };
    const mockResponse = { data: { message: 'Link sent' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.forgotPassword(forgotData);
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', forgotData);
    expect(result).toEqual(mockResponse.data);
  });

  it('calls resetPassword endpoint correctly', async () => {
    const resetData = {
      token: 'tok123',
      new_password: 'Pass123!',
      confirm_password: 'Pass123!',
    };
    const mockResponse = { data: { message: 'Reset done' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.resetPassword(resetData);
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
    expect(result).toEqual(mockResponse.data);
  });

  it('calls changePassword endpoint correctly', async () => {
    const changeData = {
      current_password: 'OldPass123!',
      new_password: 'NewPass123!',
      confirm_password: 'NewPass123!',
    };
    const mockResponse = { data: { message: 'Password changed' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.changePassword(changeData);
    expect(api.post).toHaveBeenCalledWith('/auth/change-password', changeData);
    expect(result).toEqual(mockResponse.data);
  });

  it('calls logout endpoint correctly', async () => {
    const mockResponse = { data: { message: 'Logged out' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await authService.logout('ref123');
    expect(api.post).toHaveBeenCalledWith('/auth/logout', { refresh_token: 'ref123' });
    expect(result).toEqual(mockResponse.data);
  });

  it('calls listDevices endpoint correctly', async () => {
    const mockResponse = { data: [{ device_id: 'dev1' }] };
    vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

    const result = await authService.listDevices();
    expect(api.get).toHaveBeenCalledWith('/auth/devices');
    expect(result).toEqual(mockResponse.data);
  });

  it('calls revokeDevice endpoint correctly', async () => {
    const mockResponse = { data: { message: 'Device revoked' } };
    vi.mocked(api.delete).mockResolvedValueOnce(mockResponse);

    const result = await authService.revokeDevice('dev1');
    expect(api.delete).toHaveBeenCalledWith('/auth/devices/dev1');
    expect(result).toEqual(mockResponse.data);
  });

  it('calls revokeAllDevices endpoint correctly', async () => {
    const mockResponse = { data: { message: 'All devices revoked' } };
    vi.mocked(api.delete).mockResolvedValueOnce(mockResponse);

    const result = await authService.revokeAllDevices();
    expect(api.delete).toHaveBeenCalledWith('/auth/devices');
    expect(result).toEqual(mockResponse.data);
  });
});
