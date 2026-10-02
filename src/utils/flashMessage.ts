import Toast from 'react-native-toast-message';
import { font14, font16 } from './fontSizes';
import { FontMedium, FontSemiBold } from './fontFamily';
import { Platform, ViewStyle } from 'react-native';
import { scaleSize } from './responsive';

export const showFlashMessage = (message: string, type = 'error') => {
  Toast.show({
    type: type, // 'success', 'error', 'info'
    text2: message,
    position: 'top',
    visibilityTime: 1500,
    topOffset: 0,
    text2Style: {
      fontSize: font14,
      fontFamily: FontSemiBold,
    },
  });
};


export const showModalMessage = (message: string, type = 'error') => {
  Toast.show({
    type: type, // 'success', 'error', 'info'
    text2: message,
    position: 'top',
    visibilityTime: 1500,
    topOffset: -20,
    text2Style: {
      fontSize: font14,
      fontFamily: FontMedium,
    },
  });
};

