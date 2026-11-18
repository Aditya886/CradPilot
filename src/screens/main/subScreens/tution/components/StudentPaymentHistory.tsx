import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../../../../utils/fontFamily';
import { font12, font13, font15, font16 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';

export interface PaymentRecord {
    id: string | number;
    monthTitle: string; // e.g. "September 2026"
    paidDetail: string; // e.g. "Paid 3 Sept · Cash"
    amount: number; // e.g. 2000
}

interface StudentPaymentHistoryProps {
    history?: PaymentRecord[];
}

export default function StudentPaymentHistory({
    history = [],
}: StudentPaymentHistoryProps) {
    return (
        <View style={styles.wrapper}>
            <CustomText style={styles.sectionHeader}>PAYMENT HISTORY</CustomText>

            <View style={styles.cardContainer}>
                {history.length > 0 ? (
                    history.map((item, index) => {
                        const isLast = index === history.length - 1;
                        return (
                            <React.Fragment key={item.id}>
                                <View style={styles.itemRow}>
                                    <View style={styles.infoCol}>
                                        <CustomText style={styles.monthTitle}>{item.monthTitle}</CustomText>
                                        <CustomText style={styles.paidDetailText}>{item.paidDetail}</CustomText>
                                    </View>
                                    <CustomText style={styles.amountText}>{formatINR(item.amount)}</CustomText>
                                </View>
                                {!isLast && <View style={styles.divider} />}
                            </React.Fragment>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <CustomText style={styles.emptyTitle}>No payment history</CustomText>
                        <CustomText style={styles.emptySubtitle}>
                            No past fee records found for this student.
                        </CustomText>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: resAvarage(2.5),
    },
    sectionHeader: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: resAvarage(1.2),
        paddingHorizontal: resAvarage(0.5),
    },
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        overflow: 'hidden',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(3),
    },
    infoCol: {
        flex: 1,
    },
    monthTitle: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
    },
    paidDetailText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.4),
    },
    amountText: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F3F3',
        marginHorizontal: resAvarage(4),
    },
    emptyContainer: {
        paddingVertical: resAvarage(5),
        paddingHorizontal: resAvarage(3),
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.black,
        marginBottom: resAvarage(0.5),
    },
    emptySubtitle: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#64748B',
        textAlign: 'center',
    },
});
