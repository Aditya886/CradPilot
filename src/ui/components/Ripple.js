import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  Pressable,
  StyleSheet,
  Easing,
} from 'react-native';

const RING_COUNT = 2;

const Ripple = ({
  children,
  style,
  onPress,
  rippleColor = '#ffffffff',
  duration = 1300,
  ringWidth = 6,
  pressDelay = 5,
  ...props
}) => {
  const containerRef = useRef(null);

  const progress = useRef(new Animated.Value(0)).current;

  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });

  const [touchPoint, setTouchPoint] = useState({
    x: 0,
    y: 0,
  });

  const handleLayout = e => {
    const { width, height } = e.nativeEvent.layout;

    setLayout({
      width,
      height,
    });
  };

  const startRipple = () => {
    progress.stopAnimation();

    progress.setValue(0);

    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = event => {
    const { pageX, pageY } = event.nativeEvent;

    containerRef.current?.measure(
      (
        x,
        y,
        width,
        height,
        pageXContainer,
        pageYContainer,
      ) => {
        setTouchPoint({
          x: pageX - pageXContainer,
          y: pageY - pageYContainer,
        });

        startRipple();

        if (onPress) {
          setTimeout(() => {
            onPress(event);
          }, pressDelay);
        }
      },
    );
  };

  const rippleSize =
    Math.sqrt(
      layout.width * layout.width +
      layout.height * layout.height,
    ) * 0.3;

  return (
    <Pressable
      onPressOut={handlePressOut}
      {...props}
    >
      <View
        ref={containerRef}
        collapsable={false}
        onLayout={handleLayout}
        style={[styles.container, style]}
      >
        {children}

        {Array.from({ length: RING_COUNT }).map((_, index) => {
          const delay = index * 0.12;

          const ringProgress = progress.interpolate({
            inputRange: [delay, delay + 0.5, 1],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              pointerEvents="none"
              style={[
                styles.ring,
                {
                  width: rippleSize,
                  height: rippleSize,
                  borderRadius: rippleSize / 2,

                  top:
                    touchPoint.y -
                    rippleSize / 2,

                  left:
                    touchPoint.x -
                    rippleSize / 2,

                  borderWidth: ringWidth,
                  borderColor: rippleColor,
                  // backgroundColor: rippleColor,

                  opacity: ringProgress.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [0, 0.8, 0],
                  }),

                  transform: [
                    {
                      scale: ringProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 2.8],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  ring: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
});

export default Ripple;