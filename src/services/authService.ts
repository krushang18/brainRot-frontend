import api from '@/lib/api';
import {
  SignupRequest,
  LoginRequest,
  LoginResponse,
  VerifyOTPRequest,
  ResendOTPRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  MessageResponse,
  DeviceDetails,
} from '@/types/auth';

export const authService = {
  /**
   * User Signup
   */
  async signup(data: SignupRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/signup', data);
    return response.data;
  },

  /**
   * User Login (Credential verification)
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * OTP Verification for Untrusted Devices
   */
  async verifyOtp(data: VerifyOTPRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/verify-otp', data);
    return response.data;
  },

  /**
   * Resend OTP verification email
   */
  async resendOtp(data: ResendOTPRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/resend-otp', data);
    return response.data;
  },

  /**
   * Request password reset token link
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Set new password using email token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/reset-password', data);
    return response.data;
  },

  /**
   * Authenticated user password update
   */
  async changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/change-password', data);
    return response.data;
  },

  /**
   * Terminate active refresh token session
   */
  async logout(refreshToken: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/logout', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * List all currently trusted devices
   */
  async listDevices(): Promise<DeviceDetails[]> {
    const response = await api.get<DeviceDetails[]>('/auth/devices');
    return response.data;
  },

  /**
   * Revoke a specific trusted device
   */
  async revokeDevice(deviceId: string): Promise<MessageResponse> {
    const response = await api.delete<MessageResponse>(`/auth/devices/${deviceId}`);
    return response.data;
  },

  /**
   * Revoke all trusted devices and clear sessions
   */
  async revokeAllDevices(): Promise<MessageResponse> {
    const response = await api.delete<MessageResponse>('/auth/devices');
    return response.data;
  },
};
