import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  I18nManager,
  Platform,
} from 'react-native';
import { resAvarage, resHeight, resWidth, scaleFontSize, scaleSize } from '../../utils/responsive';
import { font14, font15 } from '../../utils/fontSizes';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular } from './../../utils/fontFamily';
import CustomText from './CustomText';

interface AutoExpandingInputProps extends TextInputProps {
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
  inputContainerStyle?: any;
  value?: string;
}

const AutoExpandingInput: React.FC<AutoExpandingInputProps> = ({
  placeholder,
  style,
  label,
  labelStyle,
  inputStyle,
  onFocus,
  onBlur,
  onChangeText,
  inputContainerStyle,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(scaleSize(110)); // Initial height for 4 lines

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const maxHeight = resWidth(66.6);
    const minHeight = scaleSize(110); // Minimum height for 4 lines

    setInputHeight(Math.max(Math.min(height, maxHeight), minHeight));
  };

  const isAtMaxHeight = inputHeight >= resWidth(66.6);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <CustomText
          style={[
            styles.label,
            labelStyle,
          ]}>
          {label}
        </CustomText>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          inputContainerStyle,
          { minHeight: inputHeight + scaleSize(16) },
        ]}>
        {/* Custom Placeholder for iOS/Animated text support */}
        {Platform.OS === 'ios' && placeholder && !value && (
          <View
            pointerEvents="none"
            style={styles.placeholderContainer}
            onLayout={(e) => {
              const { height } = e.nativeEvent.layout;
              const maxHeight = resWidth(66.6);
              const minHeight = scaleSize(80);
              setInputHeight(Math.max(Math.min(height, maxHeight), minHeight));
            }}
          >
            <CustomText style={[styles.placeholder, inputStyle]}>
              {placeholder}
            </CustomText>
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              textAlign: I18nManager.isRTL ? 'right' : 'left',
              height: Platform.OS === 'ios' ? undefined : inputHeight,
              minHeight: Platform.OS === 'ios' ? inputHeight : undefined,
            },
            inputStyle,
          ]}
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          placeholder={Platform.OS === 'android' ? placeholder : ''} // Only native on Android
          placeholderTextColor={colors.textBlack41}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={onChangeText}
          onContentSizeChange={handleContentSizeChange}
          value={value}
          textAlignVertical="top"
          {...props}
          multiline={true}
          scrollEnabled={isAtMaxHeight} // Enable scroll only when max height is hit
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: scaleSize(1.5),
    marginBottom: scaleSize(1.5),
  },
  label: {
    fontFamily: FontMedium,
    fontSize: font15,
    color: colors.textWhite,
    marginBottom: resAvarage(2),
    marginTop: resAvarage(1),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.white10,
    borderRadius: 8,
    paddingHorizontal: scaleSize(15),
    paddingVertical: scaleSize(10),
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    fontFamily: FontRegular,
    fontSize: font14,
    color: colors.textWhite,
    maxHeight: resWidth(66.6), // 2/3 of width
    paddingVertical: 0,
    paddingHorizontal: 0,
    zIndex: 1, // Above placeholder
  },
  focusedContainer: {
    borderColor: colors.white20,
  },
  placeholderContainer: {
    position: 'absolute',
    left: scaleSize(8),
    top: scaleSize(8),
    right: scaleSize(8),
    zIndex: 0,
  },
  placeholder: {
    color: colors.textBlack41,
    lineHeight: font14 * 1.4, // Match TextInput's natural line height
  },
});

export default AutoExpandingInput;
