import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from "../../utils/colors";

interface Props {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    borderRadius?: number;
    color?: string[];
    onPress?: () => void;
}

const GradientBox = ({
    children,
    style,
    onPress,
    borderRadius = 100,
    color = [colors.primery, colors.secondary],
}: Props) => {
    return (
        <LinearGradient
            colors={color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, { borderRadius }, style]}
        >
            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                {children}
            </TouchableOpacity>
        </LinearGradient>
    );
};

export default GradientBox;

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});