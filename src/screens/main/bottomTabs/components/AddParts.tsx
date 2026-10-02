import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '../../../../utils/colors'
import { FontMedium, FontSemiBold } from '../../../../utils/fontFamily'
import { font12, font28, font14, font24, font16, font10, font11, font26 } from '../../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import CustomText from '../../../../ui/components/CustomText'
import AddPerson from '../../../../assets/images/icons/addPerson.svg'
import AddTxn from '../../../../assets/images/icons/plus.svg'
import Settle from '../../../../assets/images/icons/settle.svg'

import { TouchableOpacity } from 'react-native'
import { formatINR } from '../../../../utils/FormatUtil'

interface AddPartsProps {
    totalOwe: number;
    totalReceive: number;
    receiveCount: number;
    payCount: number;
    onAddPerson: () => void;
    onAddTxn: () => void;
}

export default function AddParts({
    totalOwe,
    totalReceive,
    receiveCount,
    payCount,
    onAddPerson,
    onAddTxn,
}: AddPartsProps) {
    return (
        <View style={styles.main} >
            <View style={styles.row} >
                <View style={styles.card} >
                    <CustomText style={styles.title} >You'll Receive</CustomText>
                    <View style={{ gap: resAvarage(0.5) }} >
                        <CustomText style={styles.header} >{formatINR(totalReceive)}</CustomText>
                        <CustomText style={styles.type} >{`${receiveCount} ${receiveCount === 1 ? 'person' : 'people'}`}</CustomText>
                    </View>
                </View>
                <View style={styles.card} >
                    <CustomText style={styles.title} >You Owe</CustomText>
                    <View style={{ gap: resAvarage(0.5) }} >
                        <CustomText style={[styles.header, { color: colors.textRed }]} >{formatINR(totalOwe)}</CustomText>
                        <CustomText style={styles.type} >{`${payCount} ${payCount === 1 ? 'person' : 'people'}`}</CustomText>
                    </View>
                </View>
            </View>
            <View style={[styles.row, { justifyContent: "flex-start", gap: resAvarage(2) }]} >
                <TouchableOpacity onPress={onAddPerson} activeOpacity={0.7} style={styles.box} >
                    <View style={styles.icon} >
                        <AddPerson width={resAvarage(3)} height={resAvarage(3)} />
                    </View>
                    <CustomText style={styles.subtitle} >Add Person</CustomText>
                </TouchableOpacity>
                <TouchableOpacity onPress={onAddTxn} activeOpacity={0.7} style={styles.box} >
                    <View style={styles.icon} >
                        <AddTxn width={resAvarage(3)} height={resAvarage(3)} />
                    </View>
                    <CustomText style={styles.subtitle} >Add Txn</CustomText>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        marginVertical: resAvarage(5),
        gap: resAvarage(3),
        marginHorizontal: resAvarage(3)
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
        justifyContent: "space-between",
        alignItems: "center"
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
    title: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: colors.black80,
        letterSpacing: resAvarage(0.3),
        textTransform: 'uppercase',
    },
    header: {
        fontFamily: FontSemiBold,
        color: colors.textGreen,
        fontSize: font26,
    },
    type: {
        fontFamily: FontMedium,
        color: colors.black90,
        fontSize: font12,
    },
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
    }
})