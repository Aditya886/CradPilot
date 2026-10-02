import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart, BubbleChart } from "react-native-gifted-charts";
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { FlatList } from 'react-native-gesture-handler';
import { colors } from '../../../../utils/colors';
import { font10, font12, font14, font16, font20, font24 } from '../../../../utils/fontSizes';
import { FontBold, FontMedium, FontRegular } from '../../../../utils/fontFamily';
import { formatINR } from '../../../../utils/FormatUtil';

interface CalculatorDetailsProps {
    interestPerDay: number;
    interestPerMonth: number;
    interestPerYear: number;
    totalInterest: number;
    totalPayable: number;
}

export default function CalculatorDetails({
    interestPerDay = 0,
    interestPerMonth = 0,
    interestPerYear = 0,
    totalInterest = 0,
    totalPayable = 0,
}: CalculatorDetailsProps) {
    return (
        <View style={styles.card} >
            <CustomText style={styles.title} >Calculation breakdown</CustomText>
            <View style={{ gap: resAvarage(2) }} >
                <View style={styles.row} >
                    <CustomText style={styles.subtitle} >Interest / day</CustomText>
                    <CustomText style={styles.value} >{formatINR(interestPerDay, true)}</CustomText>
                </View>
                <View style={styles.row} >
                    <CustomText style={styles.subtitle} >Interest / month</CustomText>
                    <CustomText style={styles.value} >{formatINR(interestPerMonth, false)}</CustomText>
                </View>
                <View style={styles.row} >
                    <CustomText style={styles.subtitle} >Interest / year</CustomText>
                    <CustomText style={styles.value} >{formatINR(interestPerYear, false)}</CustomText>
                </View>
                <View style={styles.row} >
                    <CustomText style={styles.subtitle} >Total interest</CustomText>
                    <CustomText style={styles.value} >{formatINR(totalInterest, false)}</CustomText>
                </View>
                <View style={styles.row} >
                    <CustomText style={styles.subtitle} >Total payable</CustomText>
                    <CustomText style={styles.value} >{formatINR(totalPayable, false)}</CustomText>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    noteView: {
        borderRadius: resAvarage(4),
        backgroundColor: colors.black10,
        paddingVertical: resAvarage(2),
        paddingHorizontal: resAvarage(2),
        marginTop: resAvarage(2),
    },
    note: {
        // width: "100%",
        lineHeight: font14 * 1.7,
        fontFamily: FontMedium
    },
    smallCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: colors.black20,
        paddingVertical: resAvarage(2)
    },
    card: {
        marginVertical: resAvarage(3),
        marginHorizontal: resAvarage(2),
        borderRadius: resAvarage(7),
        backgroundColor: colors.white,
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(3),
        shadowColor: colors.black,
        elevation: 3,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    row: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    text: {
        fontFamily: FontMedium,
        fontSize: font14,
        width: resWidth(18),
        textTransform: 'capitalize'
    },
    per: {
        fontFamily: FontRegular,
        fontSize: font14,
        color: colors.black90
    },
    title: {
        fontSize: font12,
        fontFamily: FontRegular,
        textTransform: 'uppercase',
        letterSpacing: resAvarage(0.3),
        color: colors.black90,
        marginBottom: resAvarage(3)
    },
    subtitle: {
        fontSize: font14,
        // letterSpacing: resAvarage(0.3),
        fontFamily: FontRegular,
        color: colors.black90,
    },
    value: {
        fontSize: font14,
        // letterSpacing: resAvarage(0.3),
        fontFamily: FontMedium,
        color: colors.black,
        width: resWidth(30),
        textAlign: 'right'
    }
})