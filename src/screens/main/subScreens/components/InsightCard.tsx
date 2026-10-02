import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage } from '../../../../utils/responsive'
import Star from "../../../../assets/images/icons/stars.svg"
import { colors } from '../../../../utils/colors'
import { FontMedium, FontRegular, FontRegularP, FontSemiBold } from '../../../../utils/fontFamily'
import { font12, font14, font18, font24 } from '../../../../utils/fontSizes'

import { formatINR } from '../../../../utils/FormatUtil'

export default function InsightCard({ summary }: any) {
    const earned = summary?.earned ?? 0;
    const lent = summary?.lent ?? 0;
    const saved = summary?.savedPercentage ?? 0;
    const spend = summary?.spendPercentage ?? 0;
    const borrowed = summary?.borrowedPercentage ?? 0;

    return (
        <View style={styles.card} >
            <View style={styles.row} >
                <CustomText style={styles.title} >This month · summary</CustomText>
                <Star width={resAvarage(3.5)} height={resAvarage(3.5)} />
            </View>
            <CustomText style={styles.subtitle}>{`You earned ${formatINR(earned)} in interest and lent out ${formatINR(lent)} across all loans.`}</CustomText>

            <View style={{ gap: resAvarage(2) }} >
                <View style={[styles.textCard, { backgroundColor: colors.theme, alignItems: "center" }]} >
                    <CustomText style={[styles.text, { color: colors.black }]}>{`Outstanding ${spend}%`}</CustomText>
                </View>
                <View style={[styles.row, { gap: resAvarage(2) }]} >
                    <View style={styles.textCard} >
                        <CustomText style={styles.text}>{`Collected ${saved}%`}</CustomText>
                    </View>
                    <View style={styles.textCard} >
                        <CustomText style={styles.text}>{`Other ${borrowed}%`}</CustomText>
                    </View>
                </View>
            </View>
            <View>

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    textCard: {
        flex: 1,
        borderRadius: resAvarage(100),
        backgroundColor: colors.white20,
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(3),
    },
    text: {
        fontFamily: FontSemiBold,
        fontSize: font12,
        lineHeight: font12 * 1.3,
        color: colors.white90
    },
    title: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.white80,
        textTransform: "uppercase",
    },
    subtitle: {
        fontFamily: FontRegularP,
        fontSize: font24,
        color: colors.white,
        marginTop: resAvarage(1.5),
        marginBottom: resAvarage(3)
    },
    card: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(7),
        paddingHorizontal: resAvarage(5),
        paddingVertical: resAvarage(4),
        marginHorizontal: resAvarage(3),
        shadowColor: colors.black,
        elevation: 2,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    row: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})