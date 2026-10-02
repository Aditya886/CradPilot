import React from 'react';
import { Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../utils/colors';
import Ripple from '../components/Ripple'
// import Ripple from 'react-native-material-ripple';

interface CommonRippleButtonProps {
  onPress: any;
  children: React.ReactNode;
  rippleColor?: string;
  rippleDuration?: number;
  rippleOpacity?: number;
  rippleContainerBorderRadius?: number;
  style?: any;
}

const CommonRippleButton: React.FC<CommonRippleButtonProps> = ({
  onPress,
  children,
  rippleColor = colors.bgWhite,
  rippleDuration = 800,
  rippleOpacity = 0.6,
  rippleContainerBorderRadius,
  style = {},
  ...props
}) => {
  return (
    <Ripple
      rippleColor={rippleColor}
      rippleDuration={rippleDuration}
      rippleOpacity={rippleOpacity}
      rippleContainerBorderRadius={rippleContainerBorderRadius}
      onPress={onPress}
      style={[styles.defaultStyle, style]}
      {...props}
    >
      {children}
    </Ripple>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default CommonRippleButton;
