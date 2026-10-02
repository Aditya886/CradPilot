import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { font12, font14, font16, font20 } from '../../../../utils/fontSizes'
import { colors } from '../../../../utils/colors'
import { FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily'
import { ACCOUNT_TYPES } from '../../../../assets/DefaultData'
import Add from '../../../../assets/images/icons/plus.svg'
import { InsightAccountTypes } from '../../../../assets/dummy/dummy'
import Up from '../../../../assets/images/icons/inc.svg'
import Down from '../../../../assets/images/icons/dec.svg'

import { formatINR } from '../../../../utils/FormatUtil'

export default function InsightInfo({ info }: any) {
    const dataList = info || []
    return (
        <View style={{ marginTop: resAvarage(3) }} >
            <View>
                <FlatList
                    data={dataList}
                    numColumns={2}
                    scrollEnabled={false}
                    contentContainerStyle={{ alignItems: "center" }}
                    renderItem={({ item }: any) => {
                        const Icon = item?.type === "increment" ? Up : Down
                        return (
                            <View style={styles.card} >
                                <View style={styles.row} >
                                    <CustomText style={styles.title}>{item?.id}</CustomText>
                                </View>
                                <View>
                                    <CustomText style={styles.amount}>
                                        {item?.id === "Active Borrowers" ? item?.value : formatINR(item?.value || 0)}
                                    </CustomText>
                                    <View style={styles.innerRow} >
                                        <Icon width={resAvarage(3)} height={resAvarage(3)} />
                                        <CustomText style={[styles.type, { color: item?.type === "increment" ? colors.textGreen : colors.textRed }]}>{item?.per}%</CustomText>
                                    </View>
                                </View>
                            </View>
                        )
                    }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    innerRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: resAvarage(1)
    },
    btn: {
        borderRadius: resAvarage(100),
        backgroundColor: colors.black10,
        paddingVertical: resAvarage(1),
        alignItems: "center",
        justifyContent: "center"
    },
    header: {
        fontSize: font20,
        color: colors.black,
        fontFamily: FontSemiBold
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: font12,
        color: colors.black90,
        letterSpacing: resAvarage(0.2),
        textTransform: 'uppercase',
        fontFamily: FontRegular
    },
    see: {
        color: colors.black70,
        fontSize: font12,
        fontFamily: FontRegular
    },
    type: {
        color: colors.black,
        fontSize: font16,
        lineHeight: font16 * 1.3,
        fontFamily: FontMedium,
        textTransform: 'capitalize'
    },
    amount: {
        color: colors.black,
        fontSize: font20,
        lineHeight: font20 * 1.3,
        fontFamily: FontSemiBold,
        marginTop: resAvarage(1.5),
        marginBottom: resAvarage(2)
    },
    card: {
        width: resWidth(45),
        margin: resAvarage(1),
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(2.5),
        borderWidth: 1,
        borderColor: colors.black10,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconBox: {
        borderRadius: resAvarage(100),
        backgroundColor: colors.black20,
        padding: resAvarage(1.5)
    }
})