import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    TextInput,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { CommonBg } from '../../../../ui/common/CommonBg';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { font10, font11, font12, font13, font14, font15, font16, font18 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { goBack, navigate } from '../../../../navigation/NavigationUtils';
import { showFlashMessage } from '../../../../utils/flashMessage';
import InsightHeader from '../components/InsightHeader';
import {
    SearchIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarIcon,
    BookIcon,
    CheckIcon,
} from './components/TuitionIcons';
import ExportImportButton from '../../../../ui/components/ExportImportButton';
import ExportImportModal from '../../../../ui/modals/ExportImportModal';
import { ExportColumn } from '../../../../services/exportService';
import { importService } from '../../../../services/importService';
import { tuitionStorage } from '../../../../services/tuitionStorage';
import { useGetStudentsQuery, useGetBatchesQuery, useBatchMarkAttendanceMutation } from '../../../../API';
import { ShowToast } from '../../../../utils/CustomToast/ToastManager';
import { useAppSelector } from '../../../../API/hooks/ReduxHooks';

export interface AttendanceStudent {
    id: string;
    name: string;
    classGrade: string;
    batch: string;
    status: 'Present' | 'Absent';
    availableSubjects: string[];
    selectedSubjects: string[];
    isSubjectsExpanded?: boolean;
    phone: string;
    parentName: string;
    feeAmount: string;
    feeStatus: string;
}

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type StatusFilter = 'All' | 'Present' | 'Absent';

interface AttendanceProps {
    route?: {
        params?: {
            selectedBatchTitle?: string;
        };
    };
}

export default function Attendance({ route }: AttendanceProps) {
    const initialBatch = route?.params?.selectedBatchTitle || 'All batches';

    const reduxBatches = useAppSelector(state => state.tuition.batches);
    const [batchMarkAttendanceApi] = useBatchMarkAttendanceMutation();
    const { data: apiBatchesRes } = useGetBatchesQuery(undefined);

    const [students, setStudents] = useState<AttendanceStudent[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<string>(initialBatch);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilter>('All');

    // Dynamic batches list
    const batchFilters = useMemo(() => {
        const list = ['All batches'];
        const sourceBatches = (reduxBatches && reduxBatches.length > 0)
            ? reduxBatches
            : (apiBatchesRes && Array.isArray(apiBatchesRes.data) ? apiBatchesRes.data : []);

        sourceBatches.forEach((b: any) => {
            const name = b.title || b.name;
            if (name && !list.includes(name)) list.push(name);
        });

        students.forEach((s) => {
            if (s.batch && s.batch !== 'All batches' && !list.includes(s.batch)) list.push(s.batch);
        });
        return list;
    }, [reduxBatches, apiBatchesRes, students]);

    // RTK Query backend integration
    const { data: apiStudentsRes } = useGetStudentsQuery(undefined);

    React.useEffect(() => {
        if (apiStudentsRes && Array.isArray(apiStudentsRes.data)) {
            const mapped: AttendanceStudent[] = apiStudentsRes.data.map((s: any) => ({
                id: s._id || s.id,
                name: s.name,
                classGrade: s.classGrade || s.grade || '',
                batch: s.batchName || s.batch || 'All batches',
                status: s.attendanceStatus === 'Absent' ? 'Absent' : 'Present',
                availableSubjects: s.subjects || [],
                selectedSubjects: s.subjects || [],
                isSubjectsExpanded: false,
                phone: s.phone || '',
                parentName: s.parentName || '',
                feeAmount: s.feeAmount ? `₹${s.feeAmount}` : '₹0',
                feeStatus: s.feeStatus || 'Paid',
            }));
            setStudents(mapped);
        } else {
            tuitionStorage.getStudents().then(persisted => {
                if (persisted && persisted.length > 0) {
                    const mapped: AttendanceStudent[] = persisted.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        classGrade: s.classGrade || '',
                        batch: s.batchName || 'All batches',
                        status: 'Present',
                        availableSubjects: s.subjects || [],
                        selectedSubjects: s.subjects || [],
                        isSubjectsExpanded: false,
                        phone: s.phone || '',
                        parentName: s.parentName || '',
                        feeAmount: `₹${s.feeAmount || 0}`,
                        feeStatus: s.feeStatus || 'Paid',
                    }));
                    setStudents(mapped);
                }
            });
        }
    }, [apiStudentsRes]);

    // Date state
    const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
    const [showExportModal, setShowExportModal] = useState(false);

    // Calendar Modal State
    const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState<number>(() => selectedDate.getMonth());
    const [calendarYear, setCalendarYear] = useState<number>(() => selectedDate.getFullYear());

    // Date Text Formatter (e.g. "Today · 16 Oct 2026", "Yesterday · 15 Oct 2026", "Thu · 18 Oct 2026")
    const formatDateText = (date: Date): string => {
        const today = new Date();
        const isSameDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const day = date.getDate();
        const month = MONTH_NAMES[date.getMonth()];
        const year = date.getFullYear();

        if (isSameDay(date, today)) {
            return `Today · ${day} ${month} ${year}`;
        }
        if (isSameDay(date, yesterday)) {
            return `Yesterday · ${day} ${month} ${year}`;
        }
        if (isSameDay(date, tomorrow)) {
            return `Tomorrow · ${day} ${month} ${year}`;
        }
        const dayOfWeek = DAY_NAMES[date.getDay()];
        return `${dayOfWeek} · ${day} ${month} ${year}`;
    };

    // Day navigation: Previous Day
    const handlePreviousDay = () => {
        setSelectedDate((prev) => {
            const next = new Date(prev);
            next.setDate(next.getDate() - 1);
            return next;
        });
    };

    // Day navigation: Next Day
    const handleNextDay = () => {
        setSelectedDate((prev) => {
            const next = new Date(prev);
            next.setDate(next.getDate() + 1);
            return next;
        });
    };

    // Open Calendar Modal synced with current selected date
    const handleOpenCalendar = () => {
        setCalendarMonth(selectedDate.getMonth());
        setCalendarYear(selectedDate.getFullYear());
        setIsCalendarModalVisible(true);
    };

    // Calendar navigation within Modal
    const handleMonthChange = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear((y) => y - 1);
            } else {
                setCalendarMonth((m) => m - 1);
            }
        } else {
            if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear((y) => y + 1);
            } else {
                setCalendarMonth((m) => m + 1);
            }
        }
    };

    // Select date from Calendar Modal
    const handleSelectDateFromCalendar = (day: number) => {
        const newDate = new Date(calendarYear, calendarMonth, day);
        setSelectedDate(newDate);
        setIsCalendarModalVisible(false);
    };

    // Toggle Present / Absent
    const handleToggleAttendance = (id: string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.id === id) {
                    const nextStatus = student.status === 'Present' ? 'Absent' : 'Present';
                    return { ...student, status: nextStatus };
                }
                return student;
            })
        );
    };

    // Toggle subjects expansion for student
    const handleToggleSubjects = (id: string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.id === id) {
                    return { ...student, isSubjectsExpanded: !student.isSubjectsExpanded };
                }
                return student;
            })
        );
    };

    // Toggle subject selection
    const handleToggleSubjectSelection = (studentId: string, subject: string) => {
        setStudents((prev) =>
            prev.map((student) => {
                if (student.id === studentId) {
                    const isSelected = student.selectedSubjects.includes(subject);
                    const updated = isSelected
                        ? student.selectedSubjects.filter((s) => s !== subject)
                        : [...student.selectedSubjects, subject];
                    return { ...student, selectedSubjects: updated };
                }
                return student;
            })
        );
    };

    // Mark all currently visible students present
    const handleMarkAllPresent = () => {
        setStudents((prev) =>
            prev.map((student) => ({
                ...student,
                status: 'Present',
            }))
        );
        showFlashMessage('All students marked present!', 'success');
    };

    // Save Attendance action
    const handleSaveAttendance = async () => {
        const payload = {
            date: selectedDate.toISOString(),
            records: students.map((s) => ({
                studentId: s.id,
                status: s.status,
                subjects: s.selectedSubjects,
            })),
        };

        const res: any = await batchMarkAttendanceApi(payload);
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            const presentCount = students.filter((s) => s.status === 'Present').length;
            ShowToast(res?.data?.message || `Attendance saved: ${presentCount}/${students.length} present for ${formatDateText(selectedDate)}`, "success");
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || "Failed to save attendance", "error");
        }
    };

    // Link directly to StudentDetails
    const handleOpenStudentDetails = (student: AttendanceStudent) => {
        const feeNum = Number(String(student.feeAmount).replace(/[^0-9]/g, '')) || 2000;
        navigate('StudentDetails', {
            student: {
                id: student.id,
                name: student.name,
                classGrade: student.classGrade,
                phone: student.phone,
                parentName: student.parentName,
                batchName: student.batch,
                batchTiming: '05:00 PM – 07:00 PM',
                feeAmount: feeNum,
                feePeriod: 'month',
                feeStatus: (student.feeStatus as 'Overdue' | 'Paid' | 'Due Soon') || 'Due Soon',
                dueInfo: 'Next due 3 Oct',
                attendanceStatus: student.status,
                subjects: student.availableSubjects,
                isActive: true,
            },
        });
    };

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            // Search query
            const matchesSearch =
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.classGrade.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            // Batch filter
            if (selectedBatch !== 'All batches' && student.batch !== selectedBatch) {
                return false;
            }

            // Status filter
            if (selectedStatusFilter !== 'All' && student.status !== selectedStatusFilter) {
                return false;
            }

            return true;
        });
    }, [students, searchQuery, selectedBatch, selectedStatusFilter]);

    // Present count stats
    const presentCount = students.filter((s) => s.status === 'Present').length;
    const totalCount = students.length;

    // Calendar grid calculations
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();

    const attendanceExportColumns: ExportColumn[] = [
        { key: 'name', label: 'Student Name' },
        { key: 'classGrade', label: 'Class / Grade' },
        { key: 'batch', label: 'Batch' },
        { key: 'status', label: 'Status' },
        { key: 'phone', label: 'Phone' },
        { key: 'parentName', label: 'Parent Name' },
        { key: 'feeStatus', label: 'Fee Status' },
    ];

    const attendanceSampleCsv = `Student Name,Class / Grade,Batch,Status,Phone,Parent Name,Fee Status
Aman Kumar,Class 10,Morning Juniors,Present,+91 99582 11870,Rekha Kumar,Overdue
Ishaan Gupta,Class 12,Board Prep,Present,+91 88004 77211,Meera Gupta,Paid
Sneha Iyer,Class 11,Morning Juniors,Absent,+91 98201 44321,Venkatesh Iyer,Overdue`;

    return (
        <CommonBg>
            <View style={styles.mainContainer}>
                {/* 1. InsightHeader Component */}
                <InsightHeader
                    title={"Attendance"}
                    subtitle={"Attendance Tracking"}
                    rightComponent={
                        <ExportImportButton onPress={() => setShowExportModal(true)} />
                    }
                />

                <ExportImportModal
                    visible={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    sectionTitle={`Attendance (${formatDateText(selectedDate)})`}
                    sectionSubtitle="Student Attendance Sheet"
                    exportColumns={attendanceExportColumns}
                    exportRows={students}
                    exportSummary={{
                        'Date': formatDateText(selectedDate),
                        'Total Students': totalCount,
                        'Present Students': presentCount,
                        'Absent Students': totalCount - presentCount,
                        'Attendance Rate': `${Math.round((presentCount / Math.max(1, totalCount)) * 100)}%`,
                    }}
                    defaultFilename={`CredPilot_Attendance_${selectedDate.toISOString().split('T')[0]}`}
                    sampleImportFormat={attendanceSampleCsv}
                    onImportData={async (rawInput) => {
                        const dateKey = selectedDate.toISOString().split('T')[0];
                        const result = await importService.importAttendance(rawInput, dateKey);
                        if (result.success && result.data) {
                            // Update local students list status
                            setStudents(prev =>
                                prev.map(s => {
                                    const match = result.data.find(
                                        (d: any) => d.name.toLowerCase() === s.name.toLowerCase()
                                    );
                                    if (match) {
                                        return { ...s, status: match.status };
                                    }
                                    return s;
                                })
                            );
                        }
                        return result;
                    }}
                />

                {/* 2. Date Navigation Bar: Previous Day + Date Picker Pill + Next Day */}
                <View style={styles.dateSelectorRow}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handlePreviousDay}
                        style={styles.circleNavBtn}
                    >
                        <ChevronLeftIcon size={resAvarage(2.2)} color="#1E293B" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={handleOpenCalendar}
                        style={styles.datePickerPill}
                    >
                        <CalendarIcon size={resAvarage(1.8)} color="#1E293B" />
                        <CustomText style={styles.datePickerText}>
                            {formatDateText(selectedDate)}
                        </CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleNextDay}
                        style={styles.circleNavBtn}
                    >
                        <ChevronRightIcon size={resAvarage(2.2)} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* 3. Search Input */}
                    <View style={styles.searchBar}>
                        <SearchIcon size={resAvarage(2.2)} color="#64748B" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search students"
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                style={styles.clearBtn}
                            >
                                <CustomText style={styles.clearBtnText}>✕</CustomText>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* 4. Batch Filter Pills (Row 1) */}
                    <View style={styles.filterRowWrapper}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterPillsRow}
                        >
                            {batchFilters.map((batch) => {
                                const isActive = selectedBatch === batch;
                                return (
                                    <TouchableOpacity
                                        key={batch}
                                        activeOpacity={0.7}
                                        onPress={() => setSelectedBatch(batch)}
                                        style={[
                                            styles.batchPill,
                                            isActive && styles.batchPillActive,
                                        ]}
                                    >
                                        <CustomText
                                            style={[
                                                styles.batchPillText,
                                                isActive && styles.batchPillTextActive,
                                            ]}
                                        >
                                            {batch}
                                        </CustomText>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* 5. Status Filter Pills & Mark All Present (Row 2) */}
                    <View style={styles.filterRowWrapper}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterPillsRow}
                        >
                            {(['All', 'Present', 'Absent'] as const).map((status) => {
                                const isActive = selectedStatusFilter === status;
                                return (
                                    <TouchableOpacity
                                        key={status}
                                        activeOpacity={0.7}
                                        onPress={() => setSelectedStatusFilter(status)}
                                        style={[
                                            styles.statusPill,
                                            isActive && styles.statusPillActive,
                                        ]}
                                    >
                                        <CustomText
                                            style={[
                                                styles.statusPillText,
                                                isActive && styles.statusPillTextActive,
                                            ]}
                                        >
                                            {status}
                                        </CustomText>
                                    </TouchableOpacity>
                                );
                            })}

                            {/* Mark All Present Action Button */}
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={handleMarkAllPresent}
                                style={styles.markAllPresentBtn}
                            >
                                <CustomText style={styles.markAllCheckmark}>✓</CustomText>
                                <CustomText style={styles.markAllPresentText}>
                                    Mark All Present
                                </CustomText>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* 6. Notice Message */}
                    <CustomText style={styles.noticeText}>
                        No attendance has been recorded for this date yet.
                    </CustomText>

                    {/* 7. Student Attendance Cards List */}
                    <View style={styles.cardsList}>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => {
                                const isPresent = student.status === 'Present';
                                return (
                                    <View key={student.id} style={styles.studentCard}>
                                        {/* Card Top Row: Checkbox, Name + Class, Subjects Button */}
                                        <View style={styles.cardMainRow}>
                                            {/* Status Checkbox Button */}
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => handleToggleAttendance(student.id)}
                                                style={[
                                                    styles.checkBtn,
                                                    isPresent
                                                        ? styles.checkBtnPresent
                                                        : styles.checkBtnAbsent,
                                                ]}
                                            >
                                                {isPresent ? (
                                                    <CheckIcon size={resAvarage(1.8)} color="#FFFFFF" />
                                                ) : (
                                                    <CustomText style={styles.crossIcon}>✕</CustomText>
                                                )}
                                            </TouchableOpacity>

                                            {/* Student Name & Class (Tap to open StudentDetails) */}
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => handleOpenStudentDetails(student)}
                                                style={styles.studentNameCol}
                                            >
                                                <CustomText style={styles.studentName}>
                                                    {student.name}
                                                </CustomText>
                                                <CustomText style={styles.studentClass}>
                                                    {`${student.classGrade} · ${student.status}`}
                                                </CustomText>
                                            </TouchableOpacity>

                                            {/* Subjects Expand Button */}
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => handleToggleSubjects(student.id)}
                                                style={[
                                                    styles.subjectsBtn,
                                                    student.isSubjectsExpanded && styles.subjectsBtnActive,
                                                ]}
                                            >
                                                <BookIcon size={resAvarage(1.6)} color="#1E293B" />
                                                <CustomText style={styles.subjectsBtnText}>
                                                    Subjects
                                                </CustomText>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Optional Expandable Subjects Section */}
                                        {student.isSubjectsExpanded && (
                                            <View style={styles.subjectsExpandSection}>
                                                <CustomText style={styles.subjectsExpandLabel}>
                                                    Subjects studied today (optional)
                                                </CustomText>
                                                <View style={styles.subjectTagsRow}>
                                                    {student.availableSubjects.map((subject) => {
                                                        const isSelected = student.selectedSubjects.includes(subject);
                                                        return (
                                                            <TouchableOpacity
                                                                key={subject}
                                                                activeOpacity={0.7}
                                                                onPress={() =>
                                                                    handleToggleSubjectSelection(
                                                                        student.id,
                                                                        subject
                                                                    )
                                                                }
                                                                style={[
                                                                    styles.subjectTagPill,
                                                                    isSelected && styles.subjectTagPillActive,
                                                                ]}
                                                            >
                                                                <CustomText
                                                                    style={[
                                                                        styles.subjectTagText,
                                                                        isSelected && styles.subjectTagTextActive,
                                                                    ]}
                                                                >
                                                                    {subject}
                                                                </CustomText>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyContainer}>
                                <CustomText style={styles.emptyTitle}>
                                    No students found
                                </CustomText>
                                <CustomText style={styles.emptySubtitle}>
                                    Try adjusting your search query or filters.
                                </CustomText>
                            </View>
                        )}
                    </View>

                    {/* Bottom Space for Floating Button */}
                    <View style={{ height: resAvarage(10) }} />
                </ScrollView>

                {/* 8. Bottom Fixed Button: Save Attendance */}
                <View style={styles.bottomBarContainer}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleSaveAttendance}
                        style={styles.saveAttendanceBtn}
                    >
                        <CustomText style={styles.saveAttendanceBtnText}>
                            {`Save attendance · ${presentCount}/${totalCount} present`}
                        </CustomText>
                    </TouchableOpacity>
                </View>

                {/* 9. Interactive Calendar Date Picker Modal */}
                <Modal
                    visible={isCalendarModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsCalendarModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setIsCalendarModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => { }}>
                                <View style={styles.calendarModalCard}>
                                    {/* Modal Header */}
                                    <View style={styles.calendarModalHeader}>
                                        <CustomText style={styles.calendarModalTitle}>
                                            Choose Date
                                        </CustomText>
                                        <TouchableOpacity
                                            onPress={() => setIsCalendarModalVisible(false)}
                                            style={styles.modalCloseCircle}
                                        >
                                            <CustomText style={styles.modalCloseCircleText}>✕</CustomText>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Month Navigation */}
                                    <View style={styles.monthNavRow}>
                                        <TouchableOpacity
                                            onPress={() => handleMonthChange('prev')}
                                            style={styles.monthNavArrow}
                                        >
                                            <ChevronLeftIcon size={resAvarage(2)} color="#1E293B" />
                                        </TouchableOpacity>

                                        <CustomText style={styles.monthNavText}>
                                            {`${MONTH_NAMES_FULL[calendarMonth]} ${calendarYear}`}
                                        </CustomText>

                                        <TouchableOpacity
                                            onPress={() => handleMonthChange('next')}
                                            style={styles.monthNavArrow}
                                        >
                                            <ChevronRightIcon size={resAvarage(2)} color="#1E293B" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Weekdays Row */}
                                    <View style={styles.calendarWeekdaysRow}>
                                        {SHORT_WEEKDAYS.map((day, idx) => (
                                            <View key={idx} style={styles.calendarDayCellWrapper}>
                                                <CustomText style={styles.calendarWeekdayText}>
                                                    {day}
                                                </CustomText>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Days Grid */}
                                    <View style={styles.calendarGrid}>
                                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                                            <View key={`empty-${i}`} style={styles.calendarDayCellWrapper} />
                                        ))}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const day = i + 1;
                                            const isSelected =
                                                selectedDate.getDate() === day &&
                                                selectedDate.getMonth() === calendarMonth &&
                                                selectedDate.getFullYear() === calendarYear;

                                            const now = new Date();
                                            const isToday =
                                                calendarYear === now.getFullYear() &&
                                                calendarMonth === now.getMonth() &&
                                                day === now.getDate();

                                            return (
                                                <View key={`day-${day}`} style={styles.calendarDayCellWrapper}>
                                                    <TouchableOpacity
                                                        activeOpacity={0.7}
                                                        onPress={() => handleSelectDateFromCalendar(day)}
                                                        style={[
                                                            styles.calendarDayBtn,
                                                            isSelected && styles.calendarDayBtnSelected,
                                                            isToday && !isSelected && styles.calendarDayBtnToday,
                                                        ]}
                                                    >
                                                        <CustomText
                                                            style={[
                                                                styles.calendarDayText,
                                                                isSelected && styles.calendarDayTextSelected,
                                                                isToday && !isSelected && styles.calendarDayTextToday,
                                                            ]}
                                                        >
                                                            {day}
                                                        </CustomText>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    {/* Modal Actions */}
                                    <View style={styles.calendarModalActionsRow}>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setSelectedDate(new Date());
                                                setIsCalendarModalVisible(false);
                                            }}
                                            style={styles.todayQuickBtn}
                                        >
                                            <CustomText style={styles.todayQuickBtnText}>
                                                Go to Today
                                            </CustomText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => setIsCalendarModalVisible(false)}
                                            style={styles.calendarCancelBtn}
                                        >
                                            <CustomText style={styles.calendarCancelBtnText}>
                                                Cancel
                                            </CustomText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    dateSelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(1),
        marginBottom: resAvarage(1),
    },
    circleNavBtn: {
        width: resAvarage(5.2),
        height: resAvarage(5.2),
        borderRadius: resAvarage(2.6),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    datePickerPill: {
        flex: 1,
        marginHorizontal: resAvarage(2),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: resAvarage(5.2),
        backgroundColor: colors.white,
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3),
        gap: resAvarage(1),
        elevation: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    datePickerText: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.black,
    },
    scrollContent: {
        paddingHorizontal: resAvarage(3),
        paddingTop: resAvarage(0.5),
    },
    searchBar: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: resAvarage(3.5),
        height: resAvarage(6),
        marginBottom: resAvarage(2),
        elevation: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
    },
    searchInput: {
        flex: 1,
        fontFamily: FontRegular,
        fontSize: font14,
        color: colors.black,
        marginLeft: resAvarage(1.5),
        paddingVertical: 0,
    },
    clearBtn: {
        width: resAvarage(2.8),
        height: resAvarage(2.8),
        borderRadius: resAvarage(1.4),
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearBtnText: {
        fontSize: font11,
        color: '#64748B',
        fontFamily: FontBold,
    },
    filterRowWrapper: {
        marginBottom: resAvarage(1.6),
    },
    filterPillsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
    },
    batchPill: {
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1.2),
        borderRadius: resAvarage(100),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    batchPillActive: {
        backgroundColor: colors.black,
        borderColor: colors.black,
    },
    batchPillText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black,
    },
    batchPillTextActive: {
        color: colors.white,
        fontFamily: FontBold,
    },
    statusPill: {
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1.2),
        borderRadius: resAvarage(100),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    statusPillActive: {
        backgroundColor: colors.black,
        borderColor: colors.black,
    },
    statusPillText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black,
    },
    statusPillTextActive: {
        color: colors.white,
        fontFamily: FontBold,
    },
    markAllPresentBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(0.8),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1.2),
        borderRadius: resAvarage(100),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    markAllCheckmark: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.black,
    },
    markAllPresentText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
        color: colors.black,
    },
    noticeText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginVertical: resAvarage(1.2),
        paddingHorizontal: resAvarage(0.5),
    },
    cardsList: {
        gap: resAvarage(2),
        marginTop: resAvarage(0.5),
    },
    studentCard: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(3),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardMainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkBtn: {
        width: resAvarage(5.2),
        height: resAvarage(5.2),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: resAvarage(3),
    },
    checkBtnPresent: {
        borderRadius: resAvarage(2.6),
        backgroundColor: colors.black,
    },
    checkBtnAbsent: {
        borderRadius: resAvarage(0.8),
        backgroundColor: '#DC2626',
    },
    crossIcon: {
        color: colors.white,
        fontFamily: FontBold,
        fontSize: font14,
    },
    studentNameCol: {
        flex: 1,
    },
    studentName: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
    },
    studentClass: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.2),
    },
    subjectsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(0.8),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(1),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: colors.white,
    },
    subjectsBtnActive: {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
    },
    subjectsBtnText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.black,
    },
    subjectsExpandSection: {
        marginTop: resAvarage(2.2),
        paddingTop: resAvarage(1.8),
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    subjectsExpandLabel: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#64748B',
        marginBottom: resAvarage(1.2),
    },
    subjectTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: resAvarage(1.2),
    },
    subjectTagPill: {
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: colors.white,
    },
    subjectTagPillActive: {
        backgroundColor: '#F1F5F9',
        borderColor: '#CBD5E1',
    },
    subjectTagText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#475569',
    },
    subjectTagTextActive: {
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    emptyContainer: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(6),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginTop: resAvarage(2),
    },
    emptyTitle: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
        marginBottom: resAvarage(0.5),
    },
    emptySubtitle: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
    },
    bottomBarContainer: {
        position: 'absolute',
        bottom: resAvarage(2),
        left: resAvarage(3),
        right: resAvarage(3),
    },
    saveAttendanceBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(2.2),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    saveAttendanceBtnText: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.white,
    },

    // Calendar Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(4),
    },
    calendarModalCard: {
        width: '100%',
        maxWidth: resWidth(88),
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(4),
        elevation: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    calendarModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(2.5),
    },
    calendarModalTitle: {
        fontFamily: FontBold,
        fontSize: font18,
        color: colors.black,
    },
    modalCloseCircle: {
        width: resAvarage(4),
        height: resAvarage(4),
        borderRadius: resAvarage(2),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseCircleText: {
        fontFamily: FontBold,
        fontSize: font12,
        color: '#64748B',
    },
    monthNavRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(2),
        paddingHorizontal: resAvarage(1),
    },
    monthNavArrow: {
        width: resAvarage(4.2),
        height: resAvarage(4.2),
        borderRadius: resAvarage(2.1),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthNavText: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
    },
    calendarWeekdaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: resAvarage(1),
    },
    calendarDayCellWrapper: {
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarWeekdayText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: resAvarage(2.5),
    },
    calendarDayBtn: {
        width: resAvarage(4.8),
        height: resAvarage(4.8),
        borderRadius: resAvarage(2.4),
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarDayBtnSelected: {
        backgroundColor: colors.black,
    },
    calendarDayBtnToday: {
        borderWidth: 1.5,
        borderColor: colors.black,
    },
    calendarDayText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black,
    },
    calendarDayTextSelected: {
        color: colors.white,
        fontFamily: FontBold,
    },
    calendarDayTextToday: {
        fontFamily: FontBold,
    },
    calendarModalActionsRow: {
        flexDirection: 'row',
        gap: resAvarage(2),
    },
    todayQuickBtn: {
        flex: 1.5,
        backgroundColor: colors.black,
        borderRadius: resAvarage(3),
        paddingVertical: resAvarage(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayQuickBtnText: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.white,
    },
    calendarCancelBtn: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: resAvarage(3),
        paddingVertical: resAvarage(1.8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarCancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
        color: '#64748B',
    },
});