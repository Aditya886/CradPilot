import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart, BubbleChart } from "react-native-gifted-charts";
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { FlatList } from 'react-native-gesture-handler';
import { colors } from '../../../../utils/colors';
import { font10, font12, font14, font16, font20, font24 } from '../../../../utils/fontSizes';
import { FontBold, FontMedium, FontRegular } from '../../../../utils/fontFamily';

interface CalculatorGraphProps {
    principal: number;
    totalInterest: number;
}

export default function CalculatorGraph({ principal = 0, totalInterest = 0 }: CalculatorGraphProps) {
    const total = principal + totalInterest;
    const principalPercent = total > 0 ? Math.round((principal / total) * 100) : 100;
    const interestPercent = total > 0 ? 100 - principalPercent : 0;

    const data = [
        { value: principalPercent, color: colors.black, name: "Principal" },
        { value: interestPercent, color: colors.theme, name: "Interest" },
    ]
    return (
        <View style={styles.card} >
            <CustomText style={styles.title} >Principal vs interest</CustomText>
            <View>
                <View style={[styles.row, { justifyContent: 'space-between' }]} >
                    <PieChart
                        data={data}
                        radius={resAvarage(10)}
                        innerRadius={resAvarage(8)}
                        donut={true}
                    />
                    <FlatList
                        data={data}
                        scrollEnabled={false}
                        contentContainerStyle={{ gap: resAvarage(2), marginTop: resAvarage(2) }}
                        renderItem={({ item }: any) => {
                            return (
                                <View style={styles.row} >
                                    <View style={{ flexDirection: "row", alignItems: 'center', gap: resAvarage(1) }}>
                                        <View style={{ backgroundColor: item?.color, width: resAvarage(1.5), height: resAvarage(1.5), borderRadius: resAvarage(100) }} />
                                        <CustomText style={styles.text} >{item?.name}</CustomText>
                                    </View>
                                    <CustomText style={styles.per} >{item?.value}%</CustomText>
                                </View>
                            )
                        }}
                    />
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
        justifyContent: "flex-start",
        // alignItems: "center",
        gap: resAvarage(4)
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
        fontSize: font12,
        letterSpacing: resAvarage(0.3),
        fontFamily: FontRegular,
        color: colors.black90,
        textTransform: "uppercase"
    }
})