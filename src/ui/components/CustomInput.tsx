import React, { useRef, useState, useEffect } from 'react';
import {
  I18nManager,
  KeyboardTypeOptions,
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  Animated,
  LayoutChangeEvent,
} from 'react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { assets, icons } from '../../utils/AppImages';
import { colors } from '../../utils/colors';
import { FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font15, font14, font12, font13, font16, font11 } from '../../utils/fontSizes';
import { resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomImage from './CustomImage';
import CustomText from './CustomText';
import { useAppSelector } from '../../utils/hooks';
import Close from '../../assets/images/icons/closeEye.svg';
import Open from '../../assets/images/icons/eye.svg';

export type CustomInputVariant =
  | 'default'
  | 'success'
  | 'error';

const CustomInput = ({
  label,
  placeholder,
  errorText,
  placeholderTextColor,
  showError = false,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  bottomText,
  onFocus,
  onBlur,
  Sufix,
  onChangeText,
  secure = false,
  sliderWidth = '25%',
  Prefix,
  keyboardType = 'default',
  conform = false,
  down = false,
  inputContainerStyle,
  variant,
  onPress,
  containerWidth = resWidth(94),
  // Slider props
  showSlider = false,
  sliderOptions = [],
  onSliderSelect,
  ...props
}: any) => {

  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secure);
  const [sliderOptionWidth, setSliderOptionWidth] = useState(0);
  const [selectedSliderIndex, setSelectedSliderIndex] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const sliderTranslateX = useRef(new Animated.Value(0)).current;

  const toggleSecure = () => setIsSecure(!isSecure);

  const resolvedVariant: CustomInputVariant =
    variant ??
    (
      showError && errorText
        ? 'error'
        : conform
          ? 'success'
          : 'default'
    );

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  /* PICKER MODE */
  const isPickerMode = !!onPress;

  const Wrapper = isPickerMode
    ? TouchableOpacity
    : View;

  const wrapperProps = isPickerMode
    ? {
      onPress,
      activeOpacity: 0.8,
      disabled: props.disabled
    }
    : {};

  // ============= SLIDER LOGIC =============
  // Initialize slider on mount - select first option
  useEffect(() => {
    if (showSlider && sliderOptions && sliderOptions.length > 0) {
      setSelectedSliderIndex(0);
      onSliderSelect?.(sliderOptions[0]);
    }
  }, [sliderOptions, showSlider]);

  const handleSliderPress = (index: number) => {
    setSelectedSliderIndex(index);
    const selectedOption = sliderOptions[index];
    onSliderSelect?.(selectedOption);

    Animated.spring(sliderTranslateX, {
      toValue: index * sliderOptionWidth,
      useNativeDriver: true,
    }).start();
  };

  const handleSliderLayout = (event: LayoutChangeEvent) => {
    const fullWidth = event.nativeEvent.layout.width;
    setSliderOptionWidth(fullWidth / sliderOptions.length);
  };

  // ============= RENDER SLIDER =============
  const renderSlider = () => {
    if (!showSlider || sliderOptions.length === 0) return null;

    return (
      <View style={[styles.sliderContainer, { width: sliderWidth ? sliderWidth : showSlider ? '50%' : '100%' }]}>
        <View style={styles.sliderOuterContainer}>
          <View style={styles.sliderContent} onLayout={handleSliderLayout}>
            <Animated.View
              style={[
                styles.sliderBackground,
                {
                  width: sliderOptionWidth,
                  transform: [{ translateX: sliderTranslateX }],
                },
              ]}
            />
            {sliderOptions.map((option: any, index: any) => (
              <TouchableOpacity
                key={`${option}-${index}`}
                onPress={() => handleSliderPress(index)}
                style={styles.sliderOption}
                activeOpacity={0.7}
              >
                <CustomText
                  style={[
                    styles.sliderText,
                    // selectedSliderIndex === index && styles.sliderSelectedText,
                  ]}
                >
                  {option}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label and Slider Row */}
      <View style={[styles.labelSliderRow, { width: containerWidth }]}>
        <View style={{ width: showSlider ? '50%' : '100%' }}>
          {label ? (
            <CustomText
              style={[
                styles.label,
                labelStyle,
                resolvedVariant === 'success' && {
                  color: colors.btnColor,
                },
              ]}
            >
              {label}
            </CustomText>
          ) : null}
        </View>
        {renderSlider()}
      </View>

      {/* Input Field */}
      <Wrapper
        {...wrapperProps}
        style={[
          styles.inputContainer,

          { width: containerWidth },

          !isFocused &&
          styles.normalBorder,

          resolvedVariant === 'success' &&
          styles.successBorder,

          resolvedVariant === 'error' &&
          styles.errorBorder,

          inputContainerStyle,
          props.disabled && { opacity: 0.5 }
        ]}
      >

        {isFocused ? (
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <View
                style={{
                  flex: 1,
                  borderRadius: resAvarage(100),
                  // borderRadius: resAvarage(1.5),
                  borderWidth: 1.5,
                  borderColor: 'black',
                  backgroundColor: 'transparent',
                }}
              />
            }
          >
            <LinearGradient
              colors={[
                colors.black10,
                colors.btnColor,
                colors.theme80,
              ]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </MaskedView>
        ) : null}

        {Prefix ? (
          <Prefix
            width={resAvarage(3)}
            height={resAvarage(3)}
            fill={colors.theme30}
          />
        ) : null}

        <View
          style={{ flex: 1 }}
          pointerEvents={
            isPickerMode
              ? 'none'
              : 'auto'
          }
        >

          <TextInput
            ref={inputRef}
            editable={!isPickerMode && !props.disabled}
            style={[
              styles.input,
              {
                textAlign: I18nManager.isRTL
                  ? 'right'
                  : 'left',
              },
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={
              placeholderTextColor ? placeholderTextColor :
                colors.black40
            }
            secureTextEntry={isSecure}
            onFocus={handleFocus}
            keyboardType={keyboardType}
            onBlur={handleBlur}
            onChangeText={onChangeText}
            allowFontScaling={false}
            {...props}
          />

        </View>

        {resolvedVariant === 'success' &&
          conform ? (
          <CustomImage
            resizeMode="contain"
            style={styles.toggleIcon}
            source={icons.confirm}
          />
        ) : null}

        {!conform && secure && (
          <TouchableOpacity onPress={toggleSecure}>
            {!isSecure ? <Open width={resAvarage(3)} height={resAvarage(3)} /> :
              <Close width={resAvarage(3)} height={resAvarage(3)} />}
          </TouchableOpacity>
        )}

        {Sufix ? (
          <Sufix
            width={resAvarage(3)}
            height={resAvarage(3)}
          />
        ) : null}

      </Wrapper>

      {bottomText && <CustomText style={[styles.bottomtext, { width: containerWidth - resAvarage(3) }]} >{bottomText}</CustomText>}


      {showError && errorText ? (
        <CustomText
          style={[
            styles.errorText,
            errorStyle,
          ]}
        >
          {errorText}
        </CustomText>
      ) : null}

    </View>
  );
};

const styles = StyleSheet.create({
  bottomtext: {
    fontSize: font12,
    fontFamily: FontRegular,
    color: colors.black80,
    marginTop: scaleSize(6),
    width: resWidth(94),
    alignSelf: "center",
  },
  container: {
    marginVertical: resAvarage(1.5),
  },

  labelSliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: scaleSize(6),
  },

  label: {
    color: colors.black70,
    fontSize: font12,
    textTransform: "uppercase",
    letterSpacing: resAvarage(0.3),
    fontFamily: FontMedium,
    marginLeft: resWidth(1),
    lineHeight: font16 * 1.3
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: resAvarage(8),
    borderRadius: resAvarage(100),
    paddingLeft: resAvarage(2),
    paddingRight: resAvarage(2),
    backgroundColor: colors.white,
    alignSelf: "center",
    position: 'relative',
  },

  normalBorder: {
    borderWidth: 1,
    borderColor: colors.black20,
    borderRadius: resAvarage(100),
  },

  successBorder: {
    borderColor: colors.btnColor,
    borderRadius: resAvarage(100),
  },

  errorBorder: {
    borderColor: colors.redBtnColor,
    borderRadius: resAvarage(100),
  },

  input: {
    flex: 1,
    height: '100%',
    width: '100%',
    fontFamily: FontRegular,
    paddingLeft: resAvarage(1.5),
    fontSize: font15,
    lineHeight: font15 * 1.3,
    paddingVertical: 0,
    color: colors.textBlack,
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
    marginTop: scaleSize(6),
  },

  // ============= SLIDER STYLES =============
  sliderContainer: {
    justifyContent: 'center',
    marginBottom: resAvarage(1)
  },

  sliderOuterContainer: {
    paddingHorizontal: scaleSize(2),
  },

  sliderContent: {
    flexDirection: 'row',
    backgroundColor: colors.lightBgColor,
    borderRadius: resWidth(2),
    overflow: 'hidden',
    position: 'relative',
  },

  sliderBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.theme70,
    borderRadius: resWidth(2),
    zIndex: 0,
  },

  sliderOption: {
    flex: 1,
    paddingVertical: scaleSize(5),
    marginHorizontal: resWidth(0.5),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  sliderText: {
    color: colors.textBlack,
    fontFamily: FontMedium,
    fontSize: font12,
    lineHeight: font12 * 1.3
  },

  sliderSelectedText: {
    color: colors.textBlack,
  },
});

export default CustomInput;