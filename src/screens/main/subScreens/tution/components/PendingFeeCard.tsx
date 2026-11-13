import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font11, font12, font13, font14, font16 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';

export interface PendingStudentItem {
    id: string;
    name: string;
    classGrade: string;
    feeAmount: number;
    dueFormatted: string; // e.g. "Due 15 Sept"
    statusType: 'overdue' | 'due_soon';
    daysText: string; // e.g. "Overdue by 31 days" or "Due in 1 days"
    category?: 'this_month' | 'last_month' | 'overdue';
}

interface PendingFeeCardProps {
    item: PendingStudentItem;
    onPress?: (item: PendingStudentItem) => void;
    onRecordPayment?: (item: PendingStudentItem) => void;
}

export default function PendingFeeCard({
    item,
    onPress,
    onRecordPayment,
}: PendingFeeCardProps) {
    const isOverdue = item.statusType === 'overdue';

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress?.(item)}
            style={styles.card}
        >
            {/* Top Row: Name & Class on Left, Badge on Right */}
            <View style={styles.topRow}>
                <View style={styles.nameContainer}>
                    <CustomText style={styles.nameText}>{item.name}</CustomText>
                    <CustomText style={styles.classText}>{item.classGrade}</CustomText>
                </View>

                <View
                    style={[
                        styles.badge,
                        isOverdue ? styles.badgeOverdue : styles.badgeDueSoon,
                    ]}
                >
                    <CustomText
                        style={[
                            styles.badgeText,
                            isOverdue ? styles.badgeTextOverdue : styles.badgeTextDueSoon,
                        ]}
                    >
                        {isOverdue ? 'Overdue' : 'Due Soon'}
                    </CustomText>
                </View>
            </View>

            {/* Bottom Row: Fee & Due Days on Left, Record Payment Button on Right */}
            <View style={styles.bottomRow}>
                <View style={styles.feeInfoContainer}>
                    <CustomText style={styles.feeRowText}>
                        <CustomText style={styles.feePrefix}>Fee </CustomText>
                        <CustomText style={styles.feeAmount}>
                            {`₹${item.feeAmount.toLocaleString('en-IN')}`}
                        </CustomText>
                        <CustomText style={styles.separator}> · </CustomText>
                        <CustomText style={styles.dueDateText}>{item.dueFormatted}</CustomText>
                    </CustomText>

                    <CustomText
                        style={[
                            styles.daysText,
                            isOverdue ? styles.daysTextOverdue : styles.daysTextNormal,
                        ]}
                    >
                        {item.daysText}
                    </CustomText>
                </View>

                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onRecordPayment?.(item)}
                    style={styles.recordPaymentBtn}
                >
                    <CustomText style={styles.recordPaymentText}>Record Payment</CustomText>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(3.5),
        marginBottom: resAvarage(2.2),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: resAvarage(1.5),
    },
    nameContainer: {
        flex: 1,
        paddingRight: resAvarage(2),
    },
    nameText: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
    },
    classText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.3),
    },
    badge: {
        paddingHorizontal: resAvarage(2.4),
        paddingVertical: resAvarage(0.5),
        borderRadius: resAvarage(100),
    },
    badgeOverdue: {
        backgroundColor: '#FEE2E2',
    },
    badgeDueSoon: {
        backgroundColor: '#FEF3C7',
    },
    badgeText: {
        fontFamily: FontMedium,
        fontSize: font11,
    },
    badgeTextOverdue: {
        color: '#DC2626',
    },
    badgeTextDueSoon: {
        color: '#D97706',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    feeInfoContainer: {
        flex: 1,
        paddingRight: resAvarage(2),
    },
    feeRowText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
    },
    feePrefix: {
        fontFamily: FontRegular,
        color: '#64748B',
    },
    feeAmount: {
        fontFamily: FontBold,
        color: colors.black,
    },
    separator: {
        color: '#94A3B8',
    },
    dueDateText: {
        fontFamily: FontRegular,
        color: '#64748B',
    },
    daysText: {
        fontSize: font12,
        marginTop: resAvarage(0.4),
    },
    daysTextOverdue: {
        fontFamily: FontMedium,
        color: '#DC2626',
    },
    daysTextNormal: {
        fontFamily: FontRegular,
        color: '#64748B',
    },
    recordPaymentBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1.4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordPaymentText: {
        fontFamily: FontBold,
        fontSize: font12,
        color: colors.white,
    },
});
