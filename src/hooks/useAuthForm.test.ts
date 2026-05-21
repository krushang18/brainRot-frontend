import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthForm } from './useAuthForm';

describe('useAuthForm', () => {
  const initialState = { email: '', password: '' };

  const defaultOptions = {
    initialState,
    validate: vi.fn().mockReturnValue({}),
    onSubmit: vi.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with the correct state', () => {
    const { result } = renderHook(() => useAuthForm(defaultOptions));

    expect(result.current.formData).toEqual(initialState);
    expect(result.current.errors).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });

  it('updates form state and clears existing field error on change', () => {
    const { result } = renderHook(() => useAuthForm(defaultOptions));

    // Seed some initial field error
    act(() => {
      result.current.setErrors({ email: 'Email is required' });
    });
    expect(result.current.errors.email).toBe('Email is required');

    // Simulate input change
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'john@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.email).toBe('john@example.com');
    // The field error should be cleared on input modification
    expect(result.current.errors.email).toBe('');
  });

  it('prevents form submission and sets errors when validation fails', async () => {
    const mockValidate = vi.fn().mockReturnValue({ email: 'Invalid format' });
    const { result } = renderHook(() =>
      useAuthForm({
        ...defaultOptions,
        validate: mockValidate,
      })
    );

    const mockPreventDefault = vi.fn();
    const submitEvent = {
      preventDefault: mockPreventDefault,
    } as unknown as React.SubmitEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(mockValidate).toHaveBeenCalledWith(initialState);
    expect(result.current.errors.email).toBe('Invalid format');
    expect(defaultOptions.onSubmit).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('submits successfully and manages loading state when validation passes', async () => {
    const { result } = renderHook(() => useAuthForm(defaultOptions));

    const mockPreventDefault = vi.fn();
    const submitEvent = {
      preventDefault: mockPreventDefault,
    } as unknown as React.SubmitEvent<HTMLFormElement>;

    let submitPromiseResolve!: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      submitPromiseResolve = resolve;
    });

    defaultOptions.onSubmit.mockReturnValue(submitPromise);

    let submitAction: Promise<void>;
    act(() => {
      submitAction = result.current.handleSubmit(submitEvent);
    });

    // Check loader state is active while submit is pending
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      submitPromiseResolve();
      await submitAction;
    });

    expect(defaultOptions.onSubmit).toHaveBeenCalledWith(initialState);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it('catches and maps Error exceptions to the form state error', async () => {
    const mockError = new Error('Incorrect password');
    const failingOptions = {
      ...defaultOptions,
      onSubmit: vi.fn().mockRejectedValue(mockError),
    };

    const { result } = renderHook(() => useAuthForm(failingOptions));
    const submitEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.SubmitEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.form).toBe('Incorrect password');
  });

  it('catches and maps raw non-Error exceptions to a generic fallback form error', async () => {
    const failingOptions = {
      ...defaultOptions,
      onSubmit: vi.fn().mockRejectedValue('Raw string error rejection'),
    };

    const { result } = renderHook(() => useAuthForm(failingOptions));
    const submitEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.SubmitEvent<HTMLFormElement>;

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.form).toBe('Something went wrong. Please try again.');
  });
});
