import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import Income from '../../../../assets/images/icons/in.svg'
import Add from '../../../../assets/images/icons/added.svg'
import Outgoing from '../../../../assets/images/icons/out.svg'
import { colors } from '../../../../utils/colors'
import { FontBold, FontBoldP, FontBoldR, FontMedium, FontMediumR, FontRegular } from '../../../../utils/fontFamily'
import { font14, font12, font28, font34, font42, font35, font10, font16, font20 } from '../../../../utils/fontSizes'
import Phone from "../../../../assets/images/icons/phoneGray.svg"
import { formatINR } from '../../../../utils/FormatUtil'

export default function UserCard({ item, onDeleteUser }: any) {
    return (
        <View style={styles.card} >
            <View style={styles.row} >
                <CustomText style={styles.headerOne} >{item?.name}</CustomText>
                <View style={[styles.row, { justifyContent: "flex-start", gap: resWidth(3), alignItems: "center" }]} >
                    <View style={[styles.row, { justifyContent: "flex-start", gap: resWidth(1) }]} >
                        <Phone width={resAvarage(2.5)} height={resAvarage(2.5)} />
                        <CustomText style={styles.header} >{item?.phone || "N/A"}</CustomText>
                    </View>
                    <Menu>
                        <MenuTrigger>
                            <View style={styles.dotsButton}>
                                <View style={styles.dotsContainer}>
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                </View>
                            </View>
                        </MenuTrigger>
                        <MenuOptions customStyles={optionsStyles}>
                            <MenuOption onSelect={onDeleteUser} style={styles.menuOption}>
                                <CustomText style={[styles.menuOptionText, { color: colors.textRed }]}>Delete Borrower</CustomText>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                </View>
            </View>
            <View style={{ gap: resAvarage(1) }} >
                <CustomText style={styles.header} >{"Total Outstanding"}</CustomText>
                <CustomText style={styles.title} >{formatINR(item?.outStand ?? 0)}</CustomText>
            </View>
            <View style={styles.row} >
                <View style={{ gap: resAvarage(0.5) }} >
                    <CustomText style={styles.des}>Interest earned</CustomText>
                    <CustomText style={styles.subtitle}>{formatINR(item?.earn ?? 0)}</CustomText>
                </View>
                {item?.dueDate && item?.dueDate !== 'N/A' && (
                    <View style={{ gap: resAvarage(0.5) }} >
                        <CustomText style={styles.des}>Next due</CustomText>
                        <CustomText style={[styles.subtitle, item?.status === "OverDue" && { color: colors.textRed }]}>{item?.dueDate}</CustomText>
                    </View>
                )}
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
        alignItems: "center",
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
        gap: resAvarage(2.5)
    },
    headerOne: {
        fontSize: font20,
        fontFamily: FontMedium,
        textTransform: "uppercase",
        maxWidth: resWidth(45),
        letterSpacing: resAvarage(0.3),
        color: colors.white70
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
    },
    dotsButton: {
        padding: resAvarage(1.2),
    },
    dotsContainer: {
        flexDirection: 'column',
        gap: resAvarage(0.4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    dot: {
        width: resAvarage(0.6),
        height: resAvarage(0.6),
        borderRadius: resAvarage(0.3),
        backgroundColor: colors.white70
    },
    menuOption: {
        paddingVertical: resAvarage(1.5),
        paddingHorizontal: resAvarage(2),
    },
    menuOptionText: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black,
    },
})

const optionsStyles = {
    optionsContainer: {
        borderRadius: resAvarage(1),
        marginTop: resAvarage(4),
        padding: resAvarage(1),
        width: resWidth(42),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        backgroundColor: colors.bgWhite,
    },
};