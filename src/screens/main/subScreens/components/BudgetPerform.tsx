import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { BarChart, LineChart, PieChart, PopulationPyramid, RadarChart, BubbleChart } from "react-native-gifted-charts";
import { resAvarage, resWidth, scaleSize } from '../../../../utils/responsive';
import { FlatList } from 'react-native-gesture-handler';
import { colors } from '../../../../utils/colors';
import { font10, font12, font15, font14, font16, font20, font24 } from '../../../../utils/fontSizes';
import { FontBold, FontMedium, FontRegular } from '../../../../utils/fontFamily';

import { formatINR } from '../../../../utils/FormatUtil'
import EmptyStateCard from '../../../../ui/components/EmptyStateCard'

export default function BudgetPerform({ loanProgress }: any) {
    const budget = loanProgress || []
    return (
        <View style={styles.card} >
            <CustomText style={styles.title} >Loan Payoffs</CustomText>
            {budget.length === 0 ? (
                <EmptyStateCard
                    title="No Active Loans"
                    subtitle="Loan payoff progress charts will appear once you record active loans."
                    Icon={null}
                    style={{ elevation: 0, borderWidth: 0, marginHorizontal: 0, paddingVertical: resAvarage(2) }}
                />
            ) : (
                <FlatList
                    data={budget}
                renderItem={({ item }: any) => {
                    return (
                        <View style={{ gap: resAvarage(1), marginTop: resAvarage(0.5) }} >
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <CustomText style={[styles.perInc]} >{item?.title}</CustomText>
                                <CustomText style={[styles.perInc, { color: colors.black90 }]} >{`${formatINR(item?.value)} / ${formatINR(item?.total)}`}</CustomText>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${(item?.value / item?.total) * 100}%`,
                                            backgroundColor: item?.value > item?.total ? colors.textRed : item?.value < item?.total / 2 ? colors.theme : colors.black
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    )
                }}
            />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    perbox: {
        backgroundColor: colors.lightBlueBg,
        borderRadius: scaleSize(3),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: resWidth(3),
        paddingVertical: resWidth(1)
    },
    perInc: {
        fontSize: font14,
        lineHeight: font14 * 1.3,
        fontFamily: FontMedium,
        color: colors.black,
    },
    progressBarContainer: {
        height: scaleSize(8),
        width: '100%',
        backgroundColor: colors.black10,
        borderRadius: resAvarage(100),
        overflow: 'hidden',
        marginBottom: resAvarage(2),
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
    },
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
        color: colors.textBlack,
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