import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import Income from '../../../../assets/images/icons/in.svg'
import Add from '../../../../assets/images/icons/added.svg'
import Outgoing from '../../../../assets/images/icons/out.svg'
import { colors } from '../../../../utils/colors'
import { FontBold, FontBoldP, FontBoldR, FontMedium, FontMediumR } from '../../../../utils/fontFamily'
import { font14, font12, font28, font34, font42, font35 } from '../../../../utils/fontSizes'

export default function IncomeHomeCard() {
    return (
        <View style={styles.card} >
            <View style={styles.row} >
                <CustomText style={styles.header} >This month, kept</CustomText>
                <View style={styles.perView} >
                    <CustomText style={styles.per} >+14%</CustomText>
                </View>
            </View>
            <View>
                <CustomText style={styles.title}>55,068</CustomText>
                <CustomText style={styles.subtitle}>₹86,000 in · ₹5,136 out</CustomText>
            </View>
            <View style={[styles.row, { justifyContent: 'space-around', marginTop: resAvarage(3) }]}>
                <View style={{ alignItems: 'center', gap: resAvarage(0.5) }}>
                    <Pressable style={styles.iconBtn}>
                        <Income width={resAvarage(4)} height={resAvarage(4)} />
                    </Pressable>
                    <CustomText style={styles.iconText}>Income</CustomText>
                </View>
                <View style={{ alignItems: 'center', gap: resAvarage(0.5) }}>
                    <Pressable style={[styles.iconBtn, { backgroundColor: colors.theme }]}>
                        <Add width={resAvarage(6)} height={resAvarage(6)} />
                    </Pressable>
                    <CustomText style={styles.iconText}>Transaction</CustomText>
                </View>
                <View style={{ alignItems: 'center', gap: resAvarage(0.5) }}>
                    <Pressable style={[styles.iconBtn]}>
                        <Outgoing width={resAvarage(4)} height={resAvarage(4)} />
                    </Pressable>
                    <CustomText style={styles.iconText}>Out Going</CustomText>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    iconText: {
        marginTop: resAvarage(1),
        color: colors.white50,
        letterSpacing: resAvarage(0.2),
        fontSize: font12,
        fontFamily: FontMedium
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    perView: {
        backgroundColor: colors.theme,
        paddingVertical: resAvarage(0.5),
        paddingHorizontal: resAvarage(2),
        borderRadius: resAvarage(100)
    },
    card: {
        backgroundColor: colors.black,
        marginHorizontal: resWidth(4),
        padding: resAvarage(5),
        marginTop: resAvarage(3),
        borderRadius: resAvarage(7),
        shadowOffset: {
            height: resAvarage(0.5),
            width: 0
        },
        shadowOpacity: 0.2,
        shadowRadius: resAvarage(1),
        elevation: 2,
        gap: resAvarage(1.5)
    },
    header: {
        fontSize: font12,
        textTransform: "uppercase",
        letterSpacing: resAvarage(0.3),
        color: colors.white50
    },
    per: {
        fontSize: font12,
        lineHeight: font12 * 1.3,
        fontFamily: FontMediumR,
        color: colors.textBlack
    },
    title: {
        fontSize: font35,
        lineHeight: font35 * 1.3,
        fontFamily: FontBoldP,
        color: colors.white
    },
    subtitle: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.white60
    },
    iconBtn: {
        width: resAvarage(8),
        height: resAvarage(8),
        borderRadius: resAvarage(100),
        backgroundColor: colors.white20,
        alignItems: 'center',
        justifyContent: 'center'
    }
})