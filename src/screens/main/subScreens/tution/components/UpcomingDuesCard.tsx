import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font10, font12, font13, font16 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import { WhitePlusIcon } from './TuitionIcons';

export interface DueItem {
    id: string | number;
    name: string;
    dueDate: string;
    amount: number;
    status: 'Overdue' | 'Due Soon';
}

interface UpcomingDuesCardProps {
    dues?: DueItem[];
    onPressSeeAll?: () => void;
    onPressItem?: (item: DueItem) => void;
    onPressAddPayment?: (item: DueItem) => void;
}

export default function UpcomingDuesCard({
    dues = [],
    onPressSeeAll,
    onPressItem,
    onPressAddPayment,
}: UpcomingDuesCardProps) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.headerRow}>
                <CustomText style={styles.sectionTitle}>UPCOMING DUES</CustomText>
                <TouchableOpacity activeOpacity={0.7} onPress={onPressSeeAll}>
                    <CustomText style={styles.seeAllText}>See all</CustomText>
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                {dues.length > 0 ? (
                    dues.map((item, index) => {
                        const isLast = index === dues.length - 1;
                        const isOverdue = item.status === 'Overdue';

                        return (
                            <React.Fragment key={item.id}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => onPressItem?.(item)}
                                    style={styles.itemRow}
                                >
                                    <View style={styles.infoLeft}>
                                        <CustomText style={styles.studentName}>{item.name}</CustomText>
                                        <CustomText style={styles.dueDateText}>{item.dueDate}</CustomText>
                                    </View>

                                    <View style={styles.infoRight}>
                                        <View style={styles.amountBadgeCol}>
                                            <CustomText style={styles.amountText}>
                                                {formatINR(item.amount)}
                                            </CustomText>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    isOverdue ? styles.overdueBadge : styles.dueSoonBadge,
                                                ]}
                                            >
                                                <CustomText
                                                    style={[
                                                        styles.statusText,
                                                        isOverdue ? styles.overdueText : styles.dueSoonText,
                                                    ]}
                                                >
                                                    {item.status}
                                                </CustomText>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => onPressAddPayment?.(item)}
                                            style={styles.addPaymentButton}
                                        >
                                            <WhitePlusIcon size={resAvarage(3.2)} />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>

                                {!isLast && <View style={styles.itemDivider} />}
                            </React.Fragment>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <CustomText style={styles.emptyTitle}>No upcoming dues</CustomText>
                        <CustomText style={styles.emptySubtitle}>
                            All student fees are fully paid up!
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
        marginBottom: resAvarage(2),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: resAvarage(0.5),
        marginBottom: resAvarage(1.2),
    },
    sectionTitle: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: 'rgba(20, 20, 20, 0.55)',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    seeAllText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: 'rgba(20, 20, 20, 0.65)',
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
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(3.2),
    },
    infoLeft: {
        flex: 1,
        justifyContent: 'center',
    },
    studentName: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.black,
    },
    dueDateText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: 'rgba(20, 20, 20, 0.5)',
        marginTop: resAvarage(0.5),
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2.5),
    },
    amountBadgeCol: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    amountText: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
    },
    statusBadge: {
        paddingHorizontal: resAvarage(1.5),
        paddingVertical: resAvarage(0.3),
        borderRadius: resAvarage(100),
        marginTop: resAvarage(0.5),
    },
    overdueBadge: {
        backgroundColor: '#FDD8D8',
    },
    dueSoonBadge: {
        backgroundColor: '#FEF3C7',
    },
    statusText: {
        fontFamily: FontSemiBold,
        fontSize: font10,
    },
    overdueText: {
        color: '#CF4630',
    },
    dueSoonText: {
        color: '#D97706',
    },
    addPaymentButton: {
        width: resAvarage(6.5),
        height: resAvarage(6.5),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemDivider: {
        height: 1,
        backgroundColor: '#F3F3F3',
        marginHorizontal: resAvarage(3.5),
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
