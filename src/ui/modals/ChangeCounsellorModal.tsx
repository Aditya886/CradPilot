import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
import { font15, font18 } from '../../utils/fontSizes';
import { FontMedium, FontRegular } from '../../utils/fontFamily';
import CustomButton from '../components/CustomButton';
import SendIcon from '../../assets/images/icons/send.svg';

export default function ChangeCounsellorModal({ show, setShow, onSend }: any) {
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

    const handleSend = () => {
        close();
        if (onSend) {
            onSend();
        }
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
                            <CustomText style={styles.title}>Change Counsellor</CustomText>

                            <CustomText style={styles.message1}>
                                If you’d like to work with a different counsellor, we can help with that.
                            </CustomText>

                            <CustomText style={styles.message2}>
                                Your request will be shared with the Clinical Director, who will reach out to understand what you need and find the best fit for you.
                            </CustomText>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={close}
                                    style={styles.cancelButton}
                                >
                                    <CustomText style={styles.cancelText}>Cancel</CustomText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleSend}
                                    style={styles.sendButton}
                                >
                                    <SendIcon width={resAvarage(4.5)} height={resAvarage(4.5)} style={styles.sendIcon} />
                                    <CustomText style={styles.sendText}>Send Request</CustomText>
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: colors.bgColor, // Match dark visual color exactly
        borderRadius: scaleSize(16),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        width: resWidth(100),
        paddingVertical: resAvarage(3.5),
        paddingHorizontal: resAvarage(3),
    },
    title: {
        fontFamily: FontMedium,
        fontSize: font18,
        lineHeight: font18 * 1.3,
        color: colors.textWhite,
        textAlign: 'center',
        marginTop: resAvarage(2),
        marginBottom: resAvarage(3.5),
    },
    message1: {
        fontFamily: FontRegular,
        fontSize: font15,
        lineHeight: font15 * 1.5,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'left',
        marginBottom: resAvarage(2),
    },
    message2: {
        fontFamily: FontRegular,
        fontSize: font15,
        lineHeight: font15 * 1.5,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'left',
        marginBottom: resAvarage(3.5),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: resAvarage(2),
        marginTop: resAvarage(3)
    },
    cancelButton: {
        backgroundColor: colors.lightBgColor,
        borderRadius: scaleSize(8),
        paddingVertical: resAvarage(1.6),
        alignItems: 'center',
        justifyContent: 'center',
        width: resWidth(26)
        // flex: 1,
    },
    cancelText: {
        fontFamily: FontMedium,
        fontSize: font15,
        lineHeight: font15 * 1.3,
        color: colors.textWhite,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.btnColor,
        borderRadius: scaleSize(8),
        paddingVertical: resAvarage(0.7),
        width: resWidth(40)
        // flex: 1.3,
    },
    sendIcon: {
        marginRight: resAvarage(0.5),
    },
    sendText: {
        fontFamily: FontMedium,
        fontSize: font15,
        lineHeight: font15 * 1.3,
        color: colors.textWhite,
    },
});
