import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { navigate } from '../../../../navigation/NavigationUtils'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { resWidth, resAvarage } from '../../../../utils/responsive'
import { FontSemiBold, FontMedium } from '../../../../utils/fontFamily'
import { font13, font12, font18, font14 } from '../../../../utils/fontSizes'
import { formatDate } from '../../../../ui/components/TimeConverter'
import { formatINR } from '../../../../utils/FormatUtil'

export default function RecentLoan({ data }: any) {
    const resent = data || []
    if (resent.length === 0) return null;
    return (
        <View style={{ marginTop: resAvarage(2) }} >
            <CustomText style={styles.header} >Upcoming due dates</CustomText>
            <View>
                <FlatList
                    data={resent}
                    style={styles.card}
                    // contentContainerStyle={{ gap: resAvarage(2) }}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    renderItem={({ item }: any) => {
                        return (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (item?.borrower) {
                                        navigate("User", { data: item.borrower })
                                    }
                                }}
                                style={styles.cards}
                            >
                                {/* <View style={styles.innerRow} > */}
                                <View style={{ gap: resAvarage(1) }} >
                                    <View style={styles.row} >
                                        <CustomText style={styles.title}>{item?.title}</CustomText>
                                        <View style={[styles.status, item?.status?.toLowerCase() === "overdue" && { backgroundColor: colors.lightRedBg }]} >
                                            <CustomText style={[styles.name, item?.status?.toLowerCase() === "overdue" && { color: colors.redBtnColor }]} >{` ${item?.status}`}</CustomText>
                                        </View>
                                    </View>
                                    <CustomText style={styles.type}>{"Due " + (item?.date || 'N/A')}</CustomText>
                                </View>
                                {/* </View> */}
                                <View style={[styles.innerRow, { gap: resAvarage(1) }]} >
                                    <CustomText numberOfLines={1} style={[styles.amount, { color: colors.black }]}>{formatINR(item?.amount)}</CustomText>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: resAvarage(2)
    },
    status: {
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(1),
        paddingVertical: resAvarage(0.5),
        backgroundColor: colors.theme
    },
    header: {
        fontSize: font12,
        letterSpacing: resAvarage(0.3),
        textTransform: "uppercase",
        color: colors.black90,
        fontFamily: FontMedium,
        marginHorizontal: resAvarage(3),
    },
    card: {
        marginVertical: resAvarage(2),
    },
    cards: {
        marginBottom: resAvarage(2),
        marginHorizontal: resAvarage(3),
        borderBottomColor: colors.black10,
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(2),
        borderWidth: 1,
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
    innerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2)
    },
    optionText: {
        color: colors.black,
        fontSize: font13,
        fontFamily: FontSemiBold
    },
    type: {
        color: colors.black70,
        fontSize: font12,
        fontFamily: FontMedium,
        textTransform: 'capitalize'
    },
    amount: {
        color: colors.black,
        fontSize: font18,
        width: resWidth(20),
        textAlign: "right",
        fontFamily: FontSemiBold
    },
    name: {
        color: colors.black90,
        fontSize: font12,
        lineHeight: font14 * 1.3,
        fontFamily: FontSemiBold,
    },
    title: {
        fontSize: font14,
        maxWidth: resWidth(30),
        color: colors.black,
        letterSpacing: resAvarage(0.2),
        textTransform: 'capitalize',
        fontFamily: FontSemiBold
    },
})