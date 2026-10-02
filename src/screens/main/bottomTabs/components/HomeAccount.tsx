import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { font12, font14, font16, font20 } from '../../../../utils/fontSizes'
import { colors } from '../../../../utils/colors'
import { FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily'
import { ACCOUNT_TYPES } from '../../../../assets/DefaultData'
import Add from '../../../../assets/images/icons/plus.svg'

export default function HomeAccount() {
    return (
        <View style={{ marginTop: resAvarage(3) }} >
            <View style={[styles.row, { marginHorizontal: resAvarage(3) }]}>
                <CustomText style={styles.header} >Accounts</CustomText>
                <CustomText style={styles.see}>See All</CustomText>
            </View>
            <View>
                <FlatList
                    data={ACCOUNT_TYPES}
                    numColumns={2}
                    scrollEnabled={false}
                    contentContainerStyle={{ alignItems: "center" }}
                    renderItem={({ item }: any) => {
                        const Icon = item?.icon
                        return (
                            <View style={styles.card} >
                                <View style={styles.row} >
                                    <View style={styles.iconBox} >
                                        <Icon width={resAvarage(3.5)} height={resAvarage(3.5)} />
                                    </View>
                                    <CustomText style={styles.title}>{item?.title}</CustomText>
                                </View>
                                {/* <View style={styles.btn} >
                                    <Add width={resAvarage(4)} height={resAvarage(4)} />
                                </View> */}
                                <View>
                                    <CustomText style={styles.type}>{item.id}</CustomText>
                                    <CustomText style={styles.amount}>8,682</CustomText>
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
        marginBottom: resAvarage(2)
    },
    title: {
        fontSize: font12,
        width: resWidth(20),
        color: colors.black,
        textAlign: "right",
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
        fontSize: font14,
        fontFamily: FontMedium,
        textTransform: 'capitalize'
    },
    amount: {
        color: colors.black,
        fontSize: font20,
        fontFamily: FontSemiBold
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