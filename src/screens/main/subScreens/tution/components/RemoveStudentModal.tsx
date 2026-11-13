import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import CustomButton from '../../../../../ui/components/CustomButton';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontRegular } from '../../../../../utils/fontFamily';
import { font14, font18 } from '../../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import { AlertTriangleIcon } from './TuitionIcons';

interface RemoveStudentModalProps {
    visible: boolean;
    studentName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function RemoveStudentModal({
    visible,
    studentName,
    onClose,
    onConfirm,
}: RemoveStudentModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
                    {/* Icon container */}
                    <View style={styles.iconCircle}>
                        <AlertTriangleIcon size={resAvarage(4)} color="#DC2626" />
                    </View>

                    {/* Title & Warning message */}
                    <CustomText style={styles.title}>Remove Student</CustomText>
                    <CustomText style={styles.message}>
                        {`Are you sure you want to remove ${studentName}? All associated attendance, fees, and study history will be removed.`}
                    </CustomText>

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                        <View style={styles.btnWrapper}>
                            <CustomButton
                                title="Cancel"
                                variant="outline"
                                linear={false}
                                onPress={onClose}
                                style={styles.cancelBtn}
                                textStyle={styles.cancelBtnText}
                            />
                        </View>
                        <View style={styles.btnWrapper}>
                            <CustomButton
                                title="Yes, Remove"
                                variant="error"
                                linear={false}
                                backgroundColor="#DC2626"
                                textColor={colors.white}
                                onPress={onConfirm}
                                style={styles.removeBtn}
                            />
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resWidth(6),
    },
    card: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(4.5),
        paddingVertical: resAvarage(5),
        alignItems: 'center',
        elevation: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    iconCircle: {
        width: resAvarage(8),
        height: resAvarage(8),
        borderRadius: resAvarage(100),
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: resAvarage(2),
    },
    title: {
        fontFamily: FontBold,
        fontSize: font18,
        color: colors.black,
        marginBottom: resAvarage(1.2),
        textAlign: 'center',
    },
    message: {
        fontFamily: FontRegular,
        fontSize: font14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: font14 * 1.4,
        marginBottom: resAvarage(3),
        paddingHorizontal: resAvarage(1),
    },
    buttonRow: {
        flexDirection: 'row',
        gap: resAvarage(2),
        width: '100%',
    },
    btnWrapper: {
        flex: 1,
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        height: resAvarage(6),
    },
    cancelBtnText: {
        color: '#475569',
        fontFamily: FontBold,
    },
    removeBtn: {
        borderRadius: resAvarage(3),
        height: resAvarage(6),
    },
});
