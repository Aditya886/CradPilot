import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart, BubbleChart } from "react-native-gifted-charts";
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { FlatList } from 'react-native-gesture-handler';
import { colors } from '../../../../utils/colors';
import { font10, font12, font14, font16, font20, font24 } from '../../../../utils/fontSizes';
import { FontBold, FontMedium, FontRegular } from '../../../../utils/fontFamily';
import bag from "../../../../assets/images/icons/bag.svg"

import { formatINR } from '../../../../utils/FormatUtil'
import EmptyStateCard from '../../../../ui/components/EmptyStateCard'

export default function Spending({ chartData, listData }: any) {
    const data = chartData && chartData.length > 0 ? chartData : [
        { value: 100, color: colors.black20, name: "no data" }
    ];
    const recent = listData || [];

    const largest = chartData && chartData.length > 0 ? [...chartData].sort((a: any, b: any) => b.value - a.value)[0] : null;
    const hasData = chartData && chartData.length > 0;

    return (
        <View style={styles.card} >
            <CustomText style={styles.title} >Loan Share & Lendings</CustomText>
            {!hasData ? (
                <EmptyStateCard
                    title="No Lendings Found"
                    subtitle="Lending shares and top borrowers will appear here."
                    Icon={bag}
                    style={{ elevation: 0, borderWidth: 0, marginHorizontal: 0, paddingVertical: resAvarage(2) }}
                />
            ) : (
                <View>
                    <View style={[styles.row, { justifyContent: 'space-between', marginBottom: resAvarage(2) }]} >
                        <PieChart
                            data={data}
                            radius={resAvarage(12)}
                            innerRadius={resAvarage(9)}
                            donut={true}
                        />
                        <View>
                            <FlatList
                                data={data}
                                scrollEnabled={false}
                                contentContainerStyle={{ gap: resAvarage(1) }}
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
                    <View>
                        <CustomText style={styles.subtitle} >Top Borrowers (Outstanding)</CustomText>
                        <FlatList
                            data={recent}
                            scrollEnabled={false}
                            contentContainerStyle={{ marginTop: resAvarage(1) }}
                            renderItem={({ item, index }: any) => {
                                const last = recent?.length - 1
                                return (
                                    <View style={[styles.smallCard, { borderBottomWidth: index === last ? 0 : 1 }]} >
                                        <CustomText style={styles.text} >{item?.title}</CustomText>
                                        <CustomText style={styles.per} >{formatINR(item?.value)}</CustomText>
                                    </View>
                                )
                            }}
                        />
                    </View>
                    {largest && (
                        <View style={styles.noteView} >
                            <CustomText style={styles.note} >
                                {largest.name} <CustomText style={styles.per}>has the largest lending share of </CustomText>{largest.value}% <CustomText style={styles.per}>across all borrowers.</CustomText>
                            </CustomText>
                        </View>
                    )}
                </View>
            )}
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
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: resAvarage(1)
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
        fontSize: font20,
        fontFamily: FontBold,
        color: colors.textBlack
    },
    subtitle: {
        fontSize: font12,
        letterSpacing: resAvarage(0.3),
        fontFamily: FontRegular,
        color: colors.black90,
        textTransform: "uppercase"
    }
})