import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { font12, font13, font14, font16, font18, font20 } from '../../../../utils/fontSizes'
import { colors } from '../../../../utils/colors'
import { FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily'
import { ACCOUNT_TYPES } from '../../../../assets/DefaultData'
import Dots from '../../../../assets/images/icons/dots.svg'
import { recentAData, recentData } from '../../../../assets/dummy/dummy'

import Settle from '../../../../assets/images/icons/settle.svg'
import BlackIn from '../../../../assets/images/icons/blackin.svg'
import BlackOut from '../../../../assets/images/icons/blackout.svg'
import { formatINR } from '../../../../utils/FormatUtil'

interface RecentActivityProps {
    data: any[];
    onViewAll: () => void;
}

export default function RecentActivity({ data, onViewAll }: RecentActivityProps) {
    return (
        <View style={{ marginTop: resAvarage(3) }} >
            <View style={[styles.row, { marginHorizontal: resAvarage(3) }]}>
                <CustomText style={styles.header} >Recent Activity</CustomText>
                <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
                    <CustomText style={styles.see}>View All</CustomText>
                </TouchableOpacity>
            </View>
            <View>
                {(!data || data.length === 0) ? (
                    <CustomText style={[styles.type, { textAlign: 'center', marginVertical: resAvarage(4) }]}>
                        No recent activity.
                    </CustomText>
                ) : (
                    <FlatList
                        data={data}
                        contentContainerStyle={styles.card}
                        scrollEnabled={false}
                        removeClippedSubviews={false}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }: any) => {
                            const isIncoming = item?.type === 'incoming';
                            const isOutgoing = item?.type === 'outgoing';
                            const isDone = item?.type === 'done';

                            const IconComponent = isDone ? Settle : isIncoming ? BlackIn : BlackOut;
                            const displayTitle = isDone ? "Settle" : isIncoming ? "You Borrowed" : "You Lent";
                            const displayCategory = isDone ? "Settled" : isIncoming ? "Incoming" : "Outgoing";
                            const formattedAmount = `${isIncoming ? '+' : isOutgoing ? '-' : ''}${formatINR(item?.amount)}`;
                            const amountColor = isIncoming ? colors.textGreen : colors.black;

                            return (
                                <View style={styles.cards} >
                                    <View style={styles.innerRow} >
                                        <View style={styles.iconBox} >
                                            <IconComponent width={resAvarage(4)} height={resAvarage(4)} />
                                        </View>
                                        <View>
                                            <CustomText style={styles.title}>
                                                {displayTitle}
                                                <CustomText style={styles.name} >{` · ${item?.name}`}</CustomText>
                                            </CustomText>
                                            <CustomText style={styles.type}>
                                                {item?.date || 'Recent'} · {displayCategory}
                                            </CustomText>
                                        </View>
                                    </View>
                                    <View style={[styles.innerRow, { gap: resAvarage(1) }]} >
                                        <CustomText numberOfLines={1} style={[styles.amount, { color: amountColor }]}>
                                            {formattedAmount}
                                        </CustomText>
                                    </View>
                                </View>
                            )
                        }}
                    />
                )}
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
        width: resWidth(50),
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
        fontSize: font18,
        width: resWidth(20),
        textAlign: "right",
        fontFamily: FontSemiBold
    },
    name: {
        color: colors.black90,
        fontSize: font14,
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