import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from './api';

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
});
