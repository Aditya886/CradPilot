import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontSemiBold } from '../../../../../utils/fontFamily';
import { font12 } from '../../../../../utils/fontSizes';
import { resAvarage, scaleSize } from '../../../../../utils/responsive';
import {
    AddUserIcon,
    AttendanceIcon,
    BatchesIcon,
    PendingIcon,
    StudentsIcon,
} from './TuitionIcons';

interface TuitionQuickActionsProps {
    onPressAdd?: () => void;
    onPressStudents?: () => void;
    onPressPending?: () => void;
    onPressAttendance?: () => void;
    onPressBatches?: () => void;
}

export default function TuitionQuickActions({
    onPressAdd,
    onPressStudents,
    onPressPending,
    onPressAttendance,
    onPressBatches,
}: TuitionQuickActionsProps) {
    const row1 = [
        {
            key: 'add',
            label: 'Add',
            isPrimary: true,
            icon: <AddUserIcon size={scaleSize(22)} color={colors.black} />,
            onPress: onPressAdd,
        },
        {
            key: 'students',
            label: 'Students',
            isPrimary: false,
            icon: <StudentsIcon size={scaleSize(22)} color={colors.black} />,
            onPress: onPressStudents,
        },
        {
            key: 'pending',
            label: 'Pending',
            isPrimary: false,
            icon: <PendingIcon size={scaleSize(22)} color={colors.black} />,
            onPress: onPressPending,
        },
    ];

    const row2 = [
        {
            key: 'attendance',
            label: 'Attendance',
            isPrimary: false,
            icon: <AttendanceIcon size={scaleSize(22)} color={colors.black} />,
            onPress: onPressAttendance,
        },
        {
            key: 'batches',
            label: 'Batches',
            isPrimary: false,
            icon: <BatchesIcon size={scaleSize(22)} color={colors.black} />,
            onPress: onPressBatches,
        },
    ];

    const renderActionItem = (item: (typeof row1)[0]) => (
        <TouchableOpacity
            key={item.key}
            activeOpacity={0.75}
            onPress={item.onPress}
            style={[
                styles.actionButton,
                item.isPrimary ? styles.primaryButton : styles.secondaryButton,
            ]}
        >
            <View style={styles.iconContainer}>{item.icon}</View>
            <CustomText numberOfLines={1} style={[styles.label, item.isPrimary && styles.primaryLabel]}>
                {item.label}
            </CustomText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.row}>{row1.map(renderActionItem)}</View>
            <View style={styles.row}>{row2.map(renderActionItem)}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: resAvarage(2),
        gap: resAvarage(1.5),
    },
    row: {
        flexDirection: 'row',
        gap: resAvarage(1.5),
    },
    actionButton: {
        flex: 1,
        height: scaleSize(74),
        borderRadius: scaleSize(16),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaleSize(6),
    },
    primaryButton: {
        backgroundColor: colors.theme,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    secondaryButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: scaleSize(6),
    },
    label: {
        fontFamily: FontSemiBold,
        fontSize: font12,
        color: colors.black,
        textAlign: 'center',
    },
    primaryLabel: {
        fontFamily: FontBold,
        color: colors.black,
    },
});
