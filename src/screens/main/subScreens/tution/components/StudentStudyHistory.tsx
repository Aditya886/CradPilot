import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font12, font13, font15 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';

export interface StudyRecord {
    id: string | number;
    date: string; // e.g. "14 Oct 2026"
    detail: string; // e.g. "Physics" or "Reason: Family Function"
    status: 'Present' | 'Absent' | 'Holiday';
}

interface StudentStudyHistoryProps {
    records?: StudyRecord[];
}

export default function StudentStudyHistory({
    records = [],
}: StudentStudyHistoryProps) {
    return (
        <View style={styles.wrapper}>
            <CustomText style={styles.sectionHeader}>STUDY HISTORY</CustomText>

            <View style={styles.cardContainer}>
                {records.length > 0 ? (
                    records.map((item, index) => {
                        const isLast = index === records.length - 1;
                        const isPresent = item.status === 'Present';
                        const isHoliday = item.status === 'Holiday';

                        return (
                            <React.Fragment key={item.id}>
                                <View style={styles.itemRow}>
                                    <View style={styles.infoCol}>
                                        <CustomText style={styles.dateText}>{item.date}</CustomText>
                                        <CustomText style={styles.detailText}>{item.detail}</CustomText>
                                    </View>
                                    <CustomText
                                        style={[
                                            styles.statusText,
                                            isPresent
                                                ? styles.statusPresent
                                                : isHoliday
                                                ? styles.statusHoliday
                                                : styles.statusAbsent,
                                        ]}
                                    >
                                        {item.status}
                                    </CustomText>
                                </View>
                                {!isLast && <View style={styles.divider} />}
                            </React.Fragment>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <CustomText style={styles.emptyTitle}>No study records</CustomText>
                        <CustomText style={styles.emptySubtitle}>
                            No classes or attendance sessions recorded yet.
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
    dateText: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
    },
    detailText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.4),
    },
    statusText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
    },
    statusPresent: {
        color: '#16A34A',
    },
    statusAbsent: {
        color: '#DC2626',
    },
    statusHoliday: {
        color: '#EA580C', // Orange for Teacher Absent / Holiday
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
