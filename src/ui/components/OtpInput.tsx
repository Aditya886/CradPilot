import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Animated, Platform } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { font16, font17, font18, font20, font21 } from '../../utils/fontSizes';
import { colors } from '../../utils/colors';
import { resAvarage, scaleSize } from './../../utils/responsive';
import { FontBold, FontMedium, FontRegular } from '../../utils/fontFamily';

const OtpInput = ({
  length = 6,
  onOtpComplete,
}: {
  length?: number;
  onOtpComplete: (otp: string) => void;
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<TextInput[]>([]);
  const animatedScales = useRef<Animated.Value[]>(
    Array(length).fill(null).map(() => new Animated.Value(1))
  ).current;

  const animateBox = (index: number) => {
    Animated.sequence([
      Animated.timing(animatedScales[index], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleChange = (value: string, index: number) => {
    // Check if it's a paste operation (multiple characters)
    if (value.length > 1) {
      const numbers = value.replace(/[^0-9]/g, '');

      if (numbers.length === 0) return;

      const updatedOtp = [...otp];

      // If pasted text is full length, fill from beginning
      // Otherwise fill from current index
      const fillFromIndex = numbers.length >= length ? 0 : index;

      for (let i = 0; i < numbers.length && fillFromIndex + i < length; i++) {
        updatedOtp[fillFromIndex + i] = numbers[i];
        animateBox(fillFromIndex + i);
      }

      setOtp(updatedOtp);

      // Focus the next empty input or the last input
      const nextEmptyIndex = updatedOtp.findIndex((digit) => digit === '');
      if (nextEmptyIndex !== -1) {
        inputs.current[nextEmptyIndex]?.focus();
      } else {
        inputs.current[length - 1]?.focus();
      }

      // Check if OTP is complete
      if (updatedOtp.every((digit) => digit !== '')) {
        onOtpComplete(updatedOtp.join(''));
      }
      return;
    }

    // Single character input
    if (value !== '' && isNaN(Number(value))) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value) {
      animateBox(index);

      if (index < length - 1) {
        inputs.current[index + 1]?.focus();
      }
    }

    if (updatedOtp.every((digit) => digit !== '')) {
      onOtpComplete(updatedOtp.join(''));
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index]) {
      if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => {
        const scale = animatedScales[index];
        const isFilled = !!digit;
        const isFocused = focusedIndex === index;
        const showGradient = isFilled || isFocused;

        return (
          <Animated.View
            key={index}
            style={[
              styles.animatedBox,
              {
                transform: [{ scale }]
              },
              !showGradient && {
                borderColor: colors.borderColor,
                borderWidth: 2,
              }
            ]}
          >
            {/* Gradient Border - Only visible when filled or focused */}
            {showGradient && (
              <MaskedView
                style={StyleSheet.absoluteFill}
                maskElement={
                  <View
                    style={{
                      flex: 1,
                      borderRadius: scaleSize(9),
                      borderWidth: 2,
                      borderColor: 'black',
                      backgroundColor: 'transparent',
                    }}
                  />
                }>
                <LinearGradient
                  colors={[colors.oceanBlueBg, colors.oceanBlueBg]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1 }}
                />
              </MaskedView>
            )}

            <TextInput
              ref={(ref) => { (inputs.current[index] = ref!) }}
              style={[styles.otpInput]}
              cursorColor={colors.oceanBlueBg}
              value={digit}
              allowFontScaling={false}
              maxFontSizeMultiplier={1}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              keyboardType="number-pad"
              maxLength={length}
              returnKeyType="done"
              textContentType="oneTimeCode"
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: scaleSize(5),
  },
  animatedBox: {
    width: resAvarage(9),
    height: resAvarage(9),
    marginHorizontal: scaleSize(2),
    // marginTop: scaleSize(8),
    borderRadius: scaleSize(9),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  otpInput: {
    fontSize: font17,
    lineHeight: font17*1.2,
    fontFamily: FontMedium,
    color: colors.textWhite,
    textAlign: 'center',
    textAlignVertical: "center",
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});

export default OtpInput;