'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button, Avatar, Badge } from 'sketchbook-ui';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { DeviceDetails } from '@/types/auth';
interface AuthError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

export default function SettingsForm() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Password state
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Devices state
  const [devices, setDevices] = useState<DeviceDetails[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState('');
  const [currentDeviceId, setCurrentDeviceId] = useState('');

  // Fetch trusted devices
  const fetchDevices = async () => {
    setDevicesLoading(true);
    setDevicesError('');
    try {
      const data = await authService.listDevices();
      setDevices(data);
    } catch (err) {
      const errorObj = err as AuthError;
      console.error('Failed to list devices:', err);
      const detail =
        errorObj.response?.data?.detail || errorObj.message || 'Failed to retrieve active devices.';
      setDevicesError(typeof detail === 'string' ? detail : 'Failed to retrieve active devices.');
    } finally {
      setDevicesLoading(false);
    }
  };

  // Protect the route - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  // Decode did from access token and fetch devices list
  useEffect(() => {
    if (isAuthenticated) {
      if (globalThis.window !== undefined) {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setTimeout(() => {
              setCurrentDeviceId(payload.did || '');
            }, 0);
          } catch (e) {
            console.error('Failed to decode did from token:', e);
          }
        }
      }
      setTimeout(() => {
        fetchDevices();
      }, 0);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="border-granite h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="text-gunmetal mt-4 font-['Caveat',_cursive] text-xl font-bold">
            Loading sketchbook...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  // Generate initials for the Avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.form) {
      setErrors((prev) => ({ ...prev, [name]: '', form: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }

    if (formData.new_password) {
      if (formData.new_password.length < 8) {
        newErrors.new_password = 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(formData.new_password)) {
        newErrors.new_password = 'Must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(formData.new_password)) {
        newErrors.new_password = 'Must contain at least one lowercase letter';
      }
      if (!/\d/.test(formData.new_password)) {
        newErrors.new_password = 'Must contain at least one number';
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password)) {
        newErrors.new_password = 'Must contain at least one special character';
      }
    } else {
      newErrors.new_password = 'New password is required';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Confirm password is required';
    } else if (formData.confirm_password !== formData.new_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFormIsLoading(true);
    try {
      const response = await authService.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      setSuccessMessage(response.message || 'Password changed successfully!');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      const errorObj = err as AuthError;
      console.error('Password change error:', err);
      const detail =
        errorObj.response?.data?.detail ||
        errorObj.message ||
        'Failed to change password. Please try again.';
      setErrors({
        form: typeof detail === 'string' ? detail : 'Invalid current password or request details',
      });
    } finally {
      setFormIsLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    router.push('/auth');
  };

  const handleRevokeDevice = async (deviceId: string) => {
    setDevicesLoading(true);
    setDevicesError('');
    try {
      await authService.revokeDevice(deviceId);

      // If user logs out their own current device, redirect them to auth
      if (deviceId === currentDeviceId) {
        await logout();
        router.push('/auth');
      } else {
        await fetchDevices();
      }
    } catch (err) {
      const errorObj = err as AuthError;
      console.error('Failed to revoke device:', err);
      const detail =
        errorObj.response?.data?.detail || errorObj.message || 'Failed to logout device.';
      setDevicesError(typeof detail === 'string' ? detail : 'Failed to logout device.');
      setDevicesLoading(false);
    }
  };

  const handleRevokeAllDevices = async () => {
    setDevicesLoading(true);
    setDevicesError('');
    try {
      await authService.revokeAllDevices();
      await logout();
      router.push('/auth');
    } catch (err) {
      const errorObj = err as AuthError;
      console.error('Failed to revoke all devices:', err);
      const detail =
        errorObj.response?.data?.detail || errorObj.message || 'Failed to logout from all devices.';
      setDevicesError(typeof detail === 'string' ? detail : 'Failed to logout from all devices.');
    }
  };

  let devicesContent;
  if (devicesLoading && devices.length === 0) {
    devicesContent = (
      <div className="py-8 text-center" data-testid="devices-loading-placeholder">
        <div className="border-granite mx-auto h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="text-gunmetal mt-2 font-medium">Fetching active sessions...</p>
      </div>
    );
  } else if (devices.length === 0) {
    devicesContent = (
      <p className="text-gunmetal/60 py-4 text-center font-medium">
        No other active devices found.
      </p>
    );
  } else {
    devicesContent = (
      <div className="divide-gunmetal/15 space-y-4 divide-y divide-dashed">
        {devices.map((device) => {
          const devId = device.device_id;
          const devWithLegacy = device as DeviceDetails & { name?: string; ip?: string };
          const name = device.device_name || devWithLegacy.name || 'Unknown Device';
          const ip = device.ip_address || devWithLegacy.ip || 'Unknown IP';
          const isCurrent = devId === currentDeviceId;

          return (
            <div
              key={devId}
              className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
              data-testid={`device-item-${devId}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 text-3xl select-none">
                  {name.toLowerCase().includes('phone') || name.toLowerCase().includes('mobile')
                    ? '📱'
                    : '💻'}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-gunmetal text-lg font-bold">{name}</span>
                    {isCurrent && (
                      <span className="bg-ash-grey/25 text-granite border-granite/40 rounded-full border px-2.5 py-0.5 font-['Caveat',_cursive] text-xs font-bold">
                        This Device
                      </span>
                    )}
                  </div>
                  <div className="text-gunmetal/60 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                    <span>
                      IP: <span className="font-mono text-xs">{ip}</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>Last active: {new Date(device.last_used).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleRevokeDevice(devId)}
                colors={{
                  bg: '#fff',
                  stroke: isCurrent ? 'var(--granite)' : 'var(--gunmetal)',
                  text: isCurrent ? 'var(--granite)' : 'var(--gunmetal)',
                }}
                className="self-end text-sm hover:bg-red-50/50 sm:self-center"
                disabled={devicesLoading}
                data-testid={`revoke-button-${devId}`}
              >
                {isCurrent ? 'Logout' : 'Revoke'}
              </Button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-alabaster-grey min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Header */}
      <header className="border-gunmetal/30 mx-auto mb-10 flex max-w-5xl items-center justify-between border-b border-dashed pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-105 focus:outline-none"
          >
            <Badge
              size="lg"
              colors={{ bg: 'var(--granite)', text: '#fff', stroke: '#000' }}
              typography={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                fontFamily: 'Caveat, cursive',
              }}
            >
              BrainRot
            </Badge>
          </button>
          <span className="text-gunmetal hidden font-['Caveat',_cursive] text-2xl font-bold md:inline">
            {'// Personal Workspace'}
          </span>
        </div>
        <Button
          onClick={handleLogoutClick}
          colors={{
            bg: '#fff',
            stroke: 'var(--granite)',
            text: 'var(--granite)',
          }}
          className="hover:bg-red-50"
        >
          Log Out
        </Button>
      </header>

      <main className="mx-auto max-w-5xl">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-granite font-['Caveat',_cursive] text-5xl font-bold tracking-wide">
            User Settings
          </h1>
          <p className="text-gunmetal mt-2 text-lg font-medium">
            Manage your account credentials and see your profile yapping details
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Column 1: Profile card (2/5 size on md+) */}
          <section className="md:col-span-2">
            <Card variant="notebook" className="h-full bg-white shadow-lg">
              <div className="p-8 text-center">
                <h2 className="text-granite border-gunmetal/20 mb-6 border-b border-dashed pb-3 font-['Caveat',_cursive] text-3xl font-bold">
                  Profile Details
                </h2>

                <div className="mb-6 flex justify-center">
                  <Avatar
                    initials={getInitials(user.fullName)}
                    size="lg"
                    colors={{
                      bg: 'var(--granite)',
                      fallbackBg: 'var(--granite)',
                      stroke: '#000',
                      text: '#fff',
                    }}
                    typography={{
                      fontFamily: 'Caveat, cursive',
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                    }}
                    showBorder
                    showShadow
                  />
                </div>

                <div className="space-y-5 text-left">
                  <div className="bg-alabaster-grey/40 border-dust-grey/30 rounded-xl border p-4 shadow-[2px_2px_0px_0px_rgba(71,88,65,0.15)]">
                    <span className="text-gunmetal/60 block text-xs font-bold tracking-wider uppercase">
                      Full Name
                    </span>
                    <span className="text-gunmetal text-lg font-semibold break-words">
                      {user.fullName || 'BrainRot User'}
                    </span>
                  </div>

                  <div className="bg-alabaster-grey/40 border-dust-grey/30 rounded-xl border p-4 shadow-[2px_2px_0px_0px_rgba(71,88,65,0.15)]">
                    <span className="text-gunmetal/60 block text-xs font-bold tracking-wider uppercase">
                      Email Address
                    </span>
                    <span className="text-gunmetal text-lg font-semibold break-all">
                      {user.email}
                    </span>
                  </div>

                  <div className="bg-alabaster-grey/40 border-dust-grey/30 rounded-xl border p-4 shadow-[2px_2px_0px_0px_rgba(71,88,65,0.15)]">
                    <span className="text-gunmetal/60 block text-xs font-bold tracking-wider uppercase">
                      Account ID
                    </span>
                    <span className="text-gunmetal/80 font-mono text-sm break-all">{user.id}</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Column 2: Password form (3/5 size on md+) */}
          <section className="md:col-span-3">
            <Card variant="notebook" className="bg-white shadow-lg">
              <div className="p-8">
                <h2 className="text-granite border-gunmetal/20 mb-6 border-b border-dashed pb-3 font-['Caveat',_cursive] text-3xl font-bold">
                  Change Password
                </h2>

                {successMessage && (
                  <div
                    data-testid="success-alert"
                    className="border-granite bg-alabaster-grey/20 mb-6 animate-pulse rounded-xl border-2 p-4 text-center shadow-[3px_3px_0px_0px_rgba(71,88,65,0.3)]"
                  >
                    <p className="text-granite text-base font-bold">🎉 {successMessage}</p>
                  </div>
                )}

                {errors.form && (
                  <div
                    data-testid="error-alert"
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-base font-semibold text-red-600 shadow-[3px_3px_0px_0px_rgba(239,68,68,0.2)]"
                  >
                    ⚠️ {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div>
                    <label
                      className="text-gunmetal mb-1.5 ml-1 block text-base font-bold"
                      htmlFor="current_password"
                    >
                      Current Password
                    </label>
                    <Input
                      type="password"
                      id="current_password"
                      name="current_password"
                      size="lg"
                      className="w-full"
                      value={formData.current_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      colors={{
                        stroke: errors.current_password ? '#ef4444' : undefined,
                      }}
                    />
                    {errors.current_password && (
                      <p className="mt-1 text-sm font-semibold text-red-500">
                        {errors.current_password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="text-gunmetal mb-1.5 ml-1 block text-base font-bold"
                      htmlFor="new_password"
                    >
                      New Password
                    </label>
                    <Input
                      type="password"
                      id="new_password"
                      name="new_password"
                      size="lg"
                      className="w-full"
                      value={formData.new_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      colors={{
                        stroke: errors.new_password ? '#ef4444' : undefined,
                      }}
                    />
                    {errors.new_password && (
                      <p className="mt-1 text-sm font-semibold text-red-500">
                        {errors.new_password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="text-gunmetal mb-1.5 ml-1 block text-base font-bold"
                      htmlFor="confirm_password"
                    >
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      size="lg"
                      className="w-full"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      colors={{
                        stroke: errors.confirm_password ? '#ef4444' : undefined,
                      }}
                    />
                    {errors.confirm_password && (
                      <p className="mt-1 text-sm font-semibold text-red-500">
                        {errors.confirm_password}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" data-testid="submit-button" disabled={formIsLoading}>
                      {formIsLoading ? (
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-5 w-5 animate-spin text-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            data-testid="loading-spinner"
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
                          <span>Updating...</span>
                        </div>
                      ) : (
                        'Save Password'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </section>
        </div>

        {/* Device Settings Card */}
        <div className="mt-8">
          <Card variant="notebook" className="bg-white shadow-lg">
            <div className="p-8">
              <div className="border-gunmetal/20 mb-6 flex flex-col gap-4 border-b border-dashed pb-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-granite font-['Caveat',_cursive] text-3xl font-bold">
                  Active Devices
                </h2>
                <Button
                  onClick={handleRevokeAllDevices}
                  colors={{
                    bg: '#fff',
                    stroke: '#ef4444',
                    text: '#ef4444',
                  }}
                  className="text-sm hover:bg-red-50"
                  disabled={devicesLoading}
                  data-testid="logout-all-button"
                >
                  Logout from All Devices
                </Button>
              </div>

              {devicesError && (
                <div
                  data-testid="device-error-alert"
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600 shadow-[3px_3px_0px_0px_rgba(239,68,68,0.2)]"
                >
                  ⚠️ {devicesError}
                </div>
              )}

              {devicesContent}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
