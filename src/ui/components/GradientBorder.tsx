import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface GradientBorderProps {
  children?: React.ReactNode;

  /** Outer container style */
  style?: StyleProp<ViewStyle>;

  /** Inner container style */
  innerStyle?: StyleProp<ViewStyle>;

  /** Gradient colors */
  colors?: string[];

  /** Border thickness */
  borderWidth?: number;

  /** Border radius */
  borderRadius?: number;

  /** Inner background color */
  backgroundColor?: string;

  /** Gradient direction */
  start?: { x: number; y: number };
  end?: { x: number; y: number };

  /** Press */
  onPress?: (event: GestureResponderEvent) => void;

  disabled?: boolean;
  activeOpacity?: number;
}

export default function GradientBorder({
  children,
  style,
  innerStyle,
  colors = ["#FF0080", "#7928CA"],
  borderWidth = 1.5,
  borderRadius = 20,
  backgroundColor = "#FFF",
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  onPress,
  disabled = false,
  activeOpacity = 0.8,
}: GradientBorderProps) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[
          styles.gradientBorder,
          {
            borderRadius,
            padding: borderWidth,
          },
        ]}
      >
        <View
          style={[
            styles.innerContainer,
            {
              borderRadius: borderRadius - borderWidth,
              backgroundColor,
            },
            innerStyle,
          ]}
        >
          {children}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    overflow: "hidden",
  },

  innerContainer: {
    width: "100%",
    height: "100%",
  },
});