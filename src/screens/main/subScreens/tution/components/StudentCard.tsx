import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font11, font12, font13, font16, font17 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import { BatchMiniIcon } from './TuitionIcons';

export interface StudentItem {
    id: string | number;
    name: string;
    classGrade: string; // e.g. "Class 10"
    parentName: string; // e.g. "Rekha Kumar"
    phone: string; // e.g. "99582 11870"
    subjects: string[]; // e.g. ["Mathematics", "Physics"]
    batchName: string; // e.g. "Evening Seniors"
    batchTiming: string; // e.g. "5:00 PM – 7:00 PM"
    feeAmount: number; // e.g. 2000
    feePeriod: string; // e.g. "month" or "semester"
    feeStatus: 'Overdue' | 'Paid' | 'Due Soon';
    dueInfo: string; // e.g. "Next due 3 Oct" or "Fully paid"
    attendanceStatus: string; // e.g. "Not marked"
    isActive?: boolean;
}

interface StudentCardProps {
    student: StudentItem;
    onPress?: (student: StudentItem) => void;
}

export default function StudentCard({ student, onPress }: StudentCardProps) {
    const isOverdue = student.feeStatus === 'Overdue';
    const isPaid = student.feeStatus === 'Paid';

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress?.(student)}
            style={styles.card}
        >
            {/* Row 1: Name and Status Badge */}
            <View style={styles.headerRow}>
                <CustomText style={styles.studentName}>{student.name}</CustomText>
                <View
                    style={[
                        styles.badgeContainer,
                        isOverdue
                            ? styles.overdueBadge
                            : isPaid
                            ? styles.paidBadge
                            : styles.dueSoonBadge,
                    ]}
                >
                    <CustomText
                        style={[
                            styles.badgeText,
                            isOverdue
                                ? styles.overdueText
                                : isPaid
                                ? styles.paidText
                                : styles.dueSoonText,
                        ]}
                    >
                        {student.feeStatus}
                    </CustomText>
                </View>
            </View>

            {/* Row 2: Class · Parent · Phone */}
            <CustomText style={styles.subInfoText}>
                {`${student.classGrade} · ${student.parentName} · ${student.phone}`}
            </CustomText>

            {/* Row 3: Subjects */}
            <CustomText style={styles.subjectsText}>
                {student.subjects.join(' • ')}
            </CustomText>

            {/* Row 4: Batch & Timings */}
            <View style={styles.batchRow}>
                <BatchMiniIcon size={resAvarage(2.6)} color="#64748B" />
                <CustomText style={styles.batchText}>
                    {`${student.batchName} · ${student.batchTiming}`}
                </CustomText>
            </View>

            {/* Row 5: Fee & Due Status */}
            <View style={styles.feeRow}>
                <View style={styles.feeLeft}>
                    <CustomText style={styles.feeAmount}>
                        {formatINR(student.feeAmount)}
                    </CustomText>
                    <CustomText style={styles.feePeriod}>
                        {` / ${student.feePeriod}`}
                    </CustomText>
                </View>
                <CustomText style={styles.dueInfoText}>
                    {student.dueInfo}
                </CustomText>
            </View>

            {/* Row 6: Attendance Status */}
            <CustomText style={styles.attendanceText}>
                {`Today: ${student.attendanceStatus}`}
            </CustomText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(3.5),
        marginBottom: resAvarage(2),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentName: {
        fontFamily: FontBold,
        fontSize: font17,
        color: colors.black,
        flex: 1,
        marginRight: resAvarage(2),
    },
    badgeContainer: {
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(0.4),
        borderRadius: resAvarage(100),
    },
    overdueBadge: {
        backgroundColor: '#FCEDED',
    },
    paidBadge: {
        backgroundColor: '#DCFCE7',
    },
    dueSoonBadge: {
        backgroundColor: '#FEF3C7',
    },
    badgeText: {
        fontFamily: FontSemiBold,
        fontSize: font11,
    },
    overdueText: {
        color: '#DC2626',
    },
    paidText: {
        color: '#16A34A',
    },
    dueSoonText: {
        color: '#D97706',
    },
    subInfoText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.6),
    },
    subjectsText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#475569',
        marginTop: resAvarage(1.2),
    },
    batchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
        marginTop: resAvarage(0.8),
    },
    batchText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#64748B',
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: resAvarage(2),
    },
    feeLeft: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    feeAmount: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
    },
    feePeriod: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
    },
    dueInfoText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
    },
    attendanceText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#64748B',
        marginTop: resAvarage(1.2),
    },
});
