import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font11, font12, font13 } from '../../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import { AmortisationItem } from '../utils/emiCalculator';

interface AmortisationScheduleCardProps {
    schedule: AmortisationItem[];
}

export default function AmortisationScheduleCard({ schedule }: AmortisationScheduleCardProps) {
    const [expanded, setExpanded] = useState(false);

    const visibleItems = expanded ? schedule : schedule.slice(0, 12);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <CustomText style={styles.headerLabel}>AMORTISATION SCHEDULE</CustomText>
                {schedule.length > 12 && (
                    <CustomText style={styles.totalMonthsText}>
                        {schedule.length} months
                    </CustomText>
                )}
            </View>

            {visibleItems.map((item) => (
                <View key={item.emiNumber.toString()} style={styles.row}>
                    {/* Index Circle */}
                    <View style={styles.indexCircle}>
                        <CustomText style={styles.indexText}>{item.emiNumber}</CustomText>
                    </View>

                    {/* Date */}
                    <CustomText style={styles.dateText}>{item.dateStr}</CustomText>

                    {/* Principal */}
                    <CustomText style={styles.principalText}>
                        P {formatINR(item.principal)}
                    </CustomText>

                    {/* Interest */}
                    <CustomText style={styles.interestText}>
                        I {formatINR(item.interest)}
                    </CustomText>

                    {/* Status: Paid or Upcoming */}
                    <View style={styles.statusBadge}>
                        <CustomText style={[styles.statusText, item.isPaid && styles.paidText]}>
                            {item.isPaid ? 'Paid' : 'Upcoming'}
                        </CustomText>
                    </View>
                </View>
            ))}

            {/* Expand / Collapse Button if schedule is long */}
            {schedule.length > 12 && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setExpanded(!expanded)}
                    style={styles.expandButton}
                >
                    <CustomText style={styles.expandButtonText}>
                        {expanded ? 'Show less' : `View all (${schedule.length} EMIs)`}
                    </CustomText>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(4.5),
        borderWidth: 1,
        borderColor: '#ECECEC',
        paddingHorizontal: resWidth(4),
        paddingVertical: resAvarage(2.5),
        marginBottom: resAvarage(5),
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: resAvarage(2),
    },
    headerLabel: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    totalMonthsText: {
        fontSize: font11,
        fontFamily: FontRegular,
        color: '#8E8E93',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F7',
    },
    indexCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    indexText: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#4B5563',
    },
    dateText: {
        width: 60,
        fontSize: font12,
        fontFamily: FontMedium,
        color: '#141414',
    },
    principalText: {
        flex: 1,
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#4B5563',
        textAlign: 'right',
        marginRight: 10,
    },
    interestText: {
        flex: 1,
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#4B5563',
        textAlign: 'right',
        marginRight: 10,
    },
    statusBadge: {
        minWidth: 42,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: '#8E8E93',
    },
    paidText: {
        color: '#141414',
    },
    expandButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 6,
    },
    expandButtonText: {
        fontSize: font13,
        fontFamily: FontSemiBold,
        color: '#141414',
    },
});

