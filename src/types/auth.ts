export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  otp_required: boolean;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  device_id?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  device_id?: string;
}

export interface ResendOTPRequest {
  email: string;
  device_id?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface MessageResponse {
  message: string;
}

export interface DeviceDetails {
  device_id: string;
  device_name: string;
  last_used: string;
  ip_address?: string;
}

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
}

export interface UserProfileResponse {
  id: string;
  full_name: string;
  email: string;
}
