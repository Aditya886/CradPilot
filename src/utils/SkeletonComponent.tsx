import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SkeletonComponent = ({ width, height, style, borderRadius = 10 }: any) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500, // Slowed down for a smoother shimmer
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      -Dimensions.get('window').width,
      Dimensions.get('window').width,
    ],
  });

  const shimmerWidth = width * 0.8;

  const styles = StyleSheet.create({
    container: {
      borderRadius,
      overflow: 'hidden',
    },
    backgroundView: {
      flex: 1,
      // backgroundColor: '#DDEDED50', // Very light greenish background
      // backgroundColor: '#E8FEE150', // Very light greenish background
      // backgroundColor: '#B9E0ED50', // Very light greenish background
      backgroundColor: '#D2DBFB50', // Very light greenish background
      // backgroundColor: '#C5FFFE50', // Very light greenish background
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
                '#E8FEE110',
                '#B9E0ED30',
                '#E8FEE150',
                '#DDEDED80',
                '#D2DBFB50',
                '#C5FFFE30',
                '#D2DBFB10',
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

export default SkeletonComponent;
