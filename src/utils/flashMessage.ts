import Toast from 'react-native-toast-message';
import { font14 } from './fontSizes';
import { FontMedium, FontSemiBold } from './fontFamily';
import { ShowToast, ToastType } from './CustomToast/ToastManager';

export const showFlashMessage = (message: string, type: 'success' | 'error' | 'info' | string = 'error') => {
  const toastType: ToastType = type === 'success' ? 'success' : type === 'info' ? 'info' : 'error';

  // 1. Show via custom animated GlobalToast
  ShowToast(message, toastType, 'top', undefined, 2500);

  // 2. Also dispatch to react-native-toast-message as secondary channel
  try {
    Toast.show({
      type: toastType,
      text2: message,
      position: 'top',
      visibilityTime: 2500,
      topOffset: 0,
      text2Style: {
        fontSize: font14,
        fontFamily: FontSemiBold,
      },
    });
  } catch (e) {}
};

export const showModalMessage = (message: string, type: 'success' | 'error' | 'info' | string = 'error') => {
  const toastType: ToastType = type === 'success' ? 'success' : type === 'info' ? 'info' : 'error';

  // 1. Show via custom animated GlobalToast
  ShowToast(message, toastType, 'top', undefined, 2500);

  // 2. Also dispatch to react-native-toast-message
  try {
    Toast.show({
      type: toastType,
      text2: message,
      position: 'top',
      visibilityTime: 2500,
      topOffset: -20,
      text2Style: {
        fontSize: font14,
        fontFamily: FontMedium,
      },
    });
  } catch (e) {}
};
