// src/hooks/useAsyncData.ts
// Reusable hook for managing async data fetching with loading/error states

import { useState, useEffect, useCallback, useRef } from 'react';

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseAsyncDataResult<T> extends AsyncState<T> {
    refetch: () => Promise<void>;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    reset: () => void;
}

/**
 * Hook for fetching async data with automatic loading/error state management
 * 
 * @param fetchFn - Async function that returns the data
 * @param deps - Dependencies array (like useEffect) to trigger refetch
 * @param options - Configuration options
 * 
 * @example
 * const { data: species, loading, error, refetch } = useAsyncData(
 *   () => fetchSpecies(),
 *   [],
 *   { initialData: [] }
 * );
 */
export function useAsyncData<T>(
    fetchFn: () => Promise<T>,
    deps: React.DependencyList = [],
    options: {
        initialData?: T;
        enabled?: boolean;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
    } = {}
): UseAsyncDataResult<T> {
    const { initialData = null, enabled = true, onSuccess, onError } = options;

    const [data, setData] = useState<T | null>(initialData as T | null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<string | null>(null);

    // Track if component is mounted
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            if (isMounted.current) {
                setData(result);
                onSuccess?.(result);
            }
        } catch (err) {
            if (isMounted.current) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);
                onError?.(err instanceof Error ? err : new Error(errorMessage));
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFn, enabled, ...deps]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    const reset = useCallback(() => {
        setData(initialData as T | null);
        setError(null);
        setLoading(false);
    }, [initialData]);

    return { data, loading, error, refetch, setData, reset };
}

/**
 * Hook for lazy data fetching (doesn't fetch on mount)
 */
export function useLazyAsyncData<T>(
    fetchFn: () => Promise<T>,
    options: {
        initialData?: T;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
    } = {}
): UseAsyncDataResult<T> & { execute: () => Promise<void> } {
    const [enabled, setEnabled] = useState(false);

    const result = useAsyncData(fetchFn, [enabled], {
        ...options,
        enabled,
    });

    const execute = useCallback(async () => {
        setEnabled(true);
        await result.refetch();
    }, [result]);

    return { ...result, execute };
}

/**
 * Hook for managing multiple async data sources
 */
export function useMultipleAsyncData<T extends Record<string, () => Promise<unknown>>>(
    fetchFns: T
): {
    data: { [K in keyof T]: Awaited<ReturnType<T[K]>> | null };
    loading: boolean;
    errors: { [K in keyof T]?: string };
    refetchAll: () => Promise<void>;
} {
    const [data, setData] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setErrors({});

        const results: Record<string, unknown> = {};
        const newErrors: Record<string, string> = {};

        await Promise.all(
            Object.entries(fetchFns).map(async ([key, fetchFn]) => {
                try {
                    results[key] = await fetchFn();
                } catch (err) {
                    newErrors[key] = err instanceof Error ? err.message : 'Failed to fetch';
                }
            })
        );

        setData(results);
        setErrors(newErrors);
        setLoading(false);
    }, [fetchFns]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        data: data as { [K in keyof T]: Awaited<ReturnType<T[K]>> | null },
        loading,
        errors: errors as { [K in keyof T]?: string },
        refetchAll: fetchAll,
    };
}

export default useAsyncData;
