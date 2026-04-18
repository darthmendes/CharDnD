// src/hooks/useModal.ts
// Reusable hook for managing modal state

import { useState, useCallback } from 'react';

export interface ModalState<T = undefined> {
    isOpen: boolean;
    data: T | null;
}

export interface UseModalResult<T = undefined> {
    isOpen: boolean;
    data: T | null;
    open: (data?: T) => void;
    close: () => void;
    toggle: () => void;
}

/**
 * Hook for managing a single modal's open/close state with optional data
 * 
 * @example
 * const itemModal = useModal<Item>();
 * 
 * // Open modal with data
 * itemModal.open(selectedItem);
 * 
 * // In JSX
 * {itemModal.isOpen && <ItemModal item={itemModal.data} onClose={itemModal.close} />}
 */
export function useModal<T = undefined>(
    initialState: ModalState<T> = { isOpen: false, data: null }
): UseModalResult<T> {
    const [state, setState] = useState<ModalState<T>>(initialState);

    const open = useCallback((data?: T) => {
        setState({ isOpen: true, data: data ?? null });
    }, []);

    const close = useCallback(() => {
        setState({ isOpen: false, data: null });
    }, []);

    const toggle = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    }, []);

    return {
        isOpen: state.isOpen,
        data: state.data,
        open,
        close,
        toggle,
    };
}

/**
 * Hook for managing multiple modals by key
 * 
 * @example
 * const modals = useMultipleModals(['item', 'spell', 'confirm'] as const);
 * 
 * modals.open('item', selectedItem);
 * modals.isOpen('item');
 * modals.close('item');
 */
export function useMultipleModals<K extends string>(
    modalKeys: readonly K[]
): {
    isOpen: (key: K) => boolean;
    getData: <T>(key: K) => T | null;
    open: <T>(key: K, data?: T) => void;
    close: (key: K) => void;
    closeAll: () => void;
    activeModal: K | null;
} {
    const initialState = modalKeys.reduce(
        (acc, key) => ({ ...acc, [key]: { isOpen: false, data: null } }),
        {} as Record<K, ModalState<unknown>>
    );

    const [states, setStates] = useState(initialState);

    const isOpen = useCallback(
        (key: K) => states[key]?.isOpen ?? false,
        [states]
    );

    const getData = useCallback(
        <T>(key: K): T | null => (states[key]?.data as T) ?? null,
        [states]
    );

    const open = useCallback(<T>(key: K, data?: T) => {
        setStates(prev => ({
            ...prev,
            [key]: { isOpen: true, data: data ?? null },
        }));
    }, []);

    const close = useCallback((key: K) => {
        setStates(prev => ({
            ...prev,
            [key]: { isOpen: false, data: null },
        }));
    }, []);

    const closeAll = useCallback(() => {
        setStates(initialState);
    }, [initialState]);

    const activeModal = modalKeys.find(key => states[key].isOpen) ?? null;

    return { isOpen, getData, open, close, closeAll, activeModal };
}

/**
 * Hook for confirmation modal pattern
 */
export function useConfirmModal(): {
    isOpen: boolean;
    message: string;
    confirm: (message: string) => Promise<boolean>;
    handleConfirm: () => void;
    handleCancel: () => void;
} {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((confirmMessage: string): Promise<boolean> => {
        setMessage(confirmMessage);
        setIsOpen(true);

        return new Promise<boolean>(resolve => {
            setResolveRef(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        resolveRef?.(true);
        setResolveRef(null);
    }, [resolveRef]);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        resolveRef?.(false);
        setResolveRef(null);
    }, [resolveRef]);

    return { isOpen, message, confirm, handleConfirm, handleCancel };
}

export default useModal;
