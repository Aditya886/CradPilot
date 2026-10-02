import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { font12, font14, font24, font28 } from '../../../../utils/fontSizes'
import { FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily'

import { formatINR } from '../../../../utils/FormatUtil'

interface OverAllProps {
    totalOwe: number;
    totalReceive: number;
    receiveCount: number;
    payCount: number;
}

export default function OverAll({ totalOwe, totalReceive, receiveCount, payCount }: OverAllProps) {
    const netBalance = totalReceive - totalOwe;
    const isReceiving = netBalance > 0;
    const isOwing = netBalance < 0;

    return (
        <View style={styles.card} >
            <CustomText style={styles.title} >Overall</CustomText>
            <View style={{ gap: resAvarage(1) }} >
                {netBalance === 0 ? (
                    <CustomText style={styles.header}>All Settled</CustomText>
                ) : (
                    <CustomText style={styles.header} >
                        {isReceiving ? "You'll Receive " : "You Owe "}
                        <CustomText style={styles.highlight}>
                            {formatINR(Math.abs(netBalance))}
                        </CustomText>
                    </CustomText>
                )}
                <CustomText style={styles.type} >
                    {`${receiveCount} to Receive · ${payCount} to Pay`}
                </CustomText>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.black,
        marginTop: resAvarage(3),
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(4),
        marginHorizontal: resAvarage(3),
        borderWidth: 1,
        gap: resAvarage(1.5),
        borderColor: colors.black20,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    title: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.white80,
        letterSpacing: resAvarage(0.3),
        textTransform: 'uppercase',
    },
    header: {
        fontFamily: FontSemiBold,
        color: colors.white,
        fontSize: font28,
    },
    highlight: {
        fontFamily: FontSemiBold,
        color: colors.theme,
        fontSize: font28,
    },
    type: {
        fontFamily: FontMedium,
        color: colors.white90,
        fontSize: font14,
    }
})