import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font11, font12, font13, font14, font15, font16, font32 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import { AlertTriangleIcon } from './TuitionIcons';

interface StudentFeeCardProps {
    monthlyFee?: number;
    feeStatus?: 'Overdue' | 'Paid' | 'Due Soon';
    lastPaidAmount?: number;
    lastPaidDate?: string;
    nextDueDate?: string;
    pendingAmount?: number;
    overdueDays?: number;
    onPressRecordPayment?: () => void;
}

export default function StudentFeeCard({
    monthlyFee = 2000,
    feeStatus = 'Overdue',
    lastPaidAmount = 2000,
    lastPaidDate = '3 Sept 2026',
    nextDueDate = '3 Oct 2026',
    pendingAmount = 2000,
    overdueDays = 12,
    onPressRecordPayment,
}: StudentFeeCardProps) {
    const isOverdue = feeStatus === 'Overdue';
    const isPaid = feeStatus === 'Paid';

    return (
        <View style={styles.card}>
            {/* Header: Title & Status Badge */}
            <View style={styles.headerRow}>
                <CustomText style={styles.sectionLabel}>MONTHLY FEE</CustomText>
                <View
                    style={[
                        styles.badge,
                        isOverdue
                            ? styles.badgeOverdue
                            : isPaid
                                ? styles.badgePaid
                                : styles.badgeDueSoon,
                    ]}
                >
                    <CustomText
                        style={[
                            styles.badgeText,
                            isOverdue
                                ? styles.textOverdue
                                : isPaid
                                    ? styles.textPaid
                                    : styles.textDueSoon,
                        ]}
                    >
                        {feeStatus}
                    </CustomText>
                </View>
            </View>

            {/* Fee Amount */}
            <CustomText style={styles.amountText}>
                {formatINR(monthlyFee)}
            </CustomText>

            {/* Details Rows */}
            <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>Last paid</CustomText>
                <CustomText style={styles.detailValue}>
                    {`${formatINR(lastPaidAmount)} · ${lastPaidDate}`}
                </CustomText>
            </View>

            <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>Next due</CustomText>
                <CustomText style={styles.detailValue}>{nextDueDate}</CustomText>
            </View>

            <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>Pending</CustomText>
                <CustomText
                    style={[
                        styles.detailValue,
                        isOverdue ? styles.pendingOverdue : styles.pendingNormal,
                    ]}
                >
                    {formatINR(pendingAmount)}
                </CustomText>
            </View>

            {/* Overdue alert notice */}
            {isOverdue && overdueDays > 0 && (
                <View style={styles.overdueAlertRow}>
                    <AlertTriangleIcon size={resAvarage(2.4)} color="#DC2626" />
                    <CustomText style={styles.overdueAlertText}>
                        {`Overdue by ${overdueDays} days`}
                    </CustomText>
                </View>
            )}

            {/* Record Payment Button */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPressRecordPayment}
                style={styles.recordPaymentBtn}
            >
                <CustomText style={styles.recordBtnRupee}>₹</CustomText>
                <CustomText style={styles.recordBtnText}>Record Payment</CustomText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(4.5),
        paddingVertical: resAvarage(4),
        marginTop: resAvarage(2),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionLabel: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    badge: {
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(0.4),
        borderRadius: resAvarage(100),
    },
    badgeOverdue: {
        backgroundColor: '#FEE2E2',
    },
    badgePaid: {
        backgroundColor: '#DCFCE7',
    },
    badgeDueSoon: {
        backgroundColor: '#FEF3C7',
    },
    badgeText: {
        fontFamily: FontSemiBold,
        fontSize: font11,
    },
    textOverdue: {
        color: '#DC2626',
    },
    textPaid: {
        color: '#16A34A',
    },
    textDueSoon: {
        color: '#D97706',
    },
    amountText: {
        fontFamily: FontBold,
        fontSize: font32,
        color: colors.black,
        marginTop: resAvarage(1.2),
        marginBottom: resAvarage(2.2),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(1.4),
    },
    detailLabel: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
    },
    detailValue: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black,
    },
    pendingOverdue: {
        fontFamily: FontBold,
        color: '#DC2626',
        fontSize: font14,
    },
    pendingNormal: {
        fontFamily: FontBold,
        color: colors.black,
        fontSize: font14,
    },
    overdueAlertRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.2),
        marginTop: resAvarage(1.2),
        marginBottom: resAvarage(1),
    },
    overdueAlertText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: '#DC2626',
    },
    recordPaymentBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        height: resAvarage(6.2),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: resAvarage(1.5),
        marginTop: resAvarage(2),
    },
    recordBtnRupee: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.white,
    },
    recordBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font15,
        color: colors.white,
    },
});
