import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import ButtonSlider from '../../../../ui/components/ButtonSlider'
import { font12, font18, font28 } from '../../../../utils/fontSizes';
import { FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { resAvarage, resWidth } from '../../../../utils/responsive';

export default function DebtsHeader({ selected, setSelected }: any) {
    const slider = ['Home', 'Persons', 'History']
    return (
        <View style={styles.main}>
            <View>
                <CustomText style={styles.title}>Debts</CustomText>
                <CustomText style={styles.header}>Who owes whom.</CustomText>
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