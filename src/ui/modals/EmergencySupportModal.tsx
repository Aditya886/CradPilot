import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native';
import React, { useEffect, useRef } from 'react';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
import { font15, font18 } from '../../utils/fontSizes';
import { FontBold, FontMedium, FontRegular } from '../../utils/fontFamily';
import CustomButton from '../components/CustomButton';

export default function EmergencySupportModal({ show, setShow }: any) {
    const transformY = useRef(new Animated.Value(resHeight(100))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (show) {
            // Fade in backdrop
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Slide up sheet/modal
            Animated.timing(transformY, {
                duration: 350,
                useNativeDriver: true,
                toValue: 0,
            }).start();
        }
    }, [show]);

    const close = () => {
        // Fade out backdrop
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();

        // Slide down sheet/modal
        Animated.timing(transformY, {
            toValue: resHeight(100),
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShow(false));
    };

    return (
        <Modal
            transparent
            visible={show}
            animationType="none"
            onRequestClose={close}
        >
            <TouchableWithoutFeedback onPress={close}>
                <Animated.View style={[styles.main, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.box,
                                { transform: [{ translateY: transformY }] } as ViewStyle,
                            ]}
                        >
                            <CustomText style={styles.title}>Emergency Support</CustomText>

                            <CustomText style={styles.message1}>
                                If you’re in immediate distress, please reach out for support right away.
                            </CustomText>

                            <CustomText style={styles.message2}>
                                You can call the <CustomText style={styles.highlightRed}>988</CustomText> Crisis Lifeline (USA) or contact a local emergency service in your area.
                            </CustomText>

                            <CustomButton
                                style={styles.okButton}
                                backgroundColor={colors.lightBgColor}
                                textColor={colors.textWhite}
                                title={"Ok"}
                                onPress={close}
                            />
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#000000B0',
        justifyContent: 'flex-end', // Center modal on screen
        alignItems: 'center',
    },
    box: {
        backgroundColor: colors.bgColor, // Match dark visual color of modal exactly
        borderRadius: scaleSize(16),
        borderWidth: 1,
        borderColor: "#5D6071",
        borderBottomWidth: 0,
        borderLeftColor: "#5d607185",
        borderTopColor: "#5d607185",
        borderRightColor: "#5d607185",
        width: resWidth(100),
        paddingVertical: resAvarage(3.5),
        paddingHorizontal: resAvarage(3.5),
        alignItems: 'center',
    },
    title: {
        fontFamily: FontMedium,
        fontSize: font18,
        lineHeight: font18 * 1.3,
        color: colors.textWhite,
        textAlign: 'center',
        marginBottom: resAvarage(2.5),
    },
    message1: {
        fontFamily: FontRegular,
        fontSize: font15,
        lineHeight: font15 * 1.5,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'left',
        marginBottom: resAvarage(2.5),
    },
    message2: {
        fontFamily: FontRegular,
        fontSize: font15,
        lineHeight: font15 * 1.5,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'left',
        marginBottom: resAvarage(3.5),
    },
    highlightRed: {
        color: colors.textRed,
        fontFamily: FontBold,
    },
    okButton: {
        width: resWidth(20),
        paddingVertical: resAvarage(1.2),
        borderRadius: scaleSize(8),
    },
});
