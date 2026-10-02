import React, { useRef } from 'react';
import {
    Text,
    View,
    StyleSheet,
    GestureResponderEvent,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { colors } from '../../utils/colors';
import { resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import { font17, font19 } from '../../utils/fontSizes';
import CommonRippleButton from './CommonRippleButton';
import CustomImage from './CustomImage';
import { FontBold, FontRegular } from './../../utils/fontFamily';
import CustomLoader from './CustomLoader';
import { icons } from '../../utils/AppImages';
import CustomText from './CustomText';
import LinearGradient from 'react-native-linear-gradient';
import GradientBorder from './GradientBorder';

interface CustomButtonProps {
    title: string;
    onPress?: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    loading?: boolean;
    style?: object;
    innerstyle?: object;
    textStyle?: object;
    loadingColor?: string;
    icon?: React.ReactNode;
    Pre?: any;
    sufix?: any;
    linear?: any
    buttonSize?: any;
    rippleColor?: any;
    borderRadius?: any;
    rounded?: boolean;
    size?: 'small' | 'medium' | 'large';
    backgroundColor?: string;
    textColor?: string;
    throttleDelay?: number;
}

const GradientBorderButton: React.FC<CustomButtonProps> = ({
    title,
    onPress,
    disabled = false,
    loading = false,
    style,
    buttonSize,
    textStyle,
    innerstyle,
    rippleColor,
    loadingColor = '#fff',
    icon,
    linear = true,
    Pre,
    sufix,
    borderRadius = resAvarage(100),
    rounded = true,
    size = 'medium',
    backgroundColor = colors.bgColor,
    textColor = colors.primery,
    throttleDelay = 800,
}) => {
    const isThrottled = useRef(false);

    const getButtonSize = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: scaleSize(10), paddingHorizontal: scaleSize(12) };
            case 'large':
                return { paddingVertical: scaleSize(20), paddingHorizontal: scaleSize(20) };
            default:
                return { paddingVertical: scaleSize(16), paddingHorizontal: scaleSize(15) };
        }
    };

    const handlePress = (event: GestureResponderEvent) => {
        if (isThrottled.current || disabled || loading) return;

        isThrottled.current = true;
        onPress?.(event);

        setTimeout(() => {
            isThrottled.current = false;
        }, throttleDelay);
    };


    // const borderRadius = rounded ?  : scaleSize(10);

    return (
        <View style={[styles.wrapper, { borderRadius }, innerstyle]}>
            <CommonRippleButton
                rippleColor={rippleColor ? rippleColor : colors.primery}
                onPress={handlePress}
                style={{ borderRadius }}
                rippleOpacity={0.4}
            >
                {/* 🔥 Gradient Border Layer */}
                <LinearGradient
                    colors={[colors.primery, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius,
                        // 👈 border thickness
                    }}
                >
                    {/* ✅ Inner Button */}
                    <View
                        style={{
                            borderRadius,
                            margin: 1.5,
                            backgroundColor: backgroundColor ? backgroundColor : colors.bgColor, // 👈 your button bg
                        }}
                    >
                        <View style={[styles.buttonContent, getButtonSize(), buttonSize, style]}>
                            {loading ? (
                                <CustomLoader />
                            ) : (
                                <View style={styles.innerContent}>
                                    {Pre && (
                                        <Pre
                                            width={resWidth(5)}
                                            height={resWidth(5)}
                                        />
                                    )}

                                    <CustomText
                                        variant="button"
                                        color={textColor}
                                        style={[styles.text, textStyle]}
                                    >
                                        {title}
                                    </CustomText>

                                    {sufix && (
                                        <CustomImage
                                            resizeMode="contain"
                                            style={styles.eye}
                                            source={sufix}
                                        />
                                    )}

                                    {icon && !sufix && (
                                        <CustomImage
                                            resizeMode="contain"
                                            style={styles.eye}
                                            source={icons.doubleNext}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </CommonRippleButton>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: scaleSize(5),
        overflow: "hidden"
    },
    rippleButton: {
        overflow: 'hidden',
    },
    gradient: {
        alignSelf: 'stretch',
    },
    buttonContent: {
        justifyContent: 'center',
        alignItems: 'center',
        width: resWidth(88)
    },
    innerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: "center",
        includeFontPadding: false,
        letterSpacing: resWidth(0.1),
        ...(Platform.OS === 'ios' && {
            lineHeight: font17 * 1.2,
        }),
    },
    eye: {
        width: resWidth(5),
        height: resWidth(5),
        marginLeft: scaleSize(8),
    },
    pre: {
        width: resWidth(5),
        height: resWidth(5),
        marginRight: scaleSize(8),
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default GradientBorderButton;
