import { createRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'base' | 'test';
export type ToastPosition = 'top' | 'bottom';

export interface ToastConfig {
  text1: string;
  text2?: string;
  type: ToastType;
  duration?: number;
  position?: ToastPosition;
}

export interface ToastManagerRef {
  show: (config: ToastConfig) => void;
  hide: () => void;
}

export const toastRef = createRef<ToastManagerRef>();
export const sideToastRef = createRef<ToastManagerRef>();

export const ShowToast = (
  text1: string,
  type: ToastType = 'error',
  position: ToastPosition = 'bottom',
  text2?: string,
  duration: number = 2000,
) => {
  toastRef.current?.show({
    text1,
    text2,
    type,
    position,
    duration,
  });
};

export const SideShowToast = (
  text1: string,
  type: ToastType = 'error',
  position: ToastPosition = 'bottom',
  text2?: string,
  duration: number = 2000,
) => {
  sideToastRef.current?.show({
    text1,
    text2,
    type,
    position,
    duration,
  });
};
