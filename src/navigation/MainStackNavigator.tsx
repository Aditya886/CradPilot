import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { navigationRef } from './NavigationUtils';
import {
  KeyboardAvoidingView,
  StatusBar,
  Platform,
  Keyboard,
  View,
} from 'react-native';
import { colors } from '../utils/colors';
import Toast from 'react-native-toast-message';
import toastConfig from '../utils/ToastConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../utils/hooks';
import GlobalToast from '../utils/CustomToast/GlobalToast';
import { toastRef } from '../utils/CustomToast/ToastManager';
import { StackNavigation } from './StackNavigator';

const MainStackNavigator = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { tab, type } = useAppSelector(state => state.app);

  const shouldUseKeyboardAvoidingView =
    Platform.OS === 'ios' ||
    (Platform.OS === 'android' && Platform.Version > 34);

  useEffect(() => {
    if (shouldUseKeyboardAvoidingView) {
      const keyboardWillShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        event => {
          setKeyboardHeight(event.endCoordinates.height);
          setIsKeyboardVisible(true);
        },
      );

      const keyboardWillHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardHeight(0);
          setIsKeyboardVisible(false);
        },
      );

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }
  }, [shouldUseKeyboardAvoidingView]);

  const renderContent = () => (
    <View
      style={{
        flex: 1,
        paddingBottom: isKeyboardVisible
          ? Platform.OS === 'android'
            ? keyboardHeight
            : 0
          : 0,
      }}>
      {(
        <StackNavigation />
      )}
    </View>
  );

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bgColor,
    },
  };

  return (

    <NavigationContainer ref={navigationRef} theme={MyTheme}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />
      <SafeAreaView
        style={{ flex: 1 }}
        edges={Platform.OS === 'ios' ? [] : ['bottom']}>
        {shouldUseKeyboardAvoidingView ? (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
          >
            {renderContent()}
            <GlobalToast ref={toastRef} />
            {/* <Toast config={toastConfig} /> */}
          </KeyboardAvoidingView>
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.bgColor }}>
            {renderContent()}
            <GlobalToast ref={toastRef} />
            {/* <Toast config={toastConfig} /> */}
          </View>
        )}
      </SafeAreaView>
    </NavigationContainer>
  );
};

export default MainStackNavigator;
