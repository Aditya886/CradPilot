import React from 'react';
import { Text, TextProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { scaleFontSize } from '../../utils/responsive';
import { FontBold, FontRegular } from './../../utils/fontFamily';
import { colors } from '../../utils/colors';

interface CustomTextProps extends TextProps {
  children: React.ReactNode; // Text to display
  style?: StyleProp<TextStyle>; // Additional custom styles for the text
  type?:
  | 'heading'
  | 'heading30'
  | 'subheading'
  | 'body'
  | 'caption'
  | 'label'
  | 'small'
  | 'title';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

const typeStyles = StyleSheet.create({
  heading: {
    fontSize: scaleFontSize(24),
    fontWeight: 'bold',
    fontFamily: FontBold,
  },
  heading30: {
    fontSize: scaleFontSize(30),
    // fontWeight: '400',
    fontFamily: FontRegular,
  },
  subheading: {
    fontSize: scaleFontSize(20),
    fontFamily: FontBold,
    // fontWeight: '600',
  },
  body: {
    fontSize: scaleFontSize(14),
    // fontWeight: 'normal',
    fontFamily: FontRegular,
  },
  caption: {
    fontSize: scaleFontSize(12),
    fontFamily: FontRegular,
    // fontWeight: '400',
  },
  label: {
    fontSize: scaleFontSize(14),
    fontFamily: FontRegular,

    // fontWeight: '500',
  },
  small: {
    fontSize: scaleFontSize(10),
    fontWeight: '300',
  },
  title: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
  },
});

const CustomText: React.FC<CustomTextProps> = ({
  children,
  style,
  onPress,
  type = 'body',
  color = colors.textBlack,
  textAlign = 'left',
  ...props
}) => {
  return (
    <Text
      onPress={onPress}
      style={[
        typeStyles[type],
        { color, textAlign }, // Dynamic styles
        style, // Additional custom styles
      ]}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      {...props}>
      {children}
    </Text>
  );
};

export default CustomText;
