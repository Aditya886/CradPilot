import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
} from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ToastConfig, ToastManagerRef } from './ToastManager';
import { colors } from '../colors';
import { FontBold } from '../fontFamily';
import { font14, font12, font15 } from '../fontSizes';
import { resAvarage, resWidth } from '../responsive';

const getInitialTranslateY = (position: 'top' | 'top') => {
  return position === 'top'
    ? -resAvarage(100)
    : resAvarage(100);
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'error':
      return '#ff2d2dff';
    case 'success':
      return colors.theme;
    case 'base':
      return colors.btnColor;
    case 'info':
      return colors.black;
    case 'test':
      return colors.black;
    default:
      return '#FF0000'; // Default to error color per user request
  }
};

const GlobalToast = forwardRef<ToastManagerRef>((_, ref) => {
  const [toastConfig, setToastConfig] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  const translateY = useRef(new Animated.Value(-100)).current; // Start off-screen
  const opacity = useRef(new Animated.Value(0)).current;
  const animatedWidth = useRef(new Animated.Value(resWidth(10))).current; // Dot size
  const [contentStage, setContentStage] = useState<'none' | 'test' | 'actual'>('none');

  useImperativeHandle(ref, () => ({
    show: (config: ToastConfig) => {
      setToastConfig(config);
      setVisible(true);
    },
    hide: () => hideToast(),
  }));

  useEffect(() => {
    if (visible && toastConfig) {
      showToast();

      const timer = setTimeout(
        hideToast,
        3000,
      );

      return () => clearTimeout(timer);
    }
  }, [visible, toastConfig]);

  const showToast = () => {
    translateY.stopAnimation();
    opacity.stopAnimation();
    animatedWidth.stopAnimation();

    const isTop = toastConfig.position !== 'top';
    translateY.setValue(isTop ? -resAvarage(15) : Platform.OS == 'ios' ? resAvarage(20) : resAvarage(15));
    opacity.setValue(0);
    animatedWidth.setValue(resWidth(10));
    setContentStage('none');

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isTop ? Platform.OS == 'ios' ? resAvarage(10) : Platform.Version >= "34" ? resAvarage(7) : resAvarage(10) : -resAvarage(7),
        useNativeDriver: false,
        friction: 8,
        tension: 130,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(100),
      Animated.timing(animatedWidth, {
        toValue: resWidth(30),
        duration: 120,
        useNativeDriver: false,
      }),
      Animated.delay(500),
      Animated.spring(animatedWidth, {
        toValue: resWidth(90),
        tension: 60,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start();

    setTimeout(() => setContentStage('test'), 120);
    setTimeout(() => setContentStage('actual'), 750);
  };

  const hideToast = () => {
    if (!toastConfig) return;
    setContentStage('none');

    Animated.spring(animatedWidth, {
      toValue: resWidth(10),
      tension: 60,
      friction: 7,
      useNativeDriver: false,
    }).start();

    const isTop = toastConfig.position !== 'top';
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: isTop ? -resAvarage(15) : resAvarage(15),
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      setVisible(false);
      setToastConfig(null);
      setContentStage('none');
    });
  };

  if (!visible || !toastConfig) return null;

  const typeColor = getTypeColor(toastConfig.type);
  const bgColor = contentStage === 'none' ? typeColor : colors.bgColor;

  return (
    <Animated.View
      style={[
        styles.main,
        toastConfig.position === 'top' && styles.top,
        {
          transform: [{ translateY }],
          opacity,
          width: animatedWidth,
          borderRadius: resWidth(100),
          backgroundColor: bgColor,
          borderColor: typeColor,
          borderLeftWidth: contentStage !== 'none' ? 5 : 0,
          borderRightWidth: contentStage !== 'none' ? 5 : 0,
        },
      ]}
    >
      <View style={styles.backgroundImage}>
        <View style={styles.textBox}>
          {contentStage === 'test' ? (
            <Text style={[styles.heading, { color: 'black' }]}>
              {toastConfig.type.charAt(0).toUpperCase() + toastConfig.type.slice(1)}
            </Text>
          ) : contentStage === 'actual' ? (
            <>
              <View style={{ marginLeft: resAvarage(2) }}>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.heading,
                    { color: 'black' },
                    !toastConfig.text2 && styles.singleLine,
                  ]}
                >
                  {toastConfig.text1}
                </Text>

                {toastConfig.text2 && (
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.des,
                    ]}
                  >
                    {toastConfig.text2}
                  </Text>
                )}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
});

export default GlobalToast;

const styles = StyleSheet.create({
  main: {
    height: resWidth(10),
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    overflow: 'hidden',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { height: 2, width: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderWidth: 0.2
  },
  // top: {
  //   top: resAvarage(10),
  // },
  top: {
    top: resAvarage(0),
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  imageStyle: {
    borderRadius: resAvarage(2),
  },
  textBox: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  heading: {
    fontSize: font14,
    fontFamily: FontBold,
    color: "black",
    lineHeight: font14 * 1.3,
    // width: resAvarage(70),
  },
  singleLine: {
    textAlign: 'center',
    textAlignVertical: 'center'
    // margintop: resAvarage(3.8),
  },
  des: {
    marginTop: resAvarage(0.5),
    fontSize: font12,
    color: "black",
    fontFamily: FontBold,
    lineHeight: font14,
    textAlign: "center",
    textAlignVertical: 'center'
  },
});
