import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage } from '../../../../utils/responsive'
import { colors } from '../../../../utils/colors'
import { FontMedium, FontRegular } from '../../../../utils/fontFamily'
import { font12, font14, font16, font20, font40 } from '../../../../utils/fontSizes'
import { formatINR } from '../../../../utils/FormatUtil'

interface TotalCardProps {
    totalPayable: number;
    totalInterest: number;
}

export default function TotalCard({ totalPayable = 0, totalInterest = 0 }: TotalCardProps) {
    return (
        <View style={styles.card}>
            <CustomText style={styles.title}>Total payable</CustomText>
            <CustomText style={styles.value}>{formatINR(totalPayable)}</CustomText>
            <CustomText style={styles.subtitle}>{`Interest: ${formatINR(totalInterest)}`}</CustomText>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: resAvarage(6),
        backgroundColor: colors.black,
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(4),
        marginHorizontal: resAvarage(3),
        marginVertical: resAvarage(3)
    },
    title: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.white90,
        letterSpacing: resAvarage(0.3),
        textTransform: "uppercase"
    },
    value: {
        fontFamily: FontMedium,
        fontSize: font40,
        color: colors.theme,
    },
    subtitle: {
        fontFamily: FontRegular,
        fontSize: font16,
        color: colors.white,
    }
})