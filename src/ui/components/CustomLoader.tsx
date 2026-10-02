import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { scaleSize } from '../../utils/responsive';
import { colors } from '../../utils/colors';

const CustomLoader = ({loadingColor}:any) => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 100),
          Animated.timing(dot, {
            toValue: -10,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      )
    );

    Animated.stagger(100, animations).start();
  }, []);

  return (
    <View style={styles.container}>
      {dots.map((translateY, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: loadingColor,
              transform: [{ translateY }],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default CustomLoader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: scaleSize(20),
    // marginVertical: scaleSize(20),
  },
  dot: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    // backgroundColor: colors.bgWhite,
    backgroundColor: colors.btnColor,
    marginHorizontal: scaleSize(5),
  },
});
