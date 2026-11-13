import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    TouchableOpacity,
    Modal,
    TextInput,
    TouchableWithoutFeedback,
} from 'react-native';
import { CommonBg } from '../../../../ui/common/CommonBg';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { font10, font11, font12, font13, font14, font15, font16, font18, font20 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { navigate } from '../../../../navigation/NavigationUtils';
import { showFlashMessage } from '../../../../utils/flashMessage';
import InsightHeader from '../components/InsightHeader';
import {
    ClockIcon,
    ChevronRightIcon,
    GraduationCapIcon,
    RescheduleIcon,
    TeacherLeaveIcon,
} from './components/TuitionIcons';
import ExportImportButton from '../../../../ui/components/ExportImportButton';
import ExportImportModal from '../../../../ui/modals/ExportImportModal';
import { ExportColumn } from '../../../../services/exportService';
import { importService } from '../../../../services/importService';

export interface BatchStudent {
    id: string;
    name: string;
    classGrade: string;
    phone: string;
    parentName: string;
    feeAmount: string;
    feeStatus: string;
    subjects: string[];
}

export interface BatchItem {
    id: string;
    title: string;
    timing: string;
    days: string;
    classRange: string;
    studentsCount: number;
    attendanceMarked: boolean;
    isToday: boolean;
    students: BatchStudent[];
    // Reschedule metadata
    rescheduledTiming?: string;
    rescheduledDate?: string;
    rescheduleType?: 'single' | 'regular';
    rescheduleReason?: string;
    // Teacher leave metadata
    teacherLeaveReason?: string;
    teacherLeaveDate?: string;
}

export interface TeacherLeaveRecord {
    id: string;
    date: string;
    batchTitle: string;
    reason: string;
    leaveType: 'Teacher Absent' | 'Sick Leave' | 'Personal' | 'National Holiday' | 'Other';
}

const BATCH_DATA: BatchItem[] = [
    {
        id: '1',
        title: 'Morning Juniors',
        timing: '7:00 AM – 8:30 AM',
        days: 'Mon – Sat',
        classRange: 'Class 6 – 8',
        studentsCount: 2,
        attendanceMarked: false,
        isToday: true,
        students: [
            {
                id: 'kabir',
                name: 'Kabir Singh',
                classGrade: 'Class 6',
                phone: '+91 98765 43210',
                parentName: 'Ramesh Singh',
                feeAmount: '₹1,200',
                feeStatus: 'Due Soon',
                subjects: ['Mathematics', 'Science'],
            },
            {
                id: 'rahul',
                name: 'Rahul Sharma',
                classGrade: 'Class 8',
                phone: '+91 98765 43211',
                parentName: 'Anil Sharma',
                feeAmount: '₹1,500',
                feeStatus: 'Due Soon',
                subjects: ['Science', 'English'],
            },
        ],
    },
    {
        id: '2',
        title: 'Evening Seniors',
        timing: '5:00 PM – 7:00 PM',
        days: 'Mon, Wed, Fri',
        classRange: 'Class 9 – 10',
        studentsCount: 2,
        attendanceMarked: false,
        isToday: true,
        students: [
            {
                id: 'priya',
                name: 'Priya Verma',
                classGrade: 'Class 9',
                phone: '+91 98765 43212',
                parentName: 'Sanjay Verma',
                feeAmount: '₹1,800',
                feeStatus: 'Due Soon',
                subjects: ['Physics', 'Chemistry', 'Biology'],
            },
            {
                id: 'aman',
                name: 'Aman Kumar',
                classGrade: 'Class 10',
                phone: '+91 98765 43213',
                parentName: 'Vijay Kumar',
                feeAmount: '₹2,000',
                feeStatus: 'Overdue',
                subjects: ['Mathematics', 'Science'],
            },
        ],
    },
    {
        id: '3',
        title: 'Board Prep',
        timing: '7:30 PM – 9:00 PM',
        days: 'Tue, Thu, Sat',
        classRange: 'Class 11 – 12 · PCM/B',
        studentsCount: 2,
        attendanceMarked: false,
        isToday: false,
        students: [
            {
                id: 'sneha',
                name: 'Sneha Iyer',
                classGrade: 'Class 11',
                phone: '+91 98765 43214',
                parentName: 'Subramanian Iyer',
                feeAmount: '₹10,000',
                feeStatus: 'Overdue',
                subjects: ['Physics', 'Chemistry', 'Maths'],
            },
            {
                id: 'ishaan',
                name: 'Ishaan Gupta',
                classGrade: 'Class 12',
                phone: '+91 98765 43215',
                parentName: 'Manoj Gupta',
                feeAmount: '₹3,500',
                feeStatus: 'Paid',
                subjects: ['Physics', 'Mathematics'],
            },
        ],
    },
];

export default function Batch() {
    const [batches, setBatches] = useState<BatchItem[]>(BATCH_DATA);
    const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);

    // Add Batch Modal State
    const [isAddBatchModalVisible, setIsAddBatchModalVisible] = useState(false);
    const [newBatchTitle, setNewBatchTitle] = useState('');
    const [newBatchTiming, setNewBatchTiming] = useState('');
    const [newBatchDays, setNewBatchDays] = useState('');
    const [newBatchClassRange, setNewBatchClassRange] = useState('');
    const [newBatchIsToday, setNewBatchIsToday] = useState(false);

    // Reschedule Modal State
    const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
    const [rescheduleBatchTarget, setRescheduleBatchTarget] = useState<BatchItem | null>(null);
    const [rescheduleType, setRescheduleType] = useState<'single' | 'regular'>('single');
    const [rescheduleTiming, setRescheduleTiming] = useState('');
    const [rescheduleDays, setRescheduleDays] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('16/10/2026');
    const [rescheduleReason, setRescheduleReason] = useState('');

    // Teacher Leave State & Modal
    const [teacherLeaves, setTeacherLeaves] = useState<TeacherLeaveRecord[]>([
        {
            id: '1',
            date: '2 Oct 2026',
            batchTitle: 'All Batches',
            reason: 'Gandhi Jayanti · National Holiday',
            leaveType: 'National Holiday',
        },
    ]);
    const [isTeacherLeaveModalVisible, setIsTeacherLeaveModalVisible] = useState(false);
    const [leaveBatchTarget, setLeaveBatchTarget] = useState<string>('All Batches');
    const [leaveType, setLeaveType] = useState<string>('Teacher Absent');
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveDate, setLeaveDate] = useState('16/10/2026');
    const [showExportModal, setShowExportModal] = useState(false);

    const todayBatches = batches.filter((b) => b.isToday);
    const otherBatches = batches.filter((b) => !b.isToday);

    const handleBatchPress = (batch: BatchItem) => {
        setSelectedBatch(batch);
        setIsBatchModalVisible(true);
    };

    const handleStudentPress = (student: BatchStudent) => {
        setIsBatchModalVisible(false);
        const feeNum = Number(String(student.feeAmount).replace(/[^0-9]/g, '')) || 2000;
        navigate('StudentDetails', {
            student: {
                id: student.id,
                name: student.name,
                classGrade: student.classGrade,
                phone: student.phone,
                parentName: student.parentName,
                batchName: selectedBatch?.title || 'Morning Batch',
                batchTiming: `${selectedBatch?.timing || '05:00 PM'} · ${selectedBatch?.days || 'Mon, Wed, Fri'}`,
                feeAmount: feeNum,
                feePeriod: 'month',
                feeStatus: (student.feeStatus as 'Overdue' | 'Paid' | 'Due Soon') || 'Due Soon',
                dueInfo: 'Next due 3 Oct',
                attendanceStatus: 'Not marked',
                subjects: student.subjects,
                isActive: true,
            },
        });
    };

    const handleTakeAttendance = () => {
        setIsBatchModalVisible(false);
        navigate('Attendance', {
            selectedBatchTitle: selectedBatch?.title,
        });
    };

    const handleCreateBatch = () => {
        if (!newBatchTitle.trim()) {
            showFlashMessage('Please enter batch title', 'error');
            return;
        }

        const newBatch: BatchItem = {
            id: String(Date.now()),
            title: newBatchTitle.trim(),
            timing: newBatchTiming.trim() || '5:00 PM – 6:30 PM',
            days: newBatchDays.trim() || 'Mon, Wed, Fri',
            classRange: newBatchClassRange.trim() || 'Class 9 – 10',
            studentsCount: 0,
            attendanceMarked: false,
            isToday: newBatchIsToday,
            students: [],
        };

        setBatches((prev) => [newBatch, ...prev]);
        setIsAddBatchModalVisible(false);
        setNewBatchTitle('');
        setNewBatchTiming('');
        setNewBatchDays('');
        setNewBatchClassRange('');
        setNewBatchIsToday(false);

        showFlashMessage(`Batch "${newBatch.title}" created successfully!`, 'success');
    };

    // Reschedule Handlers
    const handleOpenReschedule = (batch: BatchItem) => {
        setRescheduleBatchTarget(batch);
        setRescheduleType('single');
        setRescheduleTiming(batch.rescheduledTiming || batch.timing);
        setRescheduleDays(batch.days);
        setRescheduleDate('16/10/2026');
        setRescheduleReason(batch.rescheduleReason || '');
        setIsRescheduleModalVisible(true);
    };

    const handleConfirmReschedule = () => {
        if (!rescheduleBatchTarget) return;
        if (!rescheduleTiming.trim()) {
            showFlashMessage('Please enter the new timing', 'error');
            return;
        }

        setBatches((prev) =>
            prev.map((b) => {
                if (b.id === rescheduleBatchTarget.id) {
                    if (rescheduleType === 'regular') {
                        return {
                            ...b,
                            timing: rescheduleTiming.trim(),
                            days: rescheduleDays.trim() || b.days,
                            rescheduledTiming: undefined,
                            rescheduleType: 'regular',
                            rescheduleReason: undefined,
                        };
                    } else {
                        return {
                            ...b,
                            rescheduledTiming: rescheduleTiming.trim(),
                            rescheduledDate: rescheduleDate,
                            rescheduleType: 'single',
                            rescheduleReason: rescheduleReason.trim() || 'Single-day time shift',
                        };
                    }
                }
                return b;
            })
        );

        if (selectedBatch?.id === rescheduleBatchTarget.id) {
            setSelectedBatch((prev) =>
                prev
                    ? {
                          ...prev,
                          timing: rescheduleType === 'regular' ? rescheduleTiming.trim() : prev.timing,
                          days: rescheduleType === 'regular' ? (rescheduleDays.trim() || prev.days) : prev.days,
                          rescheduledTiming: rescheduleType === 'single' ? rescheduleTiming.trim() : undefined,
                          rescheduleType,
                      }
                    : null
            );
        }

        setIsRescheduleModalVisible(false);
        showFlashMessage(
            rescheduleType === 'single'
                ? `Batch "${rescheduleBatchTarget.title}" rescheduled for today!`
                : `Batch "${rescheduleBatchTarget.title}" regular timing updated!`,
            'success'
        );
    };

    const handleResetReschedule = (batchId: string) => {
        setBatches((prev) =>
            prev.map((b) => {
                if (b.id === batchId) {
                    return {
                        ...b,
                        rescheduledTiming: undefined,
                        rescheduleType: undefined,
                        rescheduleReason: undefined,
                        rescheduledDate: undefined,
                    };
                }
                return b;
            })
        );

        if (selectedBatch?.id === batchId) {
            setSelectedBatch((prev) =>
                prev
                    ? {
                          ...prev,
                          rescheduledTiming: undefined,
                          rescheduleType: undefined,
                      }
                    : null
            );
        }

        showFlashMessage('Batch restored to original schedule', 'success');
        setIsRescheduleModalVisible(false);
    };

    // Teacher Leave Handlers
    const handleOpenMarkLeaveModal = (batchTitle?: string) => {
        setLeaveBatchTarget(batchTitle || 'All Batches');
        setLeaveType('Teacher Absent');
        setLeaveReason('');
        setLeaveDate('16/10/2026');
        setIsTeacherLeaveModalVisible(true);
    };

    const handleConfirmTeacherLeave = () => {
        const finalReason = leaveReason.trim() || leaveType;
        const newRecord: TeacherLeaveRecord = {
            id: String(Date.now()),
            date: leaveDate,
            batchTitle: leaveBatchTarget,
            reason: finalReason,
            leaveType: leaveType as any,
        };

        setTeacherLeaves((prev) => [newRecord, ...prev]);

        // Update batches with leave status
        setBatches((prev) =>
            prev.map((b) => {
                if (leaveBatchTarget === 'All Batches' || b.title === leaveBatchTarget) {
                    return {
                        ...b,
                        teacherLeaveReason: finalReason,
                        teacherLeaveDate: leaveDate,
                    };
                }
                return b;
            })
        );

        if (selectedBatch && (leaveBatchTarget === 'All Batches' || selectedBatch.title === leaveBatchTarget)) {
            setSelectedBatch((prev) =>
                prev
                    ? {
                          ...prev,
                          teacherLeaveReason: finalReason,
                          teacherLeaveDate: leaveDate,
                      }
                    : null
            );
        }

        setIsTeacherLeaveModalVisible(false);
        showFlashMessage(`Teacher leave recorded for ${leaveBatchTarget}!`, 'success');
    };

    const handleCancelTeacherLeave = (leaveId: string) => {
        const leaveToCancel = teacherLeaves.find((l) => l.id === leaveId);
        setTeacherLeaves((prev) => prev.filter((l) => l.id !== leaveId));

        if (leaveToCancel) {
            setBatches((prev) =>
                prev.map((b) => {
                    if (leaveToCancel.batchTitle === 'All Batches' || b.title === leaveToCancel.batchTitle) {
                        return {
                            ...b,
                            teacherLeaveReason: undefined,
                            teacherLeaveDate: undefined,
                        };
                    }
                    return b;
                })
            );

            if (selectedBatch && (leaveToCancel.batchTitle === 'All Batches' || selectedBatch.title === leaveToCancel.batchTitle)) {
                setSelectedBatch((prev) =>
                    prev
                        ? {
                              ...prev,
                              teacherLeaveReason: undefined,
                              teacherLeaveDate: undefined,
                          }
                        : null
                );
            }
        }
        showFlashMessage('Teacher leave cancelled', 'success');
    };

    const renderBatchCard = (batch: BatchItem) => (
        <TouchableOpacity
            key={batch.id}
            activeOpacity={0.8}
            onPress={() => handleBatchPress(batch)}
            style={styles.batchCard}
        >
            <View style={styles.cardHeaderRow}>
                <CustomText style={styles.batchTitle}>{batch.title}</CustomText>
                <ChevronRightIcon size={resAvarage(2)} color="#1E293B" />
            </View>

            {/* Rescheduled Banner */}
            {batch.rescheduledTiming && (
                <View style={styles.cardAlertBannerBlue}>
                    <RescheduleIcon size={resAvarage(1.7)} color="#2563EB" />
                    <CustomText style={styles.cardAlertBannerBlueText}>
                        {`Rescheduled (${batch.rescheduleType === 'single' ? 'Today' : 'Regular'}): ${batch.rescheduledTiming}`}
                    </CustomText>
                </View>
            )}

            {/* Teacher Leave Banner */}
            {batch.teacherLeaveReason && (
                <View style={styles.cardAlertBannerOrange}>
                    <TeacherLeaveIcon size={resAvarage(1.7)} color="#EA580C" />
                    <CustomText style={styles.cardAlertBannerOrangeText}>
                        {`Teacher Absent (Holiday) · ${batch.teacherLeaveReason}`}
                    </CustomText>
                </View>
            )}

            {/* Timing Row */}
            <View style={styles.timingRow}>
                <ClockIcon size={resAvarage(1.8)} color="#64748B" />
                <CustomText style={styles.timingText}>
                    {`${batch.rescheduledTiming || batch.timing} · ${batch.days}`}
                </CustomText>
            </View>

            {/* Class Range */}
            <CustomText style={styles.classRangeText}>{batch.classRange}</CustomText>

            {/* Tags & Action Row */}
            <View style={styles.tagsAndActionsRow}>
                <View style={styles.tagsRow}>
                    <View style={styles.studentsCountPill}>
                        <CustomText style={styles.studentsCountText}>
                            {`${batch.studentsCount} students`}
                        </CustomText>
                    </View>

                    {batch.teacherLeaveReason ? (
                        <View style={styles.teacherLeaveTagPill}>
                            <CustomText style={styles.teacherLeaveTagText}>
                                Teacher on Leave
                            </CustomText>
                        </View>
                    ) : (
                        !batch.attendanceMarked &&
                        batch.isToday && (
                            <View style={styles.attendanceNotMarkedPill}>
                                <CustomText style={styles.attendanceNotMarkedText}>
                                    Attendance not marked
                                </CustomText>
                            </View>
                        )
                    )}
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.cardQuickActions}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            handleOpenReschedule(batch);
                        }}
                        style={styles.cardQuickBtnBlue}
                    >
                        <RescheduleIcon size={resAvarage(1.5)} color="#2563EB" />
                        <CustomText style={styles.cardQuickBtnBlueText}>Reschedule</CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            handleOpenMarkLeaveModal(batch.title);
                        }}
                        style={styles.cardQuickBtnOrange}
                    >
                        <TeacherLeaveIcon size={resAvarage(1.5)} color="#EA580C" />
                        <CustomText style={styles.cardQuickBtnOrangeText}>Leave</CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    const batchExportColumns: ExportColumn[] = [
        { key: 'title', label: 'Batch Title' },
        { key: 'timing', label: 'Batch Timing' },
        { key: 'days', label: 'Schedule Days' },
        { key: 'studentsCount', label: 'Students Enrolled', type: 'number' },
        { key: 'capacity', label: 'Max Capacity', type: 'number' },
        { key: 'subject', label: 'Subjects' },
    ];

    const batchExportRows = React.useMemo(() => {
        return batches.map(b => ({
            title: b.title,
            timing: b.rescheduledTiming || b.timing,
            days: b.days,
            studentsCount: b.studentsCount,
            capacity: b.capacity,
            subject: b.subject || b.grades?.join(', ') || 'General',
        }));
    }, [batches]);

    const batchSampleCsv = `Batch Title,Batch Timing,Schedule Days,Students Enrolled,Max Capacity,Subjects
Morning Juniors,7:00 AM – 8:30 AM,Mon – Sat,2,15,Class 6-9
Evening Seniors,5:00 PM – 7:00 PM,Mon · Wed · Fri,2,12,Class 10-11
Board Prep,7:30 PM – 9:00 PM,Tue · Thu · Sat,2,10,Class 12`;

    return (
        <CommonBg>
            <InsightHeader
                title={"Batches"}
                subtitle={"Batchwise Info"}
                rightComponent={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: resAvarage(1) }}>
                        <ExportImportButton onPress={() => setShowExportModal(true)} />
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsAddBatchModalVisible(true)}
                            style={styles.headerAddBtn}
                        >
                            <CustomText style={styles.headerAddBtnText}>+ Add Batch</CustomText>
                        </TouchableOpacity>
                    </View>
                }
            />

            <ExportImportModal
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                sectionTitle="Tuition Batches"
                sectionSubtitle="Timing Groups & Capacity"
                exportColumns={batchExportColumns}
                exportRows={batchExportRows}
                exportSummary={{
                    'Total Batches': batches.length,
                    'Active Today': todayBatches.length,
                    'Total Enrolled': batches.reduce((sum, b) => sum + b.studentsCount, 0),
                }}
                defaultFilename={`CredPilot_Batches_${new Date().toISOString().split('T')[0]}`}
                sampleImportFormat={batchSampleCsv}
                onImportData={async (rawInput) => {
                    const { rows } = importService.parseTabularData(rawInput);
                    if (rows.length === 0) {
                        return { success: false, message: 'No valid batch rows found', rowCount: 0 };
                    }
                    const newBatches: BatchItem[] = rows.map((r, idx) => ({
                        id: String(Date.now() + idx),
                        title: r['batchtitle'] || r['title'] || `Batch ${idx + 1}`,
                        timing: r['batchtiming'] || r['timing'] || '5:00 PM – 6:30 PM',
                        days: r['scheduledays'] || r['days'] || 'Mon, Wed, Fri',
                        studentsCount: parseInt(r['studentsenrolled'] || r['count'] || '0', 10) || 0,
                        students: [],
                        capacity: parseInt(r['maxcapacity'] || r['capacity'] || '15', 10) || 15,
                        grades: ['Class 10'],
                        subject: r['subjects'] || 'Mathematics',
                        isToday: true,
                        isFull: false,
                        isActive: true,
                    }));
                    setBatches(prev => [...newBatches, ...prev]);
                    return {
                        success: true,
                        message: `Successfully imported ${newBatches.length} new batches!`,
                        rowCount: newBatches.length,
                    };
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. TODAY · FRI Section */}
                <View style={styles.sectionBlock}>
                    <CustomText style={styles.sectionHeader}>TODAY · FRI</CustomText>
                    {todayBatches.length > 0 ? (
                        todayBatches.map(renderBatchCard)
                    ) : (
                        <View style={styles.emptyBlock}>
                            <CustomText style={styles.emptyTitle}>No batches scheduled for today</CustomText>
                            <CustomText style={styles.emptySubtitle}>
                                All batches for today have completed or none are scheduled.
                            </CustomText>
                        </View>
                    )}
                </View>

                {/* 2. OTHER BATCHES Section */}
                <View style={styles.sectionBlock}>
                    <CustomText style={styles.sectionHeader}>OTHER BATCHES</CustomText>
                    {otherBatches.length > 0 ? (
                        otherBatches.map(renderBatchCard)
                    ) : (
                        <View style={styles.emptyBlock}>
                            <CustomText style={styles.emptyTitle}>No other batches</CustomText>
                            <CustomText style={styles.emptySubtitle}>
                                Tap "+ Add Batch" above to create another batch schedule.
                            </CustomText>
                        </View>
                    )}
                </View>

                {/* 3. TEACHER LEAVES & HOLIDAYS Section */}
                <View style={styles.sectionBlock}>
                    <View style={styles.sectionHeaderRow}>
                        <CustomText style={styles.sectionHeader}>TEACHER LEAVES & HOLIDAYS</CustomText>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleOpenMarkLeaveModal()}
                            style={styles.markLeaveSmallBtn}
                        >
                            <CustomText style={styles.markLeaveSmallBtnText}>+ Mark Leave</CustomText>
                        </TouchableOpacity>
                    </View>

                    {teacherLeaves.length > 0 ? (
                        teacherLeaves.map((leave) => (
                            <View key={leave.id} style={styles.teacherLeaveCard}>
                                <View style={styles.teacherLeaveLeft}>
                                    <View style={styles.teacherLeaveIconWrap}>
                                        <TeacherLeaveIcon size={resAvarage(2.4)} color="#EA580C" />
                                    </View>
                                    <View style={styles.teacherLeaveInfo}>
                                        <View style={styles.teacherLeaveHeaderRow}>
                                            <CustomText style={styles.teacherLeaveDate}>{leave.date}</CustomText>
                                            <View style={styles.teacherLeaveBadge}>
                                                <CustomText style={styles.teacherLeaveBadgeText}>
                                                    Teacher Absent (Holiday)
                                                </CustomText>
                                            </View>
                                        </View>
                                        <CustomText style={styles.teacherLeaveReason}>{leave.reason}</CustomText>
                                        <CustomText style={styles.teacherLeaveBatch}>{`Applies to: ${leave.batchTitle}`}</CustomText>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => handleCancelTeacherLeave(leave.id)}
                                    style={styles.cancelLeaveBtn}
                                >
                                    <CustomText style={styles.cancelLeaveBtnText}>✕ Cancel</CustomText>
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyBlock}>
                            <CustomText style={styles.emptyTitle}>No teacher leaves marked</CustomText>
                            <CustomText style={styles.emptySubtitle}>
                                All classes are scheduled normally. Tap "+ Mark Leave" to record a holiday or leave.
                            </CustomText>
                        </View>
                    )}
                </View>

                {/* Bottom Footer */}
                <CustomText style={styles.footer}>
                    on-device · offline · private
                </CustomText>
            </ScrollView>

            {/* Batch Details Modal with Students Linked to StudentDetails */}
            <Modal
                visible={isBatchModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsBatchModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsBatchModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalCard}>
                                <View style={styles.modalHeaderRow}>
                                    <View style={styles.modalHeaderInfo}>
                                        <CustomText style={styles.modalBatchTitle}>
                                            {selectedBatch?.title}
                                        </CustomText>
                                        <CustomText style={styles.modalBatchTiming}>
                                            {selectedBatch?.rescheduledTiming || selectedBatch?.timing} · {selectedBatch?.days}
                                        </CustomText>
                                        <CustomText style={styles.modalBatchClass}>
                                            {selectedBatch?.classRange}
                                        </CustomText>
                                    </View>
                                </View>

                                {/* Rescheduled Banner in Modal */}
                                {selectedBatch?.rescheduledTiming && (
                                    <View style={styles.modalBannerBlue}>
                                        <RescheduleIcon size={resAvarage(1.8)} color="#2563EB" />
                                        <CustomText style={styles.modalBannerBlueText}>
                                            {`Rescheduled (${selectedBatch.rescheduleType === 'single' ? 'Single day' : 'Regular'}): ${selectedBatch.rescheduledTiming}`}
                                        </CustomText>
                                    </View>
                                )}

                                {/* Teacher Leave Banner in Modal */}
                                {selectedBatch?.teacherLeaveReason && (
                                    <View style={styles.modalBannerOrange}>
                                        <TeacherLeaveIcon size={resAvarage(1.8)} color="#EA580C" />
                                        <CustomText style={styles.modalBannerOrangeText}>
                                            {`Teacher Absent (Holiday) · ${selectedBatch.teacherLeaveReason}`}
                                        </CustomText>
                                    </View>
                                )}

                                {/* Modal Quick Action Pills: Reschedule & Leave */}
                                <View style={styles.modalQuickBarRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            if (selectedBatch) {
                                                handleOpenReschedule(selectedBatch);
                                            }
                                        }}
                                        style={styles.modalQuickActionPillBlue}
                                    >
                                        <RescheduleIcon size={resAvarage(1.8)} color="#2563EB" />
                                        <CustomText style={styles.modalQuickActionPillBlueText}>
                                            Reschedule
                                        </CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            if (selectedBatch) {
                                                handleOpenMarkLeaveModal(selectedBatch.title);
                                            }
                                        }}
                                        style={styles.modalQuickActionPillOrange}
                                    >
                                        <TeacherLeaveIcon size={resAvarage(1.8)} color="#EA580C" />
                                        <CustomText style={styles.modalQuickActionPillOrangeText}>
                                            Mark Leave
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>

                                {/* Enrolled Students List Header */}
                                <CustomText style={styles.modalStudentsSectionHeader}>
                                    ENROLLED STUDENTS (TAP TO VIEW DETAILS)
                                </CustomText>

                                <View style={styles.modalStudentsList}>
                                    {selectedBatch && selectedBatch.students.length > 0 ? (
                                        selectedBatch.students.map((student) => (
                                            <TouchableOpacity
                                                key={student.id}
                                                activeOpacity={0.7}
                                                onPress={() => handleStudentPress(student)}
                                                style={styles.studentItemRow}
                                            >
                                                <View style={styles.studentAvatar}>
                                                    <GraduationCapIcon size={resAvarage(2.2)} color="#1E293B" />
                                                </View>
                                                <View style={styles.studentInfoCol}>
                                                    <CustomText style={styles.studentItemName}>
                                                        {student.name}
                                                    </CustomText>
                                                    <CustomText style={styles.studentItemSub}>
                                                        {student.classGrade} · Fee: {student.feeAmount}
                                                    </CustomText>
                                                </View>
                                                <ChevronRightIcon size={resAvarage(1.8)} color="#94A3B8" />
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <View style={styles.emptyStudentsBox}>
                                            <CustomText style={styles.emptyStudentsText}>
                                                No students enrolled in this batch yet.
                                            </CustomText>
                                            <TouchableOpacity
                                                style={styles.enrollStudentBtn}
                                                onPress={() => {
                                                    setIsBatchModalVisible(false);
                                                    navigate('AddStudent');
                                                }}
                                            >
                                                <CustomText style={styles.enrollStudentBtnText}>
                                                    + Enroll Student
                                                </CustomText>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                {/* Modal Actions */}
                                <View style={styles.modalActionsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        onPress={handleTakeAttendance}
                                        style={styles.modalAttendanceBtn}
                                    >
                                        <CustomText style={styles.modalAttendanceBtnText}>
                                            Mark Attendance
                                        </CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setIsBatchModalVisible(false)}
                                        style={styles.modalCloseBtn}
                                    >
                                        <CustomText style={styles.modalCloseBtnText}>
                                            Close
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Create New Batch Modal */}
            <Modal
                visible={isAddBatchModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAddBatchModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsAddBatchModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalCard}>
                                <CustomText style={styles.modalAddBatchTitle}>
                                    Create New Batch
                                </CustomText>
                                <CustomText style={styles.modalAddBatchSubtitle}>
                                    Set up a new timing group for your students.
                                </CustomText>

                                {/* Batch Title Input */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>BATCH TITLE</CustomText>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. Afternoon Juniors"
                                        placeholderTextColor="#94A3B8"
                                        value={newBatchTitle}
                                        onChangeText={setNewBatchTitle}
                                    />
                                </View>

                                {/* Timing Input */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>TIMING</CustomText>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. 3:00 PM – 4:30 PM"
                                        placeholderTextColor="#94A3B8"
                                        value={newBatchTiming}
                                        onChangeText={setNewBatchTiming}
                                    />
                                </View>

                                {/* Days Input */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>DAYS</CustomText>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. Mon, Wed, Fri or Daily"
                                        placeholderTextColor="#94A3B8"
                                        value={newBatchDays}
                                        onChangeText={setNewBatchDays}
                                    />
                                </View>

                                {/* Class Range */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>CLASS / GRADE RANGE</CustomText>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. Class 7 – 9"
                                        placeholderTextColor="#94A3B8"
                                        value={newBatchClassRange}
                                        onChangeText={setNewBatchClassRange}
                                    />
                                </View>

                                {/* Schedule for Today Toggle */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setNewBatchIsToday((prev) => !prev)}
                                    style={styles.toggleRow}
                                >
                                    <View style={[styles.checkboxBox, newBatchIsToday && styles.checkboxBoxActive]}>
                                        {newBatchIsToday && <CustomText style={styles.checkboxTick}>✓</CustomText>}
                                    </View>
                                    <CustomText style={styles.toggleText}>
                                        This batch has classes today
                                    </CustomText>
                                </TouchableOpacity>

                                {/* Modal Actions */}
                                <View style={styles.modalActionsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setIsAddBatchModalVisible(false)}
                                        style={styles.modalCloseBtn}
                                    >
                                        <CustomText style={styles.modalCloseBtnText}>Cancel</CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={handleCreateBatch}
                                        style={styles.modalAttendanceBtn}
                                    >
                                        <CustomText style={styles.modalAttendanceBtnText}>
                                            Create Batch
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Reschedule Batch Modal (Single day vs Regular) */}
            <Modal
                visible={isRescheduleModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsRescheduleModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsRescheduleModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalCard}>
                                <CustomText style={styles.modalAddBatchTitle}>
                                    Reschedule Batch
                                </CustomText>
                                <CustomText style={styles.modalAddBatchSubtitle}>
                                    {`Update timing for ${rescheduleBatchTarget?.title || 'Batch'}`}
                                </CustomText>

                                {/* Type Segmented Switcher: Single Day vs Regular */}
                                <View style={styles.typeSwitcherRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setRescheduleType('single')}
                                        style={[
                                            styles.typeSwitchBtn,
                                            rescheduleType === 'single' && styles.typeSwitchBtnActive,
                                        ]}
                                    >
                                        <CustomText
                                            style={[
                                                styles.typeSwitchText,
                                                rescheduleType === 'single' && styles.typeSwitchTextActive,
                                            ]}
                                        >
                                            Single Day (Today)
                                        </CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setRescheduleType('regular')}
                                        style={[
                                            styles.typeSwitchBtn,
                                            rescheduleType === 'regular' && styles.typeSwitchBtnActive,
                                        ]}
                                    >
                                        <CustomText
                                            style={[
                                                styles.typeSwitchText,
                                                rescheduleType === 'regular' && styles.typeSwitchTextActive,
                                            ]}
                                        >
                                            Regular (Permanent)
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>

                                {/* New Timing Input */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>
                                        {rescheduleType === 'single'
                                            ? 'TEMPORARY TIMING FOR TODAY'
                                            : 'NEW REGULAR TIMING'}
                                    </CustomText>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. 6:00 PM – 7:30 PM"
                                        placeholderTextColor="#94A3B8"
                                        value={rescheduleTiming}
                                        onChangeText={setRescheduleTiming}
                                    />
                                </View>

                                {rescheduleType === 'regular' ? (
                                    /* Days Input for regular schedule */
                                    <View style={styles.inputGroup}>
                                        <CustomText style={styles.inputLabel}>REGULAR DAYS</CustomText>
                                        <TextInput
                                            style={styles.modalInput}
                                            placeholder="e.g. Mon, Wed, Fri"
                                            placeholderTextColor="#94A3B8"
                                            value={rescheduleDays}
                                            onChangeText={setRescheduleDays}
                                        />
                                    </View>
                                ) : (
                                    /* Date & Reason for single-day shift */
                                    <>
                                        <View style={styles.inputGroup}>
                                            <CustomText style={styles.inputLabel}>DATE</CustomText>
                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="16/10/2026"
                                                placeholderTextColor="#94A3B8"
                                                value={rescheduleDate}
                                                onChangeText={setRescheduleDate}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <CustomText style={styles.inputLabel}>REASON / STUDENT NOTE</CustomText>
                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="e.g. Delayed by 1 hr for revision test"
                                                placeholderTextColor="#94A3B8"
                                                value={rescheduleReason}
                                                onChangeText={setRescheduleReason}
                                            />
                                        </View>
                                    </>
                                )}

                                {/* Reset button if currently rescheduled */}
                                {rescheduleBatchTarget?.rescheduledTiming && (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => handleResetReschedule(rescheduleBatchTarget.id)}
                                        style={styles.resetScheduleBtn}
                                    >
                                        <CustomText style={styles.resetScheduleBtnText}>
                                            Reset to Original Schedule
                                        </CustomText>
                                    </TouchableOpacity>
                                )}

                                {/* Modal Actions */}
                                <View style={styles.modalActionsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setIsRescheduleModalVisible(false)}
                                        style={styles.modalCloseBtn}
                                    >
                                        <CustomText style={styles.modalCloseBtnText}>Cancel</CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={handleConfirmReschedule}
                                        style={styles.modalConfirmBlueBtn}
                                    >
                                        <CustomText style={styles.modalConfirmBlueBtnText}>
                                            Save Schedule
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Mark Teacher Leave / Holiday Modal */}
            <Modal
                visible={isTeacherLeaveModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsTeacherLeaveModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsTeacherLeaveModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalCard}>
                                <CustomText style={styles.modalAddBatchTitle}>
                                    Mark Teacher Leave
                                </CustomText>
                                <CustomText style={styles.modalAddBatchSubtitle}>
                                    Record a teacher-side holiday or leave for batches.
                                </CustomText>

                                {/* Batch Selector */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>APPLIES TO</CustomText>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRowWrap}>
                                        {['All Batches', ...batches.map((b) => b.title)].map((bTitle) => {
                                            const isSelected = leaveBatchTarget === bTitle;
                                            return (
                                                <TouchableOpacity
                                                    key={bTitle}
                                                    onPress={() => setLeaveBatchTarget(bTitle)}
                                                    style={[
                                                        styles.selectPill,
                                                        isSelected && styles.selectPillActive,
                                                    ]}
                                                >
                                                    <CustomText
                                                        style={[
                                                            styles.selectPillText,
                                                            isSelected && styles.selectPillTextActive,
                                                        ]}
                                                    >
                                                        {bTitle}
                                                    </CustomText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                {/* Leave Type Pills */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>LEAVE TYPE</CustomText>
                                    <View style={styles.leaveTypeWrap}>
                                        {['Teacher Absent', 'Sick Leave', 'Personal', 'National Holiday', 'Other'].map((t) => {
                                            const isSelected = leaveType === t;
                                            return (
                                                <TouchableOpacity
                                                    key={t}
                                                    onPress={() => setLeaveType(t)}
                                                    style={[
                                                        styles.leaveTypePill,
                                                        isSelected && styles.leaveTypePillActive,
                                                    ]}
                                                >
                                                    <CustomText
                                                        style={[
                                                            styles.leaveTypePillText,
                                                            isSelected && styles.leaveTypePillTextActive,
                                                        ]}
                                                    >
                                                        {t}
                                                    </CustomText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Date Input */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>LEAVE DATE</CustomText>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="16/10/2026"
                                        placeholderTextColor="#94A3B8"
                                        value={leaveDate}
                                        onChangeText={setLeaveDate}
                                    />
                                </View>

                                {/* Specific Reason Note */}
                                <View style={styles.inputGroup}>
                                    <CustomText style={styles.inputLabel}>REASON / REMARKS</CustomText>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="e.g. Teacher unwell / Festival holiday"
                                        placeholderTextColor="#94A3B8"
                                        value={leaveReason}
                                        onChangeText={setLeaveReason}
                                    />
                                </View>

                                {/* Modal Actions */}
                                <View style={styles.modalActionsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setIsTeacherLeaveModalVisible(false)}
                                        style={styles.modalCloseBtn}
                                    >
                                        <CustomText style={styles.modalCloseBtnText}>Cancel</CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={handleConfirmTeacherLeave}
                                        style={styles.modalConfirmOrangeBtn}
                                    >
                                        <CustomText style={styles.modalConfirmOrangeBtnText}>
                                            Mark Leave
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: resAvarage(3),
        paddingTop: resAvarage(1.5),
        paddingBottom: resAvarage(6),
    },
    sectionBlock: {
        marginBottom: resAvarage(2),
    },
    sectionHeader: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: resAvarage(1.5),
        paddingHorizontal: resAvarage(0.5),
    },
    batchCard: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(3.5),
        marginBottom: resAvarage(2.2),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(1),
    },
    batchTitle: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
    },
    timingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
        marginBottom: resAvarage(0.6),
    },
    timingText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
    },
    classRangeText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginBottom: resAvarage(2),
    },
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
    },
    studentsCountPill: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(100),
    },
    studentsCountText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.black,
    },
    attendanceNotMarkedPill: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(100),
    },
    attendanceNotMarkedText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#D97706',
    },
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(3),
        fontSize: font10,
        marginBottom: resAvarage(6),
        color: colors.black60,
        fontFamily: FontMedium,
        alignSelf: 'center',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(4),
    },
    modalCard: {
        width: '100%',
        maxWidth: resWidth(90),
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(4.5),
        elevation: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    modalHeaderRow: {
        marginBottom: resAvarage(2.5),
    },
    modalHeaderInfo: {
        gap: resAvarage(0.4),
    },
    modalBatchTitle: {
        fontFamily: FontBold,
        fontSize: font20,
        color: colors.black,
    },
    modalBatchTiming: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
    },
    modalBatchClass: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: '#475569',
    },
    modalStudentsSectionHeader: {
        fontFamily: FontMedium,
        fontSize: font11,
        color: '#64748B',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: resAvarage(1.5),
    },
    modalStudentsList: {
        gap: resAvarage(1.2),
        marginBottom: resAvarage(3),
    },
    studentItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: resAvarage(1.5),
        paddingHorizontal: resAvarage(2),
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    studentAvatar: {
        width: resAvarage(4.5),
        height: resAvarage(4.5),
        borderRadius: resAvarage(2.25),
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: resAvarage(2),
    },
    studentInfoCol: {
        flex: 1,
    },
    studentItemName: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.black,
    },
    studentItemSub: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#64748B',
        marginTop: resAvarage(0.2),
    },
    modalActionsRow: {
        flexDirection: 'row',
        gap: resAvarage(2),
    },
    modalAttendanceBtn: {
        flex: 1.5,
        backgroundColor: colors.black,
        borderRadius: resAvarage(3),
        paddingVertical: resAvarage(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalAttendanceBtnText: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.white,
    },
    modalCloseBtn: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: resAvarage(3),
        paddingVertical: resAvarage(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
        color: '#64748B',
    },
    headerAddBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    headerAddBtnText: {
        color: colors.white,
        fontFamily: FontBold,
        fontSize: font13,
    },
    emptyBlock: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(4),
        paddingVertical: resAvarage(4),
        paddingHorizontal: resAvarage(3),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    emptyTitle: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.black,
        marginBottom: resAvarage(0.5),
    },
    emptySubtitle: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#64748B',
        textAlign: 'center',
    },
    emptyStudentsBox: {
        paddingVertical: resAvarage(3),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3),
    },
    emptyStudentsText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginBottom: resAvarage(1.5),
    },
    enrollStudentBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1),
    },
    enrollStudentBtnText: {
        fontFamily: FontBold,
        fontSize: font12,
        color: colors.white,
    },
    modalAddBatchTitle: {
        fontFamily: FontBold,
        fontSize: font18,
        color: colors.black,
    },
    modalAddBatchSubtitle: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.4),
        marginBottom: resAvarage(2.5),
    },
    inputGroup: {
        marginBottom: resAvarage(2),
    },
    inputLabel: {
        fontFamily: FontMedium,
        fontSize: font10,
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: resAvarage(0.8),
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: resAvarage(2.5),
        paddingHorizontal: resAvarage(3),
        height: resAvarage(5.8),
        fontFamily: FontMedium,
        fontSize: font14,
        color: colors.black,
        backgroundColor: '#F8FAFC',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
        marginTop: resAvarage(0.5),
        marginBottom: resAvarage(3),
    },
    checkboxBox: {
        width: resAvarage(4.2),
        height: resAvarage(4.2),
        borderRadius: resAvarage(1),
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxBoxActive: {
        backgroundColor: colors.black,
        borderColor: colors.black,
    },
    checkboxTick: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.white,
    },
    toggleText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: '#334155',
    },

    // Reschedule & Teacher Leave Card Banners
    cardAlertBannerBlue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
        backgroundColor: '#EFF6FF',
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(1.5),
        marginBottom: resAvarage(1.2),
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    cardAlertBannerBlueText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#1D4ED8',
    },
    cardAlertBannerOrange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
        backgroundColor: '#FFF7ED',
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(1.5),
        marginBottom: resAvarage(1.2),
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    cardAlertBannerOrangeText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#EA580C',
    },
    tagsAndActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: resAvarage(1.5),
    },
    cardQuickActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
    },
    cardQuickBtnBlue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(0.6),
        backgroundColor: '#EFF6FF',
        paddingHorizontal: resAvarage(2.2),
        paddingVertical: resAvarage(0.7),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    cardQuickBtnBlueText: {
        fontFamily: FontBold,
        fontSize: font11,
        color: '#2563EB',
    },
    cardQuickBtnOrange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(0.6),
        backgroundColor: '#FFF7ED',
        paddingHorizontal: resAvarage(2.2),
        paddingVertical: resAvarage(0.7),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    cardQuickBtnOrangeText: {
        fontFamily: FontBold,
        fontSize: font11,
        color: '#EA580C',
    },
    teacherLeaveTagPill: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    teacherLeaveTagText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#EA580C',
    },

    // Teacher Leave Section
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(1.5),
        paddingHorizontal: resAvarage(0.5),
    },
    markLeaveSmallBtn: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(0.6),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    markLeaveSmallBtnText: {
        fontFamily: FontBold,
        fontSize: font11,
        color: '#EA580C',
    },
    teacherLeaveCard: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(4),
        padding: resAvarage(3),
        marginBottom: resAvarage(1.5),
        borderWidth: 1,
        borderColor: '#FED7AA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teacherLeaveLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: resAvarage(2),
        flex: 1,
    },
    teacherLeaveIconWrap: {
        width: resAvarage(4.5),
        height: resAvarage(4.5),
        borderRadius: resAvarage(2.25),
        backgroundColor: '#FFF7ED',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: resAvarage(0.2),
    },
    teacherLeaveInfo: {
        flex: 1,
        gap: resAvarage(0.3),
    },
    teacherLeaveHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
        flexWrap: 'wrap',
    },
    teacherLeaveDate: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.black,
    },
    teacherLeaveBadge: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: resAvarage(1.8),
        paddingVertical: resAvarage(0.3),
        borderRadius: resAvarage(1),
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    teacherLeaveBadgeText: {
        fontFamily: FontBold,
        fontSize: font10,
        color: '#EA580C',
    },
    teacherLeaveReason: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#475569',
    },
    teacherLeaveBatch: {
        fontFamily: FontMedium,
        fontSize: font11,
        color: '#94A3B8',
    },
    cancelLeaveBtn: {
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(100),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginLeft: resAvarage(1),
    },
    cancelLeaveBtnText: {
        fontFamily: FontMedium,
        fontSize: font11,
        color: '#EF4444',
    },

    // Modal Specific Styles for Reschedule & Teacher Leave
    modalBannerBlue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
        backgroundColor: '#EFF6FF',
        padding: resAvarage(2),
        borderRadius: resAvarage(2),
        marginBottom: resAvarage(2),
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    modalBannerBlueText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#1D4ED8',
        flex: 1,
    },
    modalBannerOrange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
        backgroundColor: '#FFF7ED',
        padding: resAvarage(2),
        borderRadius: resAvarage(2),
        marginBottom: resAvarage(2),
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    modalBannerOrangeText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#EA580C',
        flex: 1,
    },
    modalQuickBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
        marginBottom: resAvarage(2.5),
    },
    modalQuickActionPillBlue: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: resAvarage(0.8),
        backgroundColor: '#EFF6FF',
        paddingVertical: resAvarage(1.4),
        borderRadius: resAvarage(2.5),
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    modalQuickActionPillBlueText: {
        fontFamily: FontBold,
        fontSize: font12,
        color: '#2563EB',
    },
    modalQuickActionPillOrange: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: resAvarage(0.8),
        backgroundColor: '#FFF7ED',
        paddingVertical: resAvarage(1.4),
        borderRadius: resAvarage(2.5),
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    modalQuickActionPillOrangeText: {
        fontFamily: FontBold,
        fontSize: font12,
        color: '#EA580C',
    },
    typeSwitcherRow: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: resAvarage(2.5),
        padding: resAvarage(0.5),
        marginBottom: resAvarage(2),
    },
    typeSwitchBtn: {
        flex: 1,
        paddingVertical: resAvarage(1.2),
        alignItems: 'center',
        borderRadius: resAvarage(2),
    },
    typeSwitchBtnActive: {
        backgroundColor: colors.white,
        elevation: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    typeSwitchText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
    },
    typeSwitchTextActive: {
        fontFamily: FontBold,
        color: colors.black,
    },
    resetScheduleBtn: {
        backgroundColor: '#FEF2F2',
        borderRadius: resAvarage(2.5),
        paddingVertical: resAvarage(1.4),
        alignItems: 'center',
        marginBottom: resAvarage(2),
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    resetScheduleBtnText: {
        fontFamily: FontBold,
        fontSize: font12,
        color: '#DC2626',
    },
    modalConfirmBlueBtn: {
        flex: 1.5,
        backgroundColor: '#2563EB',
        borderRadius: resAvarage(3),
        paddingVertical: resAvarage(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalConfirmBlueBtnText: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.white,
    },
    pillsRowWrap: {
        flexDirection: 'row',
        gap: resAvarage(1.2),
        paddingVertical: resAvarage(0.5),
    },
    selectPill: {
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(1),
        borderRadius: resAvarage(100),
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectPillActive: {
        backgroundColor: colors.black,
        borderColor: colors.black,
    },
    selectPillText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#475569',
    },
    selectPillTextActive: {
        fontFamily: FontBold,
        color: colors.white,
    },
    leaveTypeWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: resAvarage(1.2),
    },
    leaveTypePill: {
        paddingHorizontal: resAvarage(2.2),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(100),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    leaveTypePillActive: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FED7AA',
    },
    leaveTypePillText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
    },
    leaveTypePillTextActive: {
        fontFamily: FontBold,
        color: '#EA580C',
    },
    modalConfirmOrangeBtn: {
        flex: 1.5,
        backgroundColor: '#EA580C',
        borderRadius: resAvarage(3),
        paddingVertical: resAvarage(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalConfirmOrangeBtnText: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.white,
    },
});