import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font12, font14, font16, font18 } from '../../utils/fontSizes';
import { resHeight, resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import CustomInput from '../components/CustomInput';
import Cross from '../../assets/images/icons/cross.svg';
import { insert, getWhere } from '../../storage/local/sqlite';
import Toast from 'react-native-toast-message';
import { syncNotifications } from '../../services/localNotificationService';

interface AddDebtPersonModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    onAddSuccess: () => void;
}

export default function AddDebtPersonModal({
    show,
    setShow,
    onAddSuccess,
}: AddDebtPersonModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(100))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const isButtonDisabled = !name.trim() || !phone.trim() || phone.trim().length < 10;

    useEffect(() => {
        console.log('[AddDebtPersonModal] useEffect show changed:', show);
        if (show) {
            setName('');
            setPhone('');

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

    const handleSave = () => {
        if (isButtonDisabled) return;

        try {
            // Check if phone number already exists
            const existing = getWhere('debt_persons', 'phone = ?', [phone.trim()]);
            if (existing && existing.length > 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Duplicate Person',
                    text2: 'A person with this phone number already exists.',
                });
                return;
            }

            insert('debt_persons', {
                name: name.trim(),
                phone: phone.trim(),
                created_at: new Date().toISOString(),
            });

            // Sync notifications
            syncNotifications();

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Person added successfully!',
            });

            onAddSuccess();
            close();
        } catch (error) {
            console.error('Error adding debt person:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add person.',
            });
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
                            <View style={styles.header}>
                                <CustomText style={styles.title}>Add Person</CustomText>
                                <TouchableOpacity onPress={close} activeOpacity={0.7} style={styles.closeBtn}>
                                    <Cross width={resAvarage(3.5)} height={resAvarage(3.5)} fill={colors.black} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.scrollContent}>
                                <CustomInput
                                    label="Name"
                                    placeholder="Full name"
                                    value={name}
                                    onChangeText={setName}
                                    containerWidth={resWidth(82)}
                                />

                                <CustomInput
                                    label="Phone"
                                    placeholder="10-digit number"
                                    keyboardType="numeric"
                                    value={phone}
                                    onChangeText={(text: any) => setPhone(text.replace(/\D/g, '').substring(0, 10))}
                                    containerWidth={resWidth(82)}
                                />
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity onPress={close} activeOpacity={0.8} style={styles.cancelBtn}>
                                    <CustomText style={styles.cancelBtnText}>Cancel</CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    activeOpacity={isButtonDisabled ? 1 : 0.8}
                                    disabled={isButtonDisabled}
                                    style={[styles.recordBtn, isButtonDisabled && { backgroundColor: colors.black30 }]}
                                >
                                    <CustomText style={styles.recordBtnText}>Add Person</CustomText>
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
        justifyContent: 'flex-end',
    },
    box: {
        backgroundColor: colors.bgWhite,
        borderTopLeftRadius: scaleSize(16),
        borderTopRightRadius: scaleSize(16),
        width: '100%',
        paddingVertical: resAvarage(5),
        paddingHorizontal: resAvarage(5),
        gap: resAvarage(4),
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
    scrollContent: {
        gap: resAvarage(3),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: resWidth(4),
        marginTop: resAvarage(1),
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.black70,
    },
    recordBtn: {
        flex: 1,
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.white,
    },
});
