import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../../../../utils/fontFamily';
import { font11, font12, font20, font36 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';

interface TuitionTotalCardProps {
    totalFeeCollected?: number;
    pendingAmount?: number;
    activeStudents?: number;
}

export default function TuitionTotalCard({
    totalFeeCollected = 26100,
    pendingAmount = 16500,
    activeStudents = 6,
}: TuitionTotalCardProps) {
    return (
        <View style={styles.card}>
            <CustomText style={styles.headerLabel}>TOTAL FEE COLLECTED</CustomText>
            <CustomText style={styles.totalAmount}>{formatINR(totalFeeCollected)}</CustomText>

            <View style={styles.divider} />

            <View style={styles.bottomRow}>
                <View style={styles.metricColumn}>
                    <CustomText style={styles.subLabel}>Pending</CustomText>
                    <CustomText style={styles.pendingValue}>{formatINR(pendingAmount)}</CustomText>
                </View>

                <View style={styles.metricColumn}>
                    <CustomText style={styles.subLabel}>Active students</CustomText>
                    <CustomText style={styles.studentsValue}>{activeStudents}</CustomText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#0F1012',
        borderRadius: resAvarage(5.5),
        paddingHorizontal: resAvarage(4.5),
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(4.5),
        marginTop: resAvarage(2),
        elevation: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    headerLabel: {
        fontFamily: FontMedium,
        fontSize: font11,
        color: 'rgba(255, 255, 255, 0.55)',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    totalAmount: {
        fontFamily: FontBold,
        fontSize: font36,
        color: colors.white,
        marginTop: resAvarage(1),
        letterSpacing: -0.5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginTop: resAvarage(3),
        marginBottom: resAvarage(2.5),
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    metricColumn: {
        flexDirection: 'column',
    },
    subLabel: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: 'rgba(255, 255, 255, 0.55)',
        marginBottom: resAvarage(0.5),
    },
    pendingValue: {
        fontFamily: FontBold,
        fontSize: font20,
        color: colors.theme,
    },
    studentsValue: {
        fontFamily: FontBold,
        fontSize: font20,
        color: colors.white,
    },
});
