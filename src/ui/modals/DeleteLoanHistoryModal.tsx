import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font14, font16, font18 } from '../../utils/fontSizes';
import { resHeight, resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import Cross from '../../assets/images/icons/cross.svg';

interface DeleteModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    onDelete: () => void;
}

export default function DeleteLoanHistoryModal({ show, setShow, onDelete }: DeleteModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(100))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (show) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            Animated.timing(transformY, {
                duration: 350,
                useNativeDriver: true,
                toValue: 0,
            }).start();
        }
    }, [show]);

    const close = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();

        Animated.timing(transformY, {
            toValue: resHeight(100),
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShow(false));
    };

    const handleConfirmDelete = () => {
        onDelete();
        close();
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
                            <View style={styles.header}>
                                <CustomText style={styles.title}>Delete payment record?</CustomText>
                                <TouchableOpacity onPress={close} activeOpacity={0.7} style={styles.closeBtn}>
                                    <Cross width={resAvarage(4)} height={resAvarage(4)} fill={colors.black} />
                                </TouchableOpacity>
                            </View>

                            <CustomText style={styles.description}>
                                Are you sure you want to delete this payment record? This action will restore the outstanding balance and cannot be undone.
                            </CustomText>

                            <View style={styles.footer}>
                                <TouchableOpacity onPress={close} activeOpacity={0.8} style={styles.cancelBtn}>
                                    <CustomText style={styles.cancelBtnText}>Cancel</CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleConfirmDelete} activeOpacity={0.8} style={styles.deleteBtn}>
                                    <CustomText style={styles.deleteBtnText}>Delete</CustomText>
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
        backgroundColor: '#00000080',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        backgroundColor: colors.bgWhite,
        borderRadius: scaleSize(12),
        width: resWidth(90),
        paddingVertical: resAvarage(5),
        paddingHorizontal: resAvarage(5),
        gap: resAvarage(4.5),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontFamily: FontBold,
        fontSize: font18,
        color: colors.black,
    },
    closeBtn: {
        padding: resAvarage(1),
    },
    description: {
        fontFamily: FontRegular,
        fontSize: font14,
        color: colors.black70,
        lineHeight: font14 * 1.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: resWidth(3),
        marginTop: resAvarage(2),
    },
    cancelBtn: {
        borderRadius: resAvarage(100),
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        paddingVertical: resAvarage(2),
        paddingHorizontal: resWidth(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.black70,
    },
    deleteBtn: {
        backgroundColor: colors.textRed,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(2),
        paddingHorizontal: resWidth(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.white,
    },
});
