import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { FontBold, FontBoldR, FontSemiBold } from '../../../../utils/fontFamily'
import { font12, font14 } from '../../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { navigate } from '../../../../navigation/NavigationUtils'

export default function LoanDetail({ stats }: any) {
    return (
        <View style={styles.main} >
            <View style={styles.row} >
                <View style={styles.box} >
                    <CustomText style={styles.subtitle} >Active Loan</CustomText>
                    <View style={styles.icon} >
                        <CustomText style={styles.num} >{`${stats?.activeCount ?? 0}`}</CustomText>
                    </View>
                </View>
                <View style={styles.box} >
                    <CustomText style={styles.subtitle} >Payments recorded</CustomText>
                    <View style={styles.icon} >
                        <CustomText style={styles.num} >{`${stats?.paymentsCount ?? 0}`}</CustomText>
                    </View>
                </View>
            </View>
            <View style={styles.row} >
                <View style={styles.box} >
                    <CustomText style={styles.subtitle} >Completed Loan</CustomText>
                    <View style={styles.icon} >
                        <CustomText style={styles.num} >{`${stats?.completedCount ?? 0}`}</CustomText>
                    </View>
                </View>
                <View style={styles.box} >
                    <CustomText style={styles.subtitle} >Overdue</CustomText>
                    <View style={styles.icon} >
                        <CustomText style={styles.num} >{`${stats?.overdueCount ?? 0}`}</CustomText>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        marginHorizontal: resAvarage(2.5),
        marginTop: resAvarage(2),
    },
    num: {
        fontSize: font14,
        lineHeight: font14 * 1.3,
        fontFamily: FontBoldR,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: colors.black,
        backgroundColor: colors.black20,
        width: resAvarage(4),
        height: resAvarage(4),
        borderRadius: resAvarage(100)
    },
    box: {
        backgroundColor: colors.white,
        justifyContent: 'flex-end',
        width: resWidth(44),
        borderRadius: resAvarage(5),
        paddingVertical: resAvarage(2.5),
        paddingHorizontal: resAvarage(3),
        borderWidth: 1,
        gap: resAvarage(1),
        borderColor: colors.black10,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    subtitle: {
        fontSize: font12,
        textTransform: 'uppercase',
        maxWidth: resWidth(20),
    },
    icon: {
        // backgroundColor: colors.black20,
        borderRadius: resAvarage(2),
        flex: 1,
        // height: resAvarage(5),
        justifyContent: "center",
        // alignItems: "center"
    },
    row: {
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: resAvarage(2),
        marginVertical: resAvarage(0.5)
    },
    card: {
        backgroundColor: colors.white,
        // marginTop: resAvarage(3),
        width: resWidth(44),
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(3),
        // marginHorizontal: resAvarage(3),
        borderWidth: 1,
        gap: resAvarage(0.5),
        borderColor: colors.black10,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
})