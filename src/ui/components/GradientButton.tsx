import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
  I18nManager,
  Platform,
} from 'react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

import { resAvarage, scaleSize } from '../../utils/responsive';
import { font12, font14, font15, font17 } from '../../utils/fontSizes';
import { colors } from '../../utils/colors';
import { FontBold, FontRegular } from './../../utils/fontFamily';

import CustomText from './CustomText';
import CustomImage from './CustomImage';
import { icons } from '../../utils/AppImages';
import GradientText from './GradiantText';
import CommonRippleButton from './CommonRippleButton';

/* ---------------------------------- */
/* Props */
/* ---------------------------------- */
interface GradientButtonProps {
  title?: string;
  showError?: boolean;
  style?: StyleProp<ViewStyle>;
  Pre?: any;
  Sufix?: any;
  textStyle?: StyleProp<TextStyle>;
  onPress?: any;
  //   style?: StyleProp<ViewStyle>;
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */
const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  style,
  Pre,
  Sufix,
  onPress,
  textStyle,
  //   style,
  ...props
}) => {

  return (
    // <View style={[styles.container, style]}>
    <CommonRippleButton
      rippleColor={colors.btnColor}
      onPress={onPress}
      style={[
        styles.inputContainer,
        style,
      ]}>
      {/* Gradient Border Overlay - Only visible when focused */}
      <MaskedView
        style={StyleSheet.absoluteFillObject}
        maskElement={
          <View
            style={{
              flex: 1,
              borderRadius: resAvarage(100),
              borderWidth: 1.5,
              borderColor: 'black',
              backgroundColor: 'transparent',
            }}
          />
        }>
        <LinearGradient
          colors={[colors.primery, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </MaskedView>

      {/* Input Content - Always rendered in the same position */}
      {Pre && (
        <Pre
          width={resAvarage(3)}
          height={resAvarage(3)}
          style={{ marginRight: scaleSize(8) }}
        />
      )}

      {/* <CustomText>{title}</CustomText> */}
      <GradientText style={[styles.text, textStyle]} text={title} />
      {Sufix && (
        <Sufix
          width={resAvarage(3)}
          height={resAvarage(3)}
        />
      )}
      {/* </View> */}
    </CommonRippleButton>
  );
};

export default GradientButton;

/* ---------------------------------- */
/* Styles */
/* ---------------------------------- */
const styles = StyleSheet.create({
  text: {
    fontSize: font15,
    fontFamily: FontBold,
    // textAlign:"center",
    marginTop: Platform.OS === 'ios' ? scaleSize(5) : 0
  },
  container: {
    marginVertical: scaleSize(1.5),
  },
  label: {
    fontSize: font17,
    color: colors.textBlack,
    fontFamily: FontBold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    minHeight: resAvarage(8),
    borderRadius: resAvarage(100),
    paddingLeft: resAvarage(2),
    paddingRight: resAvarage(2),
    marginTop: scaleSize(10),
    position: 'relative',
    overflow: 'hidden'
  },
  normalBorder: {
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  conformBorder: {
    borderColor: colors.btnColor,
  },
  errorBorder: {
    borderColor: colors.textRed,
  },
  input: {
    flex: 1,
    height: '100%',
    width: '100%',
    fontFamily: FontRegular,
    fontSize: font15,
    marginLeft: resAvarage(1),
    paddingVertical: 0,
    color: colors.textWhite,
    zIndex: 1,
  },
  Pre: {
    zIndex: 1,
  },
  toggleIcon: {
    width: scaleSize(23),
    height: scaleSize(23),
    marginRight: scaleSize(10),
    zIndex: 1,
  },
  errorText: {
    color: colors.textRed,
    fontSize: font12,
    marginTop: scaleSize(6),
  },
});