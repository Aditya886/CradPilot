import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { FontSemiBold } from '../../../../utils/fontFamily'
import { font12 } from '../../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import AddTxn from "../../../../assets/images/icons/plus.svg"
import Person from "../../../../assets/images/icons/borrow.svg"
import Calculator from "../../../../assets/images/icons/calculator.svg"
import { navigate } from '../../../../navigation/NavigationUtils'

export default function FinSections() {
    return (
        <View style={styles.row} >
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigate("NewLoan")} style={styles.box} >
                <View style={styles.icon} >
                    <AddTxn width={resAvarage(3)} height={resAvarage(3)} />
                </View>
                <CustomText style={styles.subtitle} >New Loan</CustomText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigate("Borrowers")} style={styles.box} >
                <View style={styles.icon} >
                    <Person width={resAvarage(3)} height={resAvarage(3)} />
                </View>
                <CustomText style={styles.subtitle} >Borrowers</CustomText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigate("Calculator")} style={styles.box} >
                <View style={styles.icon} >
                    <Calculator width={resAvarage(3)} height={resAvarage(3)} />
                </View>
                <CustomText style={styles.subtitle} >Calculator</CustomText>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: colors.white,
        // marginTop: resAvarage(3),
        width: resWidth(28.5),
        alignItems: "center",
        borderRadius: resAvarage(5),
        paddingVertical: resAvarage(2.5),
        // marginHorizontal: resAvarage(3),
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
        fontFamily: FontSemiBold,
        textAlign: 'center'
    },
    icon: {
        backgroundColor: colors.black20,
        borderRadius: resAvarage(100),
        padding: resAvarage(1.5),
        justifyContent: "center",
        alignItems: "center"
    },
    row: {
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: resAvarage(2),
        marginHorizontal: resAvarage(2.5),
        marginVertical: resAvarage(4)
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