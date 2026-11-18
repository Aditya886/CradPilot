import React, { useState } from 'react';
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
    CalendarIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from './components/TuitionIcons';
import { tuitionStorage } from '../../../../services/tuitionStorage';
import { subscriptionService } from '../../../../services/subscriptionService';
import { useCreateStudentMutation, useGetBatchesQuery, extractApiErrorMessage } from '../../../../API';
import { ShowToast } from '../../../../utils/CustomToast/ToastManager';
import { useAppDispatch, useAppSelector } from '../../../../API/hooks/ReduxHooks';
import { setTuitionBatches, addTuitionStudent } from '../../../../storage/redux/silce/TuitionSlice';

const SUGGESTED_SUBJECTS = [
    'Mathematics',
    'Science',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'Hindi',
];

export interface BatchOption {
    id: string;
    title: string;
    subtitle: string;
}

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AddStudent() {
    const dispatch = useAppDispatch();
    const reduxBatches = useAppSelector(state => state.tuition.batches);
    const [createStudentApi] = useCreateStudentMutation();
    const { data: apiBatchesRes } = useGetBatchesQuery(undefined);

    // Sync batches into Redux
    React.useEffect(() => {
        if (apiBatchesRes && Array.isArray(apiBatchesRes.data)) {
            const mappedBatches = apiBatchesRes.data.map((b: any) => ({
                id: String(b._id || b.id),
                title: b.title || b.name,
                timing: b.timing || '',
                days: b.days || '',
                classRange: b.classRange || (b.grades?.join(' – ') || ''),
                studentsCount: b.studentsCount || (Array.isArray(b.students) ? b.students.length : 0),
            }));
            dispatch(setTuitionBatches(mappedBatches));
        }
    }, [apiBatchesRes, dispatch]);

    // Dynamic Batch Options from Redux / API
    const batchOptions: BatchOption[] = React.useMemo(() => {
        const list: BatchOption[] = [
            {
                id: 'no_batch',
                title: 'No batch',
                subtitle: 'Individual timing',
            },
        ];

        const sourceBatches = (reduxBatches && reduxBatches.length > 0)
            ? reduxBatches
            : (apiBatchesRes && Array.isArray(apiBatchesRes.data) ? apiBatchesRes.data : []);

        sourceBatches.forEach((b: any) => {
            const bId = String(b._id || b.id);
            if (bId && bId !== 'no_batch') {
                list.push({
                    id: bId,
                    title: b.title || b.name,
                    subtitle: b.timing ? `${b.timing}${b.days ? ' · ' + b.days : ''}` : (b.days || 'Scheduled timing'),
                });
            }
        });

        return list;
    }, [reduxBatches, apiBatchesRes]);

    const today = new Date();

    // 1. Student Information State
    const [studentName, setStudentName] = useState('');
    const [classGrade, setClassGrade] = useState('');
    const [parentName, setParentName] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [startDate, setStartDate] = useState<Date>(() => new Date());

    // 2. Subjects State
    const [customSubjectInput, setCustomSubjectInput] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // 3. Batch & Timing State
    const [selectedBatchId, setSelectedBatchId] = useState<string>('no_batch');

    // 4. Tuition Fee State
    const [feePeriod, setFeePeriod] = useState<'Monthly' | 'Semester'>('Monthly');
    const [feeAmount, setFeeAmount] = useState('');
    const [firstDueDate, setFirstDueDate] = useState<Date>(() => new Date());
    const [semesterEndDate, setSemesterEndDate] = useState<Date>(() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d;
    });

    // Calendar Modal State (shared between startDate, firstDueDate, and semesterEndDate)
    const [isCalendarModalVisible, setIsCalendarModalVisible] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState<'start' | 'due' | 'semesterEnd'>('start');
    const [calendarMonth, setCalendarMonth] = useState<number>(today.getMonth());
    const [calendarYear, setCalendarYear] = useState<number>(today.getFullYear());

    const formatDisplayDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Subject handlers
    const handleAddCustomSubject = () => {
        const trimmed = customSubjectInput.trim();
        if (trimmed && !selectedSubjects.includes(trimmed)) {
            setSelectedSubjects((prev) => [...prev, trimmed]);
            setCustomSubjectInput('');
        }
    };

    const handleToggleSuggestedSubject = (subject: string) => {
        if (selectedSubjects.includes(subject)) {
            setSelectedSubjects((prev) => prev.filter((s) => s !== subject));
        } else {
            setSelectedSubjects((prev) => [...prev, subject]);
        }
    };

    const handleRemoveSubject = (subject: string) => {
        setSelectedSubjects((prev) => prev.filter((s) => s !== subject));
    };

    // Calendar modal open helper
    const handleOpenCalendarFor = (target: 'start' | 'due' | 'semesterEnd') => {
        setCalendarTarget(target);
        const refDate =
            target === 'start'
                ? startDate
                : target === 'due'
                ? firstDueDate
                : semesterEndDate;
        setCalendarMonth(refDate.getMonth());
        setCalendarYear(refDate.getFullYear());
        setIsCalendarModalVisible(true);
    };

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

    const handleSelectDateFromCalendar = (day: number) => {
        const selected = new Date(calendarYear, calendarMonth, day);
        if (calendarTarget === 'start') {
            setStartDate(selected);
        } else if (calendarTarget === 'due') {
            setFirstDueDate(selected);
        } else {
            setSemesterEndDate(selected);
        }
        setIsCalendarModalVisible(false);
    };

    // Add Student Submit Handler
    const handleAddStudent = async () => {
        if (!studentName.trim()) {
            ShowToast('Please enter student name', 'error');
            return;
        }
        if (!classGrade.trim()) {
            ShowToast('Please enter student class', 'error');
            return;
        }

        const check = subscriptionService.canAddEntry();
        if (!check.allowed) {
            ShowToast('Free storage limit reached. Please upgrade to Pro.', 'error');
            return;
        }

        const selectedBatch = batchOptions.find((b) => b.id === selectedBatchId);
        const parsedFee = parseFloat(feeAmount) || 0;

        const payload: any = {
            name: studentName.trim(),
            classGrade: classGrade.trim(),
            parentName: parentName.trim() || 'Parent of ' + studentName.trim(),
            phone: parentPhone.trim() || undefined,
            subjects: selectedSubjects.length > 0 ? selectedSubjects : ['General'],
            batchId: selectedBatch && selectedBatch.id !== 'no_batch' ? selectedBatch.id : undefined,
            batchName: selectedBatch && selectedBatch.id !== 'no_batch' ? selectedBatch.title : 'No batch',
            batchTiming: selectedBatch && selectedBatch.id !== 'no_batch' ? selectedBatch.subtitle : 'Individual timing',
            feeAmount: parsedFee,
            feePeriod: feePeriod.toLowerCase(),
            startDate: startDate.toISOString(),
            firstDueDate: firstDueDate.toISOString(),
        };

        const res: any = await createStudentApi(payload);
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || `Student "${studentName.trim()}" enrolled successfully!`, "success");

            const enrolledStudent = {
                id: String(res?.data?.data?._id || res?.data?.data?.id || Date.now()),
                name: studentName.trim(),
                classGrade: classGrade.trim(),
                parentName: parentName.trim() || 'Parent of ' + studentName.trim(),
                phone: parentPhone.trim() || '',
                subjects: selectedSubjects.length > 0 ? selectedSubjects : ['General'],
                batchName: selectedBatch && selectedBatch.id !== 'no_batch' ? selectedBatch.title : 'No batch',
                batchTiming: selectedBatch && selectedBatch.id !== 'no_batch' ? selectedBatch.subtitle : 'Individual timing',
                feeAmount: parsedFee,
                feePeriod: feePeriod.toLowerCase(),
                feeStatus: 'Due Soon',
                dueInfo: `Next due ${firstDueDate.getDate()} ${MONTH_NAMES[firstDueDate.getMonth()]}`,
                attendanceStatus: 'Not marked',
                isActive: true,
            };

            // Update Redux
            dispatch(addTuitionStudent(enrolledStudent));

            // Persist locally
            tuitionStorage.addOrUpdateStudent(enrolledStudent);

            goBack();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || "An error occurred", "error");
            return;
        }
    };

    // Calendar Calculations
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    const activeCalendarDate =
        calendarTarget === 'start'
            ? startDate
            : calendarTarget === 'due'
            ? firstDueDate
            : semesterEndDate;

    return (
        <CommonBg>
            <View style={styles.mainContainer}>
                {/* Header */}
                <InsightHeader
                    title={"Add Student"}
                    subtitle={"New Enrollment"}
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* SECTION 1: STUDENT INFORMATION */}
                    <View style={styles.sectionCard}>
                        <CustomText style={styles.sectionHeader}>STUDENT INFORMATION</CustomText>

                        {/* Student Name */}
                        <View style={styles.inputGroup}>
                            <CustomText style={styles.inputLabel}>Student name</CustomText>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Rahul Sharma"
                                placeholderTextColor="#94A3B8"
                                value={studentName}
                                onChangeText={setStudentName}
                            />
                        </View>

                        {/* Class */}
                        <View style={styles.inputGroup}>
                            <CustomText style={styles.inputLabel}>Class</CustomText>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Class 8"
                                placeholderTextColor="#94A3B8"
                                value={classGrade}
                                onChangeText={setClassGrade}
                            />
                        </View>

                        {/* Parent / guardian name */}
                        <View style={styles.inputGroup}>
                            <CustomText style={styles.inputLabel}>Parent / guardian name</CustomText>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Anil Sharma"
                                placeholderTextColor="#94A3B8"
                                value={parentName}
                                onChangeText={setParentName}
                            />
                        </View>

                        {/* Parent phone */}
                        <View style={styles.inputGroup}>
                            <CustomText style={styles.inputLabel}>Parent phone</CustomText>
                            <TextInput
                                style={styles.textInput}
                                placeholder="98xxx xxxxx"
                                placeholderTextColor="#94A3B8"
                                value={parentPhone}
                                onChangeText={setParentPhone}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Tuition start date */}
                        <View style={styles.inputGroup}>
                            <CustomText style={styles.inputLabel}>Tuition start date</CustomText>
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => handleOpenCalendarFor('start')}
                                style={styles.datePickerInput}
                            >
                                <CustomText style={styles.datePickerInputText}>
                                    {formatDisplayDate(startDate)}
                                </CustomText>
                                <CalendarIcon size={resAvarage(2)} color="#1E293B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* SECTION 2: SUBJECTS */}
                    <View style={styles.sectionCard}>
                        <CustomText style={styles.sectionHeader}>SUBJECTS</CustomText>

                        {/* Add Subject Input Row */}
                        <View style={styles.addSubjectRow}>
                            <TextInput
                                style={styles.addSubjectInput}
                                placeholder="Add a subject"
                                placeholderTextColor="#94A3B8"
                                value={customSubjectInput}
                                onChangeText={setCustomSubjectInput}
                                onSubmitEditing={handleAddCustomSubject}
                                returnKeyType="done"
                            />
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleAddCustomSubject}
                                style={styles.addSubjectBtn}
                            >
                                <CustomText style={styles.addSubjectBtnText}>Add</CustomText>
                            </TouchableOpacity>
                        </View>

                        {/* Selected Subjects Tags (if any) */}
                        {selectedSubjects.length > 0 && (
                            <View style={styles.selectedSubjectsRow}>
                                {selectedSubjects.map((subject) => (
                                    <TouchableOpacity
                                        key={subject}
                                        activeOpacity={0.7}
                                        onPress={() => handleRemoveSubject(subject)}
                                        style={styles.selectedSubjectPill}
                                    >
                                        <CustomText style={styles.selectedSubjectText}>
                                            {subject}
                                        </CustomText>
                                        <CustomText style={styles.removeCross}>✕</CustomText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Suggested Subject Pills */}
                        <View style={styles.suggestedTagsRow}>
                            {SUGGESTED_SUBJECTS.map((subject) => {
                                const isAdded = selectedSubjects.includes(subject);
                                return (
                                    <TouchableOpacity
                                        key={subject}
                                        activeOpacity={0.7}
                                        onPress={() => handleToggleSuggestedSubject(subject)}
                                        style={[
                                            styles.suggestedPill,
                                            isAdded && styles.suggestedPillActive,
                                        ]}
                                    >
                                        <CustomText
                                            style={[
                                                styles.suggestedPillText,
                                                isAdded && styles.suggestedPillTextActive,
                                            ]}
                                        >
                                            {`${isAdded ? '✓' : '+'} ${subject}`}
                                        </CustomText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* SECTION 3: BATCH & TIMING */}
                    <View style={styles.sectionCard}>
                        <CustomText style={styles.sectionHeader}>BATCH & TIMING</CustomText>

                        <View style={styles.batchOptionsList}>
                            {batchOptions.map((batch) => {
                                const isSelected = selectedBatchId === batch.id;
                                return (
                                    <TouchableOpacity
                                        key={batch.id}
                                        activeOpacity={0.75}
                                        onPress={() => setSelectedBatchId(batch.id)}
                                        style={[
                                            styles.batchOptionCard,
                                            isSelected && styles.batchOptionCardSelected,
                                        ]}
                                    >
                                        <View style={styles.batchOptionInfo}>
                                            <CustomText style={styles.batchOptionTitle}>
                                                {batch.title}
                                            </CustomText>
                                            <CustomText style={styles.batchOptionSubtitle}>
                                                {batch.subtitle}
                                            </CustomText>
                                        </View>

                                        {isSelected && (
                                            <View style={styles.checkIconWrapper}>
                                                <CheckIcon size={resAvarage(2.2)} color="#000000" strokeWidth={2.4} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* SECTION 4: TUITION FEE */}
                    <View style={styles.sectionCard}>
                        <CustomText style={styles.sectionHeader}>TUITION FEE</CustomText>

                        {/* Monthly / Semester Tab Switcher */}
                        <View style={styles.periodSwitcher}>
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => setFeePeriod('Monthly')}
                                style={[
                                    styles.periodTab,
                                    feePeriod === 'Monthly' && styles.periodTabActive,
                                ]}
                            >
                                <CustomText
                                    style={[
                                        styles.periodTabText,
                                        feePeriod === 'Monthly' && styles.periodTabTextActive,
                                    ]}
                                >
                                    Monthly
                                </CustomText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => setFeePeriod('Semester')}
                                style={[
                                    styles.periodTab,
                                    feePeriod === 'Semester' && styles.periodTabActive,
                                ]}
                            >
                                <CustomText
                                    style={[
                                        styles.periodTabText,
                                        feePeriod === 'Semester' && styles.periodTabTextActive,
                                    ]}
                                >
                                    Semester
                                </CustomText>
                            </TouchableOpacity>
                        </View>

                        {/* Fee Amount Input */}
                        <View style={styles.inputGroup}>
                            <CustomText style={styles.inputLabel}>
                                {`${feePeriod} fee amount`}
                            </CustomText>
                            <View style={styles.amountInputRow}>
                                <CustomText style={styles.rupeeSymbol}>₹</CustomText>
                                <TextInput
                                    style={styles.amountTextInput}
                                    placeholder="2000"
                                    placeholderTextColor="#94A3B8"
                                    value={feeAmount}
                                    onChangeText={setFeeAmount}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* First Fee Due Date */}
                        <View style={styles.inputGroup}>
                            <CustomText style={styles.inputLabel}>First fee due date</CustomText>
                            <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => handleOpenCalendarFor('due')}
                                style={styles.datePickerInput}
                            >
                                <CustomText style={styles.datePickerInputText}>
                                    {formatDisplayDate(firstDueDate)}
                                </CustomText>
                                <CalendarIcon size={resAvarage(2)} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        {/* Semester End Date (Rendered when Semester is selected) */}
                        {feePeriod === 'Semester' && (
                            <View style={styles.inputGroup}>
                                <CustomText style={styles.inputLabel}>Semester end date</CustomText>
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    onPress={() => handleOpenCalendarFor('semesterEnd')}
                                    style={styles.datePickerInput}
                                >
                                    <CustomText style={styles.datePickerInputText}>
                                        {formatDisplayDate(semesterEndDate)}
                                    </CustomText>
                                    <CalendarIcon size={resAvarage(2)} color="#1E293B" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Space for Bottom Fixed Button */}
                    <View style={{ height: resAvarage(12) }} />
                </ScrollView>

                {/* Bottom Fixed Add Student Button */}
                <View style={styles.bottomBarContainer}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleAddStudent}
                        style={styles.addStudentBtn}
                    >
                        <CustomText style={styles.addStudentBtnText}>Add Student</CustomText>
                    </TouchableOpacity>
                </View>

                {/* Calendar Date Picker Modal */}
                <Modal
                    visible={isCalendarModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsCalendarModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setIsCalendarModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => {}}>
                                <View style={styles.calendarModalCard}>
                                    {/* Modal Header */}
                                    <View style={styles.calendarModalHeader}>
                                        <CustomText style={styles.calendarModalTitle}>
                                            {calendarTarget === 'start'
                                                ? 'Tuition Start Date'
                                                : calendarTarget === 'due'
                                                ? (feePeriod === 'Semester' ? 'Semester Due Date' : 'First Fee Due Date')
                                                : 'Semester End Date'}
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
                                                activeCalendarDate.getDate() === day &&
                                                activeCalendarDate.getMonth() === calendarMonth &&
                                                activeCalendarDate.getFullYear() === calendarYear;

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
                                                const today = new Date();
                                                if (calendarTarget === 'start') {
                                                    setStartDate(today);
                                                } else if (calendarTarget === 'due') {
                                                    setFirstDueDate(today);
                                                } else {
                                                    setSemesterEndDate(today);
                                                }
                                                setIsCalendarModalVisible(false);
                                            }}
                                            style={styles.todayQuickBtn}
                                        >
                                            <CustomText style={styles.todayQuickBtnText}>
                                                Set Today
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
    scrollContent: {
        paddingHorizontal: resAvarage(3),
        paddingTop: resAvarage(1),
        paddingBottom: resAvarage(6),
    },
    sectionCard: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(4),
        marginBottom: resAvarage(2.5),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    sectionHeader: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: resAvarage(2.5),
    },
    inputGroup: {
        marginBottom: resAvarage(2.2),
    },
    inputLabel: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: '#334155',
        marginBottom: resAvarage(0.8),
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3),
        height: resAvarage(6.2),
        fontFamily: FontRegular,
        fontSize: font14,
        color: colors.black,
    },
    datePickerInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3),
        height: resAvarage(6.2),
    },
    datePickerInputText: {
        fontFamily: FontMedium,
        fontSize: font14,
        color: colors.black,
    },
    addSubjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
        marginBottom: resAvarage(2),
    },
    addSubjectInput: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3),
        height: resAvarage(6.2),
        fontFamily: FontRegular,
        fontSize: font14,
        color: colors.black,
    },
    addSubjectBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(4),
        height: resAvarage(6.2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    addSubjectBtnText: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.white,
    },
    selectedSubjectsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: resAvarage(1.2),
        marginBottom: resAvarage(2),
    },
    selectedSubjectPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(0.8),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(1),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black,
    },
    selectedSubjectText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.white,
    },
    removeCross: {
        fontFamily: FontBold,
        fontSize: font11,
        color: '#94A3B8',
    },
    suggestedTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: resAvarage(1.2),
    },
    suggestedPill: {
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(1),
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        backgroundColor: colors.white,
    },
    suggestedPillActive: {
        backgroundColor: '#F1F5F9',
        borderColor: colors.black,
        borderStyle: 'solid',
    },
    suggestedPillText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#475569',
    },
    suggestedPillTextActive: {
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    batchOptionsList: {
        gap: resAvarage(1.5),
    },
    batchOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(2.2),
        borderRadius: resAvarage(3.5),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: colors.white,
    },
    batchOptionCardSelected: {
        backgroundColor: '#F8FAFC',
        borderColor: '#CBD5E1',
    },
    batchOptionInfo: {
        flex: 1,
        paddingRight: resAvarage(2),
    },
    batchOptionTitle: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
    },
    batchOptionSubtitle: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.3),
    },
    checkIconWrapper: {
        width: resAvarage(3),
        height: resAvarage(3),
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkSymbol: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
    },
    periodSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: resAvarage(100),
        padding: resAvarage(0.6),
        marginBottom: resAvarage(2.5),
    },
    periodTab: {
        flex: 1,
        paddingVertical: resAvarage(1.4),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: resAvarage(100),
    },
    periodTabActive: {
        backgroundColor: colors.white,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    periodTabText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: '#64748B',
    },
    periodTabTextActive: {
        fontFamily: FontBold,
        color: colors.black,
    },
    amountInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3),
        height: resAvarage(6.2),
    },
    rupeeSymbol: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
        marginRight: resAvarage(1),
    },
    amountTextInput: {
        flex: 1,
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
        paddingVertical: 0,
    },
    bottomBarContainer: {
        position: 'absolute',
        bottom: resAvarage(2),
        left: resAvarage(3),
        right: resAvarage(3),
    },
    addStudentBtn: {
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
    addStudentBtnText: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.white,
    },

    // Modal Styles
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
