import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { navigate } from '../../../../navigation/NavigationUtils'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { FontSemiBold, FontMedium, FontBold } from '../../../../utils/fontFamily'
import { font16, font14, font12, font18 } from '../../../../utils/fontSizes'
import { formatINR } from '../../../../utils/FormatUtil'

export default function LoansCard({ item, name }: any) {
    const installment = item?.installment ?? item?.Installment ?? 0;
    const totalInstallments = item?.totalInstallments ?? 1;
    const percentage = totalInstallments > 0 ? Math.round((installment / totalInstallments) * 100) : 0;

    const getProgressBarColor = () => {
        const s = item?.status?.toLowerCase();
        if (s === 'overdue') {
            return colors.textRed;
        }
        if (s === 'good' || s === 'completed' || s === 'complete') {
            return colors.textGreen;
        }
        if (s === 'active') {
            return colors.theme;
        }
        return colors.theme;
    };
    const progressBarColor = getProgressBarColor();

    return (
        <TouchableOpacity onPress={() => navigate("LoanDetails", { item: item, name: name })} style={[styles.card]} >
            <View style={[styles.row, { alignItems: "flex-start" }]} >
                <View style={{ gap: resWidth(0) }} >
                    <CustomText style={styles.name} >{item?.title}</CustomText>
                    <CustomText style={styles.subtitle} >{`${formatINR(item?.amount)} · ${item?.intrest}% ${item?.intrestType}`}</CustomText>
                </View>
                <View style={[styles.status, {
                    backgroundColor: item?.status === "OverDue" ? colors.lightRedBg : item?.status === "Active" ? colors.theme : colors.black20,
                }]}>
                    <CustomText style={[styles.statename, item?.status === "OverDue" && {
                        color: colors.textRed,
                    }]} >{item?.status}</CustomText>
                </View>
            </View>
            <View style={styles.row} >
                <View style={{ gap: resWidth(0.5) }} >
                    <CustomText style={styles.title} >Outstanding</CustomText>
                    <CustomText style={styles.value} >{formatINR(item?.outStand)}</CustomText>
                </View>
                <View style={{ gap: resWidth(0.5) }} >
                    <CustomText style={styles.title} >Paid</CustomText>
                    <CustomText style={styles.value} >{formatINR(item?.amount - item?.outStand)}</CustomText>
                </View>
                {item?.date && item?.date !== 'N/A' && (
                    <View style={{ gap: resWidth(0.5) }} >
                        <CustomText style={styles.title} >New Due</CustomText>
                        <CustomText style={styles.value} >{item?.date}</CustomText>
                    </View>
                )}
            </View>
            <View style={styles.progressContainer}>
                <View style={styles.row} >
                    <CustomText style={styles.installmentText}>{`${installment} / ${totalInstallments} Installments`}</CustomText>
                    <CustomText style={styles.percentageText}>{`${percentage}%`}</CustomText>
                </View>
                <View style={styles.track}>
                    <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: progressBarColor }]} />
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    value: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.black,
        maxWidth: resWidth(26),
    },
    title: {
        fontFamily: FontMedium,
        fontSize: font14,
        color: colors.black90,
        maxWidth: resWidth(26),
    },
    statename: {
        color: colors.black90,
        fontSize: font12,
        lineHeight: font12 * 1.3,
        fontFamily: FontBold,
    },
    status: {
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(1.5),
        paddingVertical: resAvarage(0.8),
        backgroundColor: colors.theme
    },
    name: {
        fontSize: font18,
        lineHeight: font18 * 1.3,

        fontFamily: FontMedium,
        color: colors.textBlack
    },
    subtitle: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black90,
        lineHeight: font14 * 1.3,
        letterSpacing: resAvarage(0.1)
    },
    card: {
        gap: resAvarage(2.5),
        marginHorizontal: resAvarage(3),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(3),
        backgroundColor: colors.white,
        borderRadius: resAvarage(6),
        borderWidth: 1,
        borderColor: colors.black20,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    progressContainer: {
        gap: resAvarage(1),
    },
    installmentText: {
        fontSize: font14,
        color: colors.black60,
        fontFamily: FontMedium,
    },
    percentageText: {
        fontSize: font14,
        color: colors.black90,
        fontFamily: FontSemiBold,
    },
    track: {
        height: resAvarage(0.8),
        width: '100%',
        backgroundColor: colors.black10,
        borderRadius: resAvarage(0.4),
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: resAvarage(0.4),
    },
})