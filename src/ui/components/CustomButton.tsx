import React, { useRef } from 'react';
import {
  GestureResponderEvent,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { icons } from '../../utils/AppImages';
import { colors } from '../../utils/colors';
import { resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CommonRippleButton from './CommonRippleButton';
import CustomImage from './CustomImage';
import CustomLoader from './CustomLoader';
import CustomText from './CustomText';
import { FontMedium } from '../../utils/fontFamily';
import { font15, font16, font18 } from '../../utils/fontSizes';

export type CustomButtonVariant = 'primary' | 'secondary' | 'outline' | 'error';
export type CustomButtonSize = 'small' | 'medium' | 'large';

export interface CustomButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  innnerStyle?: StyleProp<ViewStyle>;
  loadingColor?: string;
  icon?: React.ReactNode;
  Pre?: any;
  Sufix?: any;
  linear?: boolean;
  buttonSize?: StyleProp<ViewStyle>;
  rippleColor?: string;
  borderRadius?: number;
  rounded?: boolean;
  size?: CustomButtonSize;
  backgroundColor?: string;
  textColor?: string;
  throttleDelay?: number;
  height?: number
  width?: number
  variant?: CustomButtonVariant;
}

const variantConfig: Record<
  CustomButtonVariant,
  {
    linear: boolean;
    backgroundColor?: string;
    textColor: string;
    gradientColors?: string[];
    borderWidth?: number;
    borderColor?: string;
  }
> = {
  primary: {
    linear: true,
    textColor: colors.textWhite,
    gradientColors: [colors.black, colors.black],
    backgroundColor: colors.black
  },
  secondary: {
    linear: false,
    backgroundColor: colors.bgWhite,
    textColor: colors.textBlack,
    borderWidth: 0,
  },
  error: {
    linear: false,
    backgroundColor: colors.redBtnColor,
    textColor: colors.textRed,
    borderWidth: 1,
    borderColor: colors.lightRedBg,
  },
  outline: {
    linear: false,
    backgroundColor: 'transparent',
    textColor: colors.white70,
    borderWidth: 1,
    borderColor: colors.white20,
  },
};

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  innnerStyle,
  buttonSize,
  textStyle,
  rippleColor,
  icon,
  linear,
  height,
  width,
  Pre,
  Sufix,
  borderRadius = resAvarage(100),
  size = 'medium',
  backgroundColor,
  textColor,
  throttleDelay = 800,
  variant = 'primary',
}) => {
  const isThrottled = useRef(false);
  const resolvedVariant = variantConfig[variant];
  const useLinear = linear ?? resolvedVariant.linear;
  const resolvedBackgroundColor =
    backgroundColor ?? resolvedVariant.backgroundColor ?? colors.btnColor;
  const resolvedTextColor = textColor ?? resolvedVariant.textColor;

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: scaleSize(10), paddingHorizontal: scaleSize(12) };
      case 'large':
        return { paddingVertical: scaleSize(20), paddingHorizontal: scaleSize(20) };
      default:
        return { paddingVertical: scaleSize(16), paddingHorizontal: scaleSize(15) };
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (isThrottled.current || disabled || loading) return;

    isThrottled.current = true;
    onPress?.(event);

    setTimeout(() => {
      isThrottled.current = false;
    }, throttleDelay);
  };

  const content = (
    <View style={[styles.buttonContent, getButtonSize(), buttonSize, innnerStyle]}>
      {loading ? (
        <CustomLoader />
      ) : (
        <View style={styles.innerContent}>
          {Pre ? <Pre width={width ? width : resWidth(5)} height={height ? height : resWidth(5)} style={styles.pre} /> : null}
          <CustomText
            color={resolvedTextColor}
            style={[styles.text, textStyle]}
          >
            {title}
          </CustomText>
          {Sufix ? <Sufix width={width ? width : resWidth(5)} height={height ? height : resWidth(5)} style={styles.eye} /> : null}
          {icon && !Sufix ? (
            <CustomImage
              resizeMode="contain"
              style={styles.eye}
              source={icons.doubleNext}
            />
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.wrapper, style]}>
      <CommonRippleButton
        rippleColor={rippleColor ?? colors.white70}
        onPress={handlePress}
        style={[
          styles.rippleButton,
          { borderRadius },
          disabled && styles.disabledButton,
        ]}
        rippleOpacity={0.4}
      >
        <View
          style={[
            styles.gradient,
            {
              borderRadius,
              backgroundColor: resolvedBackgroundColor,
              borderWidth: resolvedVariant.borderWidth,
              borderColor: resolvedVariant.borderColor,
            },
            disabled && styles.disabledButton,
          ]}>
          {content}
        </View>
      </CommonRippleButton>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: scaleSize(5),
  },
  rippleButton: {
    overflow: 'hidden',
  },
  gradient: {
    alignSelf: 'stretch',
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontMedium,
    fontSize: font16,
    textAlign: 'center',
    includeFontPadding: false,
    letterSpacing: resWidth(0.1),
    ...(Platform.OS === 'ios' && {
      lineHeight: scaleSize(20),
    }),
  },
  eye: {
    width: resWidth(5),
    height: resWidth(5),
    marginLeft: scaleSize(8),
  },
  pre: {
    marginRight: scaleSize(1),
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CustomButton;
