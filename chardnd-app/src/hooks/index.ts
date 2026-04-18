// src/hooks/index.ts
// Central export for all custom hooks

export {
    useAsyncData,
    useLazyAsyncData,
    useMultipleAsyncData,
    type AsyncState,
    type UseAsyncDataResult
} from './useAsyncData';

export {
    useModal,
    useMultipleModals,
    useConfirmModal,
    type ModalState,
    type UseModalResult
} from './useModal';
