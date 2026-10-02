import React from 'react';
import { StyleSheet, StyleProp, TextStyle, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import CustomText from './CustomText';
import { colors } from '../../utils/colors';

interface GradientTextProps {
  text: any;
  style?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: any;
  color?: any;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  onPress?: () => void;
}

const GradientText: React.FC<GradientTextProps> = ({
  text,
  style,
  textStyle,
  variant = 'body',
  color = [colors.primery, colors.secondary],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  onPress,
}) => {
  const content = (
    <MaskedView
      style={style}
      maskElement={
        <CustomText variant={variant} style={[styles.text, textStyle]}>
          {text}
        </CustomText>
      }
    >
      <LinearGradient
        colors={color}
        start={start}
        end={end}
      // style={{ flex: 1 }}
      >
        {/* Hidden text to maintain proper sizing */}
        <CustomText variant={variant} style={[styles.text, styles.hiddenText, textStyle]}>
          {text}
        </CustomText>
      </LinearGradient>
    </MaskedView>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default GradientText;

const styles = StyleSheet.create({
  text: {
    backgroundColor: 'transparent',
  },
  hiddenText: {
    opacity: 0,
  },
});
