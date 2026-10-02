import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { colors } from '../../utils/colors';
import { FontMedium, FontRegular } from '../../utils/fontFamily';
import { font13, font14, font15 } from '../../utils/fontSizes';
import { resHeight, resAvarage, scaleSize } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import CustomInput from '../components/CustomInput';
import AutoExpandingInput from '../components/AutoExpandingInput';

interface CancelAvailabilityModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    cancelReason: string;
    setCancelReason: (reason: string) => void;
    onConfirm: () => void;
}

export default function CancelAvailabilityModal({
    show,
    setShow,
    cancelReason,
    setCancelReason,
    onConfirm
}: CancelAvailabilityModalProps) {
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

            // Slide up sheet
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

        // Slide down sheet
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
                <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                { transform: [{ translateY: transformY }] } as ViewStyle,
                            ]}
                        >
                            <CustomText style={styles.modalTitle}>Cancel Session?</CustomText>

                            <CustomText style={styles.modalDesc}>Are you sure you want to cancel this session?</CustomText>
                            <CustomText style={styles.modalDescSub}>You can cancel or reschedule up to 24 hours before your session.</CustomText>

                            {/* <CustomText style={styles.inputLabel}>Cancellation reason</CustomText> */}
                            <AutoExpandingInput
                                label={"Cancellation reason"}
                                style={{ marginBottom: resAvarage(4) }}
                                placeholder="Briefly describe your reason so we can notify the athlete"
                                placeholderTextColor={colors.textWhite41}
                                multiline={true}
                                numberOfLines={3}
                                value={cancelReason}
                                onChangeText={setCancelReason}
                            />

                            <View style={styles.modalButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.keepButton]}
                                    onPress={close}
                                >
                                    <CustomText style={styles.keepButtonText}>Keep Session</CustomText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelSubmitButton]}
                                    onPress={onConfirm}
                                >
                                    <CustomText style={styles.cancelSubmitButtonText}>Cancel Session</CustomText>
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.lightBgColor,
        borderTopLeftRadius: scaleSize(16),
        borderTopRightRadius: scaleSize(16),
        paddingTop: resAvarage(6),
        paddingHorizontal: resAvarage(2),
        paddingBottom: resAvarage(5),
    },
    modalTitle: {
        fontSize: font15 + 2,
        fontFamily: FontMedium,
        color: colors.textWhite,
        marginBottom: resAvarage(2),
        textAlign: 'center',
    },
    modalDesc: {
        fontSize: font14,
        fontFamily: FontRegular,
        color: colors.textWhite,
        marginBottom: resAvarage(3),
        marginTop: resAvarage(1),
        textAlign: 'left',
    },
    modalDescSub: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: colors.textWhite,
        marginBottom: resAvarage(5),
        textAlign: 'left',
        paddingHorizontal: resAvarage(1),
    },
    inputLabel: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.textWhite,
        marginBottom: resAvarage(1),
    },
    reasonInput: {
        height: resAvarage(11),
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(8),
        padding: resAvarage(1.5),
        color: colors.textWhite,
        textAlignVertical: 'top',
        fontSize: font13,
        fontFamily: FontRegular,
        marginBottom: resAvarage(3),
        borderWidth: 1,
        borderColor: colors.white10,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: resAvarage(1.6),
        borderRadius: scaleSize(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    keepButton: {
        backgroundColor: '#3F4257',
        marginRight: resAvarage(2),
    },
    cancelSubmitButton: {
        backgroundColor: '#FF4C51',
    },
    keepButtonText: {
        color: colors.textWhite,
        fontSize: font15,
        textAlign: "left",
        fontFamily: FontMedium,
    },
    cancelSubmitButtonText: {
        color: colors.textWhite,
        fontSize: font15,
        fontFamily: FontMedium,
    },
});
