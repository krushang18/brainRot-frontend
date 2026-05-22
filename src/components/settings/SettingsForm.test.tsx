import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsForm from './SettingsForm';
import { authService } from '@/services/authService';

// Mock navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Auth Context hook
const mockLogout = vi.fn();
const mockAuth = {
  user: {
    id: '60d5ec493d8b3c299c2d1b8c',
    email: 'yapper@brainrot.com',
    fullName: 'Yapper Supreme',
  },
  isAuthenticated: true,
  isLoading: false,
  logout: mockLogout,
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

// Mock active devices
const mockDevices = [
  {
    device_id: 'current-device-id',
    device_name: 'Chrome on Linux',
    last_used: '2026-05-22T10:00:00.000Z',
    ip_address: '192.168.1.1',
  },
  {
    device_id: 'other-device-id',
    device_name: 'Safari on iPhone',
    last_used: '2026-05-22T09:30:00.000Z',
    ip_address: '10.0.0.5',
  },
];

const mockListDevices = vi.fn().mockResolvedValue(mockDevices);
const mockRevokeDevice = vi.fn().mockResolvedValue({ message: 'Device revoked' });
const mockRevokeAllDevices = vi.fn().mockResolvedValue({ message: 'All devices revoked' });

// Mock authService APIs
vi.mock('@/services/authService', () => ({
  authService: {
    changePassword: vi.fn(),
    listDevices: () => mockListDevices(),
    revokeDevice: (id: string) => mockRevokeDevice(id),
    revokeAllDevices: () => mockRevokeAllDevices(),
  },
}));

// Helper to mock jwt token in localStorage
const setMockToken = (did: string) => {
  const payload = {
    sub: '60d5ec493d8b3c299c2d1b8c',
    email: 'yapper@brainrot.com',
    fullName: 'Yapper Supreme',
    did,
  };
  const encodedPayload = btoa(JSON.stringify(payload));
  const mockToken = `header.${encodedPayload}.signature`;
  localStorage.setItem('accessToken', mockToken);
};

describe('SettingsForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockAuth.user = {
      id: '60d5ec493d8b3c299c2d1b8c',
      email: 'yapper@brainrot.com',
      fullName: 'Yapper Supreme',
    };
    mockAuth.isAuthenticated = true;
    mockAuth.isLoading = false;

    // Set default mocks
    mockListDevices.mockResolvedValue(mockDevices);
    mockRevokeDevice.mockResolvedValue({ message: 'Device revoked' });
    mockRevokeAllDevices.mockResolvedValue({ message: 'All devices revoked' });
    setMockToken('current-device-id');
  });

  it('renders loading state when isLoading is true', () => {
    mockAuth.isLoading = true;
    render(<SettingsForm />);
    expect(screen.getByText(/loading sketchbook/i)).toBeInTheDocument();
  });

  it('redirects to /auth when user is not authenticated', () => {
    mockAuth.isAuthenticated = false;
    render(<SettingsForm />);
    expect(mockPush).toHaveBeenCalledWith('/auth');
  });

  it('renders profile details and change password card when authenticated', async () => {
    render(<SettingsForm />);

    // Header & Title
    expect(screen.getByRole('heading', { name: /user settings/i })).toBeInTheDocument();
    expect(screen.getAllByText(/BrainRot/)[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();

    // Profile card
    expect(screen.getByText('Y')).toBeInTheDocument();
    expect(screen.getByText('Yapper Supreme')).toBeInTheDocument();
    expect(screen.getByText('yapper@brainrot.com')).toBeInTheDocument();
    expect(screen.getByText('60d5ec493d8b3c299c2d1b8c')).toBeInTheDocument();

    // Password card
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save password/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockListDevices).toHaveBeenCalled();
    });
  });

  it('validates empty and invalid fields on submit', async () => {
    render(<SettingsForm />);
    const saveBtn = screen.getByRole('button', { name: /save password/i });

    fireEvent.click(saveBtn);

    // Empty fields validation
    expect(await screen.findByText(/current password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
  });

  it('validates complex new password criteria', async () => {
    render(<SettingsForm />);
    const user = userEvent.setup();

    const currentInput = screen.getByLabelText(/current password/i);
    const newInput = screen.getByLabelText(/^new password/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    const saveBtn = screen.getByRole('button', { name: /save password/i });

    await user.type(currentInput, 'oldpass123');

    // 1. Too short
    await user.type(newInput, 'Short1!');
    await user.type(confirmInput, 'Short1!');
    fireEvent.click(saveBtn);
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();

    // 2. No uppercase
    await user.clear(newInput);
    await user.clear(confirmInput);
    await user.type(newInput, 'lowercase1!');
    await user.type(confirmInput, 'lowercase1!');
    fireEvent.click(saveBtn);
    expect(
      await screen.findByText(/must contain at least one uppercase letter/i)
    ).toBeInTheDocument();

    // 3. No lowercase
    await user.clear(newInput);
    await user.clear(confirmInput);
    await user.type(newInput, 'UPPERCASE1!');
    await user.type(confirmInput, 'UPPERCASE1!');
    fireEvent.click(saveBtn);
    expect(
      await screen.findByText(/must contain at least one lowercase letter/i)
    ).toBeInTheDocument();

    // 4. No digits
    await user.clear(newInput);
    await user.clear(confirmInput);
    await user.type(newInput, 'NoDigitsHere!');
    await user.type(confirmInput, 'NoDigitsHere!');
    fireEvent.click(saveBtn);
    expect(await screen.findByText(/must contain at least one number/i)).toBeInTheDocument();

    // 5. No special character
    await user.clear(newInput);
    await user.clear(confirmInput);
    await user.type(newInput, 'NoSpecial123');
    await user.type(confirmInput, 'NoSpecial123');
    fireEvent.click(saveBtn);
    expect(
      await screen.findByText(/must contain at least one special character/i)
    ).toBeInTheDocument();

    // 6. Mismatched confirm password
    await user.clear(newInput);
    await user.clear(confirmInput);
    await user.type(newInput, 'ValidPass123!');
    await user.type(confirmInput, 'DifferentPass123!');
    fireEvent.click(saveBtn);
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits successfully with valid passwords', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.changePassword).mockResolvedValue({
      message: 'Password changed successfully.',
    });

    render(<SettingsForm />);

    await user.type(screen.getByLabelText(/current password/i), 'CurrentPass123!');
    await user.type(screen.getByLabelText(/^new password/i), 'NewPass123!');
    await user.type(screen.getByLabelText(/confirm new password/i), 'NewPass123!');

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    // Verify loading spinner shows up
    expect(screen.getAllByTestId('loading-spinner')[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith({
        current_password: 'CurrentPass123!',
        new_password: 'NewPass123!',
        confirm_password: 'NewPass123!',
      });
    });

    // Check success banner and input resetting
    expect(await screen.findByText(/Password changed successfully\./)).toBeInTheDocument();
    expect((screen.getByLabelText(/current password/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/^new password/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/confirm new password/i) as HTMLInputElement).value).toBe('');
  });

  it('displays API error alert when request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.changePassword).mockRejectedValue({
      response: {
        data: {
          detail: 'Current password is incorrect',
        },
      },
    });

    render(<SettingsForm />);

    await user.type(screen.getByLabelText(/current password/i), 'WrongOldPass123!');
    await user.type(screen.getByLabelText(/^new password/i), 'NewPass123!');
    await user.type(screen.getByLabelText(/confirm new password/i), 'NewPass123!');

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    expect(await screen.findByText(/Current password is incorrect/i)).toBeInTheDocument();
  });

  it('triggers logout and redirects to /auth', async () => {
    render(<SettingsForm />);

    fireEvent.click(screen.getByRole('button', { name: /log out/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });

  /* DEVICE MANAGEMENT TESTS */

  it('lists active devices correctly and highlights this device', async () => {
    render(<SettingsForm />);

    // Wait for device loading to finish
    await waitFor(() => {
      expect(screen.getByText('Chrome on Linux')).toBeInTheDocument();
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
    });

    // Highlights current device with "This Device" badge
    expect(screen.getByText('This Device')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('10.0.0.5')).toBeInTheDocument();

    // Specific button texts
    expect(screen.getByTestId('revoke-button-current-device-id')).toHaveTextContent('Logout');
    expect(screen.getByTestId('revoke-button-other-device-id')).toHaveTextContent('Revoke');
  });

  it('handles revoke of a particular device (not current) successfully', async () => {
    render(<SettingsForm />);

    await waitFor(() => {
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
    });

    // Click revoke on other device
    fireEvent.click(screen.getByTestId('revoke-button-other-device-id'));

    await waitFor(() => {
      expect(mockRevokeDevice).toHaveBeenCalledWith('other-device-id');
    });

    // Verifies it re-fetches devices
    await waitFor(() => {
      expect(mockListDevices).toHaveBeenCalledTimes(2);
    });
  });

  it('handles revoke of current device successfully and logs user out', async () => {
    render(<SettingsForm />);

    await waitFor(() => {
      expect(screen.getByText('Chrome on Linux')).toBeInTheDocument();
    });

    // Click logout on current device
    fireEvent.click(screen.getByTestId('revoke-button-current-device-id'));

    await waitFor(() => {
      expect(mockRevokeDevice).toHaveBeenCalledWith('current-device-id');
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });

  it('handles logout from all devices successfully and logs user out', async () => {
    render(<SettingsForm />);

    await waitFor(() => {
      expect(screen.getByText('Chrome on Linux')).toBeInTheDocument();
    });

    // Click logout from all devices
    fireEvent.click(screen.getByTestId('logout-all-button'));

    await waitFor(() => {
      expect(mockRevokeAllDevices).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/auth');
    });
  });

  it('displays device API error alert when list devices fails', async () => {
    mockListDevices.mockRejectedValue({
      response: {
        data: {
          detail: 'Failed to retrieve active devices.',
        },
      },
    });

    render(<SettingsForm />);

    expect(await screen.findByTestId('device-error-alert')).toHaveTextContent(
      /Failed to retrieve active devices\./i
    );
  });

  it('handles invalid jwt token in localStorage gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('accessToken', 'invalid-token-without-split');

    render(<SettingsForm />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to decode did from token:'),
        expect.any(Error)
      );
    });
    consoleSpy.mockRestore();
  });

  it('handles error when revoking a device fails', async () => {
    mockRevokeDevice.mockRejectedValue({
      response: {
        data: {
          detail: 'Failed to revoke device backend error',
        },
      },
    });

    render(<SettingsForm />);

    await waitFor(() => {
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('revoke-button-other-device-id'));

    expect(await screen.findByTestId('device-error-alert')).toHaveTextContent(
      /Failed to revoke device backend error/i
    );
  });

  it('handles error when revoking all devices fails', async () => {
    mockRevokeAllDevices.mockRejectedValue(new Error('Revoke all failed'));

    render(<SettingsForm />);

    await waitFor(() => {
      expect(screen.getByText('Safari on iPhone')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('logout-all-button'));

    expect(await screen.findByTestId('device-error-alert')).toHaveTextContent(/Revoke all failed/i);
  });

  it('renders legacy device properties successfully when standard ones are missing', async () => {
    mockListDevices.mockResolvedValue([
      {
        device_id: 'legacy-device',
        name: 'Legacy Chrome',
        ip: '8.8.8.8',
        last_used: '2026-05-22T10:00:00.000Z',
      },
    ]);

    render(<SettingsForm />);

    expect(await screen.findByText('Legacy Chrome')).toBeInTheDocument();
    expect(screen.getByText('8.8.8.8')).toBeInTheDocument();
  });
});
