import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular } from '../../../../../utils/fontFamily';
import { font11, font12, font26 } from '../../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import CircularProgress from './CircularProgress';

interface SummaryCardProps {
    totalSaved: number;
    totalTarget: number;
    goalsCount: number;
    reachedCount: number;
}

export default function SummaryCard({
    totalSaved,
    totalTarget,
    goalsCount,
    reachedCount,
}: SummaryCardProps) {
    const toGo = Math.max(0, totalTarget - totalSaved);
    const progress = totalTarget > 0 ? Math.min(1, totalSaved / totalTarget) : 0;

    return (
        <View style={styles.cardContainer}>
            <View style={styles.contentRow}>
                {/* Circular Donut Ring on Left */}
                <View style={styles.donutWrapper}>
                    <CircularProgress
                        size={resWidth(27)}
                        strokeWidth={resWidth(3.8)}
                        progress={progress}
                        backgroundColor="#FFFFFF"
                    />
                </View>

                {/* Info on Right */}
                <View style={styles.infoWrapper}>
                    <CustomText style={styles.label}>TOTAL SAVED</CustomText>
                    <CustomText style={styles.totalSavedText}>{formatINR(totalSaved)}</CustomText>
                    <CustomText style={styles.targetedText}>
                        of {formatINR(totalTarget)} targeted
                    </CustomText>

                    {/* Stats Badges */}
                    <View style={styles.badgeRow}>
                        <View style={styles.pillBadge}>
                            <CustomText style={styles.pillText}>{`${goalsCount} goals`}</CustomText>
                        </View>
                        <View style={styles.pillBadge}>
                            <CustomText style={styles.pillText}>{`${reachedCount} reached`}</CustomText>
                        </View>
                    </View>

                    <View style={styles.badgeRowSecond}>
                        <View style={styles.pillBadge}>
                            <CustomText style={styles.pillText}>{`${formatINR(toGo)} to go`}</CustomText>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#0D0D0D',
        borderRadius: resAvarage(5),
        paddingHorizontal: resWidth(4),
        paddingVertical: resAvarage(3),
        marginBottom: resAvarage(2),
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    donutWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: resWidth(4),
    },
    infoWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    totalSavedText: {
        fontSize: font26,
        fontFamily: FontBold,
        color: '#FFFFFF',
        marginVertical: 2,
    },
    targetedText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#8E8E93',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
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

