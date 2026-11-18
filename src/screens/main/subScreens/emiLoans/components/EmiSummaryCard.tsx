import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular } from '../../../../../utils/fontFamily';
import { font11, font12, font13, font26 } from '../../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';

interface EmiSummaryCardProps {
    totalOutstanding: number;
    dueEveryMonth: number;
    activeCount: number;
    closedCount: number;
    totalBorrowed: number;
    totalInterest: number;
}

export default function EmiSummaryCard({
    totalOutstanding,
    dueEveryMonth,
    activeCount,
    closedCount,
    totalBorrowed,
    totalInterest,
}: EmiSummaryCardProps) {
    return (
        <View style={styles.cardContainer}>
            <CustomText style={styles.label}>TOTAL OUTSTANDING</CustomText>
            <CustomText style={styles.outstandingAmount}>{formatINR(totalOutstanding)}</CustomText>
            <CustomText style={styles.dueEveryMonthText}>
                {formatINR(dueEveryMonth)} due every month
            </CustomText>

            {/* Badges Row 1 */}
            <View style={styles.badgeRow}>
                <View style={styles.pillBadge}>
                    <CustomText style={styles.pillText}>{`${activeCount} active`}</CustomText>
                </View>
                <View style={styles.pillBadge}>
                    <CustomText style={styles.pillText}>{`${closedCount} closed`}</CustomText>
                </View>
                <View style={styles.pillBadge}>
                    <CustomText style={styles.pillText}>{`${formatINR(totalBorrowed)} borrowed`}</CustomText>
                </View>
            </View>

            {/* Badges Row 2 */}
            <View style={styles.badgeRowSecond}>
                <View style={styles.pillBadge}>
                    <CustomText style={styles.pillText}>{`${formatINR(totalInterest)} interest`}</CustomText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#0D0D0D',
        borderRadius: resAvarage(5),
        paddingHorizontal: resWidth(5),
        paddingVertical: resAvarage(3),
        marginBottom: resAvarage(2),
    },
    label: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    outstandingAmount: {
        fontSize: font26,
        fontFamily: FontBold,
        color: '#FFFFFF',
        marginVertical: 3,
    },
    dueEveryMonthText: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: '#8E8E93',
        marginBottom: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    badgeRowSecond: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pillBadge: {
        backgroundColor: '#202020',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    pillText: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#E0E0E0',
    },
});

