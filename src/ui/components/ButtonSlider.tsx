import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { font17, font14, font12, font11, font16 } from '../../utils/fontSizes';
import CustomText from './CustomText';
import { FontBold, FontMedium, FontSemiBold } from '../../utils/fontFamily';
import LinearGradient from 'react-native-linear-gradient';
import BlurView from '@sbaiahmed1/react-native-blur';
import { colors } from '../../utils/colors';
import { resWidth, resAvarage, scaleSize } from '../../utils/responsive';


interface ButtonSliderProps {
  load?: boolean;
  onSelect?: (option: string) => void;
  options: string[];
  settingName?: string;
  label?: string;
  sliderWidth?: any;
  value?: string;
  // setDate?: (dateRange: { startDate: string; endDate: string }) => void;
}

const ButtonSlider: React.FC<ButtonSliderProps> = ({
  load,
  onSelect,
  options,
  settingName,
  label,
  sliderWidth,
  value,
  // setDate,
}) => {

  const getInitialIndex = (): number => {
    if (!options || options.length < 2) return 0;
    if (value !== undefined) {
      const idx = options.indexOf(value);
      if (idx !== -1) return idx;
    }
    return 0;
  };

  const [selectedIndex, setSelectedIndex] = useState<number>(getInitialIndex);
  const [optionWidth, setOptionWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const initialized = useRef(false);

  const styles = StyleSheet.create({
    title: {
      color: colors.black70,
      fontSize: font12,
      textTransform: "uppercase",
      letterSpacing: resAvarage(0.3),
      fontFamily: FontMedium,
      marginLeft: resWidth(1),
      lineHeight: font16 * 1.3,
      marginBottom: resAvarage(1)
    },
    main: {
      alignSelf: "center",
    },
    outerContainer: {
      width: resAvarage(28),
      borderWidth: 1,
      borderColor: colors.black20,
      borderRadius: resAvarage(5),
      elevation: 3,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: colors.white
    },
    long: {
      width: resWidth(70),
    },
    container: {
      flexDirection: 'row',
      // backgroundColor: colors.bgGray,
      paddingVertical: resAvarage(0.5),
      borderRadius: resAvarage(5),
      overflow: 'hidden',
      position: 'relative',
    },
    sliderWrapper: {
      position: 'absolute',
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
      borderRadius: resAvarage(2.5),
      margin: resAvarage(0.5),
      zIndex: 0,
    },
    slider: {
      flex: 1,
      // width: resWidth(15),
      borderRadius: resAvarage(100),
      // marginVertical: resAvarage(0.5),
      // marginLeft: resAvarage(0.5),
      marginRight: resAvarage(1.5),
    },
    option: {
      flex: 1,
      paddingVertical: scaleSize(13),
      marginHorizontal: resWidth(1),
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    text: {
      color: colors.black,
      fontFamily: FontSemiBold,
      fontSize: font11,
    },
    selectedText: {
      color: colors.white,
    },
  });

  // 🔹 Init only once AFTER width is known
  useEffect(() => {
    if (initialized.current) return;
    if (!optionWidth || options.length < 2) return;

    initialized.current = true;

    const defaultIndex = getInitialIndex();
    setSelectedIndex(defaultIndex);

    onSelect?.(options[defaultIndex]);

    translateX.setValue(defaultIndex * optionWidth);
  }, [optionWidth, options]);

  // Synchronize index when value changes from parent
  useEffect(() => {
    if (value !== undefined && optionWidth > 0) {
      const idx = options.indexOf(value);
      if (idx !== -1 && idx !== selectedIndex) {
        setSelectedIndex(idx);
        Animated.spring(translateX, {
          toValue: idx * optionWidth,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }).start();
      }
    }
  }, [value, optionWidth, options]);

  const handlePress = (index: number) => {
    if (index === selectedIndex) return;

    setSelectedIndex(index);

    const option = options[index];

    onSelect?.(option);

    Animated.spring(translateX, {
      toValue: index * optionWidth,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const fullWidth = e.nativeEvent.layout.width;
    // const fullWidth = resWidth(50);
    setOptionWidth(fullWidth / options.length);
  };

  if (load) return null;

  return (
    <View style={styles.main}>
      {label && <CustomText style={styles.title}>{label}</CustomText>}

      <View style={[styles.outerContainer, sliderWidth && { width: sliderWidth }]}>
        <View style={styles.container} onLayout={onLayout}>
          {/* <BlurView
            blurType={'light'}
            blurAmount={15}
            style={[StyleSheet.absoluteFill]}
          /> */}
          {optionWidth > 0 && (
            <Animated.View
              style={[
                styles.sliderWrapper,
                {
                  width: optionWidth,
                  transform: [{ translateX }]
                },
              ]}
            >
              <LinearGradient
                colors={[colors.black, colors.black, colors.black]}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={styles.slider}
              />
            </Animated.View>
          )}

          {options.map((opt, index) => (
            <TouchableWithoutFeedback key={opt} onPress={() => handlePress(index)}>
              <View style={styles.option}>
                <CustomText
                  style={[
                    styles.text,
                    selectedIndex === index && styles.selectedText,
                  ]}
                >
                  {opt}
                </CustomText>
              </View>
            </TouchableWithoutFeedback>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ButtonSlider;
