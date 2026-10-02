import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from './colors';

const LightSkeletonComponent = ({ width, height, style, borderRadius = 10 }: any) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    // outputRange: [
    //   -width,
    //   width,
    // ],
    outputRange: [
      -Dimensions.get('window').width,
      Dimensions.get('window').width,
    ],
  });

  const shimmerWidth = width * 0.7;

  const styles = StyleSheet.create({
    container: {
      borderRadius,
      overflow: 'hidden',
    },
    backgroundView: {
      flex: 1,
      backgroundColor: '#ffffff70', // Dark green background
    },
    shimmerWrapper: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    animatedGradient: {
      ...StyleSheet.absoluteFill,
    },
    gradient: {
      flex: 1,
      opacity: 0.8,
    },
  });

  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.backgroundView}>
        <View style={styles.shimmerWrapper}>
          <Animated.View
            style={[
              styles.animatedGradient,
              {
                width: shimmerWidth,
                transform: [{ translateX }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.3)',   // transparent white
                'rgba(255, 255, 255, 0.5)',
                'rgba(255, 255, 255, 0.7)',
                'rgba(255, 255, 255, 0.9)',
                'rgba(255, 255, 255, 0.7)',
                'rgba(255, 255, 255, 0.5)',
                'rgba(255, 255, 255, 0.3)',   // transparent white
              ]}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default LightSkeletonComponent;
