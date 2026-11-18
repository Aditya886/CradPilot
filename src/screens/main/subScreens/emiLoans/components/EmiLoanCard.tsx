import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular } from '../../../../../utils/fontFamily';
import { font12, font13, font16 } from '../../../../../utils/fontSizes';
import { colors } from '../../../../../utils/colors';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import { computeLoanStats } from '../utils/emiCalculator';
import Svg, { Path } from 'react-native-svg';

export interface EmiLoanItem {
    id: number;
    title: string;
    lender: string;
    amount: number;
    rate: number;
    tenure: number;
    start_date: string;
    emi_amount: number;
    paid_emis: number;
    status: 'active' | 'closed';
    created_at?: string;
}

interface EmiLoanCardProps {
    item: EmiLoanItem;
    onPress: (loan: EmiLoanItem) => void;
}

const ChevronRight = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M9 18L15 12L9 6" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function EmiLoanCard({ item, onPress }: EmiLoanCardProps) {
    const stats = computeLoanStats(
        item.amount,
        item.rate,
        item.tenure,
        item.start_date,
        item.paid_emis
    );

    const isClosed = item.status === 'closed' || item.paid_emis >= item.tenure;
    const progressPct = Math.round(stats.progressRatio * 100);

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onPress(item)}
            style={styles.card}
        >
            {/* Top Row: Title + EMI/Closed Badge + Chevron */}
            <View style={styles.topRow}>
                <CustomText style={styles.title} numberOfLines={1}>
                    {item.title}
                </CustomText>

                <View style={styles.topRight}>
                    {isClosed ? (
                        <View style={styles.closedBadge}>
                            <CustomText style={styles.closedBadgeText}>Closed</CustomText>
                        </View>
                    ) : (
                        <View style={styles.emiBadge}>
                            <CustomText style={styles.emiBadgeText}>
                                {`${formatINR(stats.monthlyEmi)}/mo`}
                            </CustomText>
                        </View>
                    )}
                    <ChevronRight />
                </View>
            </View>

            {/* Subtext: Lender · Rate% · Tenure mo */}
            <CustomText style={styles.subtext}>
                {`${item.lender} · ${item.rate}% · ${item.tenure} mo`}
            </CustomText>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${progressPct}%` },
                    ]}
                />
            </View>

            {/* Bottom Row: Paid count & Left amount */}
            <View style={styles.bottomRow}>
                <CustomText style={styles.bottomLeftText}>
                    {`${item.paid_emis} of ${item.tenure} paid`}
                </CustomText>

                <CustomText style={styles.bottomRightText}>
                    {isClosed ? 'Fully repaid' : `${formatINR(stats.outstanding)} left`}
                </CustomText>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(4.5),
        borderWidth: 1,
        borderColor: '#ECECEC',
        padding: resWidth(4.5),
        marginBottom: resAvarage(2),
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        flex: 1,
        fontSize: font16,
        fontFamily: FontBold,
        color: '#141414',
        marginRight: 8,
    },
    topRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    emiBadge: {
        backgroundColor: colors.theme,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    emiBadgeText: {
        fontSize: font12,
        fontFamily: FontBold,
        color: '#141414',
    },
    closedBadge: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    closedBadgeText: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: '#666666',
    },
    subtext: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: '#666666',
        marginTop: 4,
        marginBottom: 12,
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#EBEBEB',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: 6,
        backgroundColor: '#141414',
        borderRadius: 3,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomLeftText: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: '#666666',
    },
    bottomRightText: {
        fontSize: font13,
        fontFamily: FontMedium,
        color: '#444444',
    },
});

