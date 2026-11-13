import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium } from '../../../../../utils/fontFamily';
import { font11, font18, font22, font24 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import { ClockIcon } from './TuitionIcons';

interface MonthlyStatsCardsProps {
    thisMonthCollected?: number;
    thisMonthPending?: number;
}

export default function MonthlyStatsCards({
    thisMonthCollected = 0,
    thisMonthPending = 16500,
}: MonthlyStatsCardsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <CustomText style={styles.rupeeIcon}>₹</CustomText>
                <CustomText style={styles.cardLabel}>
                    {'THIS MONTH\nCOLLECTED'}
                </CustomText>
                <CustomText style={styles.collectedValue}>
                    {formatINR(thisMonthCollected)}
                </CustomText>
            </View>

            <View style={styles.card}>
                <View style={styles.iconWrapper}>
                    <ClockIcon size={resAvarage(3.8)} color="#F59E0B" />
                </View>
                <CustomText style={styles.cardLabel}>
                    {'THIS MONTH PENDING'}
                </CustomText>
                <CustomText style={styles.pendingValue}>
                    {formatINR(thisMonthPending)}
                </CustomText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: resAvarage(2),
        gap: resAvarage(2),
    },
    card: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(3.5),
        minHeight: resAvarage(20),
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    rupeeIcon: {
        fontFamily: FontBold,
        fontSize: font18,
        color: '#16A34A',
    },
    iconWrapper: {
        alignItems: 'flex-start',
    },
    cardLabel: {
        fontFamily: FontMedium,
        fontSize: font11,
        color: 'rgba(20, 20, 20, 0.55)',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        lineHeight: font11 * 1.35,
        marginTop: resAvarage(1),
    },
    collectedValue: {
        fontFamily: FontBold,
        fontSize: font24,
        color: colors.black,
        marginTop: resAvarage(0.5),
    },
    pendingValue: {
        fontFamily: FontBold,
        fontSize: font22,
        color: colors.black,
        marginTop: resAvarage(0.5),
    },
});
