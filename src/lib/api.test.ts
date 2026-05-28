import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from './api';
import axios from 'axios';

// Create a copy of original process.env
const originalEnv = { ...process.env };

interface MockRequestConfig {
  headers: Record<string, string>;
}

interface MockResponse {
  data: string;
  status: number;
}

interface RequestInterceptorHandler {
  fulfilled: (config: MockRequestConfig) => MockRequestConfig;
}

interface ResponseInterceptorHandler {
  fulfilled: (response: MockResponse) => MockResponse;
  rejected: (error: unknown) => Promise<unknown>;
}

describe('api.ts - getBaseURL and Instance configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('configures Axios default settings correctly', () => {
    expect(api.defaults.withCredentials).toBe(true);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('injects accessToken into Authorization header in request interceptor', async () => {
    localStorage.setItem('accessToken', 'test-access-token');

    // Simulate interceptor run
    const requestInterceptors = api.interceptors.request as unknown as {
      handlers: RequestInterceptorHandler[];
    };
    const interceptor = requestInterceptors.handlers[0].fulfilled;
    const config = { headers: {} };
    const resultConfig = interceptor(config);

    expect(resultConfig.headers.Authorization).toBe('Bearer test-access-token');
  });

  it('does not inject Authorization header if accessToken is missing', async () => {
    const requestInterceptors = api.interceptors.request as unknown as {
      handlers: RequestInterceptorHandler[];
    };
    const interceptor = requestInterceptors.handlers[0].fulfilled;
    const config = { headers: {} };
    const resultConfig = interceptor(config);

    expect(resultConfig.headers.Authorization).toBeUndefined();
  });

  it('response interceptor passes success response directly through', () => {
    const responseInterceptors = api.interceptors.response as unknown as {
      handlers: ResponseInterceptorHandler[];
    };
    const interceptor = responseInterceptors.handlers[0].fulfilled;
    const mockResponse = { data: 'ok', status: 200 };
    const result = interceptor(mockResponse);
    expect(result).toBe(mockResponse);
  });

  it('throws error directly for non-401 responses', async () => {
    const responseInterceptors = api.interceptors.response as unknown as {
      handlers: ResponseInterceptorHandler[];
    };
    const rejectedInterceptor = responseInterceptors.handlers[0].rejected;
    const mockError = {
      config: { headers: {} as Record<string, string> },
      response: { status: 500 },
    };
    await expect(rejectedInterceptor(mockError)).rejects.toEqual(mockError);
  });

  interface GlobalWithLocation {
    location?: { href: string } | Location;
  }

  it('handles 401 error when no refresh token exists', async () => {
    const responseInterceptors = api.interceptors.response as unknown as {
      handlers: ResponseInterceptorHandler[];
    };
    const rejectedInterceptor = responseInterceptors.handlers[0].rejected;

    // Set mock global window location
    const originalLocation = globalThis.location;
    const mockLocation = { href: '' };
    delete (globalThis as unknown as GlobalWithLocation).location;
    (globalThis as unknown as GlobalWithLocation).location = mockLocation;

    const mockError = {
      config: { headers: {} as Record<string, string> },
      response: { status: 401 },
    };

    await expect(rejectedInterceptor(mockError)).rejects.toThrow('No refresh token available');
    expect(mockLocation.href).toBe('/auth');

    // Restore
    (globalThis as unknown as GlobalWithLocation).location = originalLocation;
  });

  it('successfully rotates tokens on 401 and retries original request', async () => {
    localStorage.setItem('refreshToken', 'mock-refresh-token');

    const responseInterceptors = api.interceptors.response as unknown as {
      handlers: ResponseInterceptorHandler[];
    };
    const rejectedInterceptor = responseInterceptors.handlers[0].rejected;

    // Spy on axios.post to mock the rotate endpoint response
    const spyPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      },
    });

    // Mock api adapter to prevent real network requests and return success
    const originalAdapter = api.defaults.adapter;
    api.defaults.adapter = vi.fn().mockResolvedValueOnce({
      data: 'retry-success',
      status: 200,
      headers: {},
      config: {},
    });

    const mockError = {
      config: { headers: {} as Record<string, string>, _retry: false },
      response: { status: 401 },
    };

    const result = await rejectedInterceptor(mockError);

    expect(spyPost).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      { refresh_token: 'mock-refresh-token' },
      expect.any(Object)
    );
    expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    expect(mockError.config.headers['Authorization']).toBe('Bearer new-access-token');
    expect((result as Record<string, unknown>).data).toBe('retry-success');

    // Restore original adapter
    api.defaults.adapter = originalAdapter;
  });

  it('handles failed refresh call by clearing tokens and redirecting to /auth', async () => {
    localStorage.setItem('accessToken', 'old-access-token');
    localStorage.setItem('refreshToken', 'old-refresh-token');

    const responseInterceptors = api.interceptors.response as unknown as {
      handlers: ResponseInterceptorHandler[];
    };
    const rejectedInterceptor = responseInterceptors.handlers[0].rejected;

    // Mock refresh request failure
    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Refresh failed'));

    // Set mock global window location
    const originalLocation = globalThis.location;
    const mockLocation = { href: '' };
    delete (globalThis as unknown as GlobalWithLocation).location;
    (globalThis as unknown as GlobalWithLocation).location = mockLocation;

    const mockError = {
      config: { headers: {} as Record<string, string>, _retry: false },
      response: { status: 401 },
    };

    await expect(rejectedInterceptor(mockError)).rejects.toThrow('Refresh failed');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(mockLocation.href).toBe('/auth');

    // Restore
    (globalThis as unknown as GlobalWithLocation).location = originalLocation;
  });
});
