import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { FlatList } from 'react-native-gesture-handler'
import { colors } from '../../../../utils/colors'
import { FontSemiBold, FontRegular, FontMedium } from '../../../../utils/fontFamily'
import { font20, font14, font12, font13, font18, font16 } from '../../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { personData } from '../../../../assets/dummy/dummy'
import Next from '../../../../assets/images/icons/next.svg'
import { navigate } from '../../../../navigation/NavigationUtils'

import Settle from '../../../../assets/images/icons/settle.svg'
import BlackIn from '../../../../assets/images/icons/blackin.svg'
import BlackOut from '../../../../assets/images/icons/blackout.svg'
import { formatINR } from '../../../../utils/FormatUtil'

interface PersonDataListProps {
    data: any[];
}

export default function PersonDataList({ data }: PersonDataListProps) {
    const peopleCount = data?.length || 0;

    return (
        <View>
            <CustomText style={styles.heading} >
                {`${peopleCount} ${peopleCount === 1 ? 'Person' : 'People'}`}
            </CustomText>
            {peopleCount === 0 ? (
                <CustomText style={[styles.type, { textAlign: 'center', marginVertical: resAvarage(4) }]}>
                    No contacts found.
                </CustomText>
            ) : (
                <FlatList
                    data={data}
                    contentContainerStyle={styles.card}
                    scrollEnabled={false}
                    removeClippedSubviews={false}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }: any) => {
                        const remainVal = item?.remain ?? 0;
                        const isLent = remainVal > 0;
                        const isBorrowed = remainVal < 0;

                        const IconComponent = remainVal === 0 ? Settle : isBorrowed ? BlackIn : BlackOut;
                        const condition = isLent 
                            ? "You will get" 
                            : isBorrowed 
                                ? "You will pay" 
                                : "Settled";

                        const amountColor = remainVal === 0 
                            ? colors.textGreen 
                            : isBorrowed 
                                ? colors.textRed 
                                : colors.black;

                        return (
                            <TouchableOpacity 
                                onPress={() => navigate("DebtPersonDetails", { personId: item.id })} 
                                activeOpacity={0.7} 
                                style={styles.cards}
                            >
                                <View style={styles.innerRow} >
                                    <View style={styles.iconBox} >
                                        <IconComponent width={resAvarage(4)} height={resAvarage(4)} />
                                    </View>
                                    <View>
                                        <CustomText style={styles.title}>{item?.name}</CustomText>
                                        <CustomText style={styles.type}>
                                            {item?.lastUpdate || 'Recent'} · {`${item?.txn_count || 0} ${item?.txn_count === 1 ? 'record' : 'records'}`}
                                        </CustomText>
                                    </View>
                                </View>
                                <View style={[styles.row, { gap: resAvarage(1) }]} >
                                    <View style={{ alignItems: "flex-end" }}>
                                        {remainVal !== 0 && (
                                            <CustomText numberOfLines={1} style={[styles.amount, { color: amountColor }]}>
                                                {formatINR(Math.abs(remainVal))}
                                            </CustomText>
                                        )}
                                        <CustomText style={[styles.type, remainVal === 0 && { fontFamily: FontSemiBold, fontSize: font16, color: colors.textGreen }]} >
                                            {condition}
                                        </CustomText>
                                    </View>
                                    <Next width={resAvarage(3)} height={resAvarage(3)} />
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: resAvarage(100),
        backgroundColor: colors.black10,
        paddingVertical: resAvarage(1),
        alignItems: "center",
        justifyContent: "center"
    },
    heading: {
        fontSize: font16,
        color: colors.black90,
        fontFamily: FontRegular,
        textAlign: "center",
        marginHorizontal: resAvarage(3),
        marginTop: resAvarage(1)
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
        fontSize: font16,
        width: resWidth(42),
        color: colors.black,
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
        // textTransform: 'capitalize'
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