import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../../../../utils/colors';

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
    progress?: number; // 0 to 1
    backgroundColor?: string;
    progressColor?: string;
}

export default function CircularProgress({
    size = 100,
    strokeWidth = 14,
    progress = 0,
    backgroundColor = '#FFFFFF',
    progressColor = colors.theme,
}: CircularProgressProps) {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedProgress = Math.min(1, Math.max(0, progress));
    const strokeDashoffset = circumference * (1 - clampedProgress);

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                {/* Background Track */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress Arc */}
                {clampedProgress > 0 && (
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        transform={`rotate(-90 ${center} ${center})`}
                    />
                )}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({});
