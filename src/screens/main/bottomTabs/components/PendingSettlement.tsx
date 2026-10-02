import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily'
import { font11, font26, font12, font20, font24, font14, font10 } from '../../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import CustomImage from '../../../../ui/components/CustomImage'
import { FlatList } from 'react-native-gesture-handler'
import { settleList } from '../../../../assets/dummy/dummy'

import { formatINR } from '../../../../utils/FormatUtil'
import { navigate } from '../../../../navigation/NavigationUtils'

interface PendingSettlementProps {
    data: any[];
    profileImage?: any;
}

export default function PendingSettlement({ data, profileImage }: PendingSettlementProps) {
    if (!data || data.length === 0) {
        return null;
    }

    return (
        <View>
            <CustomText style={styles.heading} >Pending Settlements</CustomText>
            <FlatList
                data={data}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }: any) => {
                    const initial = (item?.name?.trim()?.[0] || 'A').toUpperCase();
                    const isReceiving = item?.type === 'outgoing';
                    const displayOweText = isReceiving ? "You'll Receive" : "You Owe";
                    const amountColor = isReceiving ? colors.textGreen : colors.textRed;

                    return (
                        <TouchableOpacity 
                            onPress={() => navigate("DebtPersonDetails", { personId: item.id })} 
                            activeOpacity={0.7} 
                            style={styles.card}
                        >
                            <View style={styles.row} >
                                <View style={styles.avatar}>
                                    {profileImage ? (
                                        <CustomImage source={profileImage} style={styles.avatarImage} />
                                    ) : (
                                        <CustomText style={styles.avatarInitial}>{initial}</CustomText>
                                    )}
                                </View>
                                <View>
                                    <CustomText numberOfLines={1} style={styles.name}>{item?.name}</CustomText>
                                    <CustomText style={styles.amount}>{item?.date || 'Recent'}</CustomText>
                                </View>
                            </View>
                            <View style={{ gap: resAvarage(0.5) }} >
                                <CustomText style={[styles.header, { color: amountColor }]} >
                                    {formatINR(Math.abs(item?.remain))}
                                </CustomText>
                                <CustomText style={styles.type} >{displayOweText}</CustomText>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    list: {
        gap: resAvarage(1),
        paddingLeft: resAvarage(3),
        paddingRight: resAvarage(3),
        paddingVertical: resAvarage(4)
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: resAvarage(2)
    },
    name: {
        fontSize: font14,
        fontFamily: FontSemiBold,
    },
    amount: {
        fontSize: font14,
        fontFamily: FontRegular,
    },
    heading: {
        fontSize: font20,
        fontFamily: FontSemiBold,
        marginHorizontal: resAvarage(3)
    },
    card: {
        backgroundColor: colors.white,
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
        fontSize: font10,
    },
    avatar: {
        width: resWidth(10),
        height: resWidth(10),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarInitial: {
        fontFamily: FontMedium,
        fontSize: font20,
        lineHeight: font20 * 1.3,
        color: colors.textWhite,
    },
})