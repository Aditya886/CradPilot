import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import Income from '../../../../assets/images/icons/in.svg'
import Add from '../../../../assets/images/icons/added.svg'
import Outgoing from '../../../../assets/images/icons/out.svg'
import { colors } from '../../../../utils/colors'
import { FontBold, FontBoldP, FontBoldR, FontMedium, FontMediumR, FontRegular } from '../../../../utils/fontFamily'
import { font14, font12, font28, font34, font42, font35, font10, font16 } from '../../../../utils/fontSizes'

import { formatINR } from '../../../../utils/FormatUtil'

export default function FinCard({ totals }: any) {
    const totalLent = totals?.totalLent ?? 0;
    const outstanding = totals?.outstanding ?? 0;
    const interestEarned = totals?.interestEarned ?? 0;

    return (
        <View style={styles.card} >
            <View style={styles.row} >
                <CustomText style={styles.header} >Total lent</CustomText>
            </View>
            <View>
                <CustomText style={styles.title}>{formatINR(totalLent)}</CustomText>
                <View style={styles.row} >
                    <View style={{ gap: resAvarage(0.5) }} >
                        <CustomText style={styles.des}>Outstanding</CustomText>
                        <CustomText style={styles.subtitle}>{formatINR(outstanding)}</CustomText>
                    </View>
                    <View style={{ gap: resAvarage(0.5) }} >
                        <CustomText style={styles.des}>Interest earned</CustomText>
                        <CustomText style={styles.subtitle}>{formatINR(interestEarned)}</CustomText>
                    </View>
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
        color: colors.white70
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
        color: colors.theme,
        marginBottom: resAvarage(2)
    },
    subtitle: {
        fontSize: font16,
        fontFamily: FontMedium,
        color: colors.white
    },
    des: {
        fontSize: font12,
        letterSpacing: resAvarage(0.2),
        textTransform: "uppercase",
        fontFamily: FontRegular,
        color: colors.white70
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