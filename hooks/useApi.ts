import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<{ data: T }>) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<{ data: T }>): Promise<T> => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const response = await apiCall();
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'An unexpected error occurred';
      
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}
