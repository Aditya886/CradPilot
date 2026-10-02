import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontSemiBold, FontRegular, FontMedium } from '../../../../utils/fontFamily';
import { font20, font14, font12, font13 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';

export default function TransactionCard({ item, Icon }: any) {
    return (
        <View style={styles.cards} >
            <View style={styles.innerRow} >
                <View style={styles.iconBox} >
                    <Icon width={resAvarage(4)} height={resAvarage(4)} />
                </View>
                <View>
                    <CustomText style={styles.title}>{item?.title}</CustomText>
                    <CustomText style={styles.type}>{item?.lastUpdate} · {item?.category}</CustomText>
                </View>
            </View>
            <View style={[styles.innerRow, { gap: resAvarage(1) }]} >
                <CustomText numberOfLines={1} style={[styles.amount, { color: item?.category === "Incoming" ? colors.textGreen : colors.black }]}>{item?.amount}</CustomText>
            </View>
        </View>
    )
}


const optionsStyles = {
    optionsContainer: {
        borderRadius: resAvarage(3),
        marginTop: resWidth(10),
        padding: 5,
        width: resWidth(35),
        maxHeight: resWidth(70),
        borderWidth: 0.5,
        borderColor: colors.black30,
        // backgroundColor: colors.lightBgColor,
        // overflow: 'hidden',
    },
};

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
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2)
    },
    innerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2)
    },
    title: {
        fontSize: font14,
        maxWidth: resWidth(42),
        color: colors.black,
        letterSpacing: resAvarage(0.2),
        textTransform: 'capitalize',
        fontFamily: FontSemiBold
    },
    see: {
        color: colors.black70,
        fontSize: font12,
        fontFamily: FontRegular
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
        fontSize: font20,
        width: resWidth(20),
        textAlign: "right",
        fontFamily: FontSemiBold
    },
    cards: {
        borderBottomColor: colors.black10,
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: resWidth(4),
        paddingVertical: resAvarage(3)
    },
    card: {
        margin: resAvarage(2),
        backgroundColor: colors.white,
        borderRadius: resAvarage(6),
        borderWidth: 1,
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
    iconBox: {
        borderRadius: resAvarage(100),
        backgroundColor: colors.black20,
        padding: resAvarage(1.8)
    }
})