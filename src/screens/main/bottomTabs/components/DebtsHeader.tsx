import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import ButtonSlider from '../../../../ui/components/ButtonSlider'
import { font12, font18, font28 } from '../../../../utils/fontSizes';
import { FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import Back from '../../../../assets/images/icons/back.svg';
import { colors } from '../../../../utils/colors';
import { goBack } from '../../../../navigation/NavigationUtils';

export default function DebtsHeader({ selected, setSelected, showBack }: any) {
    const slider = ['Home', 'Persons', 'History']
    return (
        <View style={styles.main}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => goBack()} style={styles.back}>
                        <Back width={resAvarage(5)} height={resAvarage(5)} />
                    </TouchableOpacity>
                )}
                <View>
                    <CustomText style={styles.title}>Debts</CustomText>
                    <CustomText style={styles.header}>Who owes whom.</CustomText>
                </View>
            </View>
            <View>
                <ButtonSlider
                    onSelect={item => setSelected(item)}
                    options={slider}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        paddingHorizontal: resAvarage(3),
        paddingBottom: resAvarage(2),
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
    },
    back: {
        backgroundColor: colors.white,
        padding: resAvarage(1),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: colors.black10,
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: font12,
        fontFamily: FontRegular,
        textTransform: 'uppercase',
        letterSpacing: resAvarage(0.2)
    },
    header: {
        fontSize: font28,
        width: resWidth(40),
        fontFamily: FontSemiBold
    },
})