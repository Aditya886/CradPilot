import React, { useState, useMemo, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    TextInput,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { CommonBg } from '../../../../ui/common/CommonBg';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { font10, font12, font13, font14, font16 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import InsightHeader from '../components/InsightHeader';
import { navigate } from '../../../../navigation/NavigationUtils';
import {
    StudentCard,
    StudentItem,
    SearchIcon,
    ChevronDownIcon,
} from './components';
import { tuitionStorage, TuitionStudent } from '../../../../services/tuitionStorage';
import { importService } from '../../../../services/importService';
import { ExportColumn } from '../../../../services/exportService';
import ExportImportModal from '../../../../ui/modals/ExportImportModal';
import ExportImportButton from '../../../../ui/components/ExportImportButton';
import { useGetStudentsQuery, useGetBatchesQuery } from '../../../../API';
import { useAppDispatch, useAppSelector } from '../../../../API/hooks/ReduxHooks';
import { setTuitionStudents } from '../../../../storage/redux/silce/TuitionSlice';
import { ActivityIndicator } from 'react-native';


const INITIAL_STUDENTS: StudentItem[] = [];

const STATUS_FILTERS = [
    'All',
    'Active',
    'Fee Pending',
    'Fee Paid',
    'Overdue',
];

const SORT_OPTIONS = [
    'Name',
    'Due Date',
    'Fee Amount',
    'Class',
];



const STUDENT_COLUMNS: ExportColumn[] = [
    { key: 'name', label: 'Student Name' },
    { key: 'classGrade', label: 'Class / Grade' },
    { key: 'parentName', label: 'Parent Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'batchName', label: 'Batch' },
    { key: 'feeAmount', label: 'Fee Amount (₹)', type: 'currency' },
    { key: 'feePeriod', label: 'Period' },
    { key: 'feeStatus', label: 'Fee Status' },
    { key: 'dueInfo', label: 'Due Date' },
];

const SAMPLE_STUDENTS_CSV = `Student Name,Class / Grade,Parent Name,Phone,Batch,Fee Amount (₹),Fee Status,Due Date
Aman Kumar,Class 10,Rekha Kumar,99582 11870,Evening Seniors,2000,Overdue,Next due 3 Oct
Ishaan Gupta,Class 12,Meera Gupta,88004 77211,Board Prep,12000,Paid,Fully paid
Kabir Singh,Class 6,Harpreet Singh,93120 55643,Morning Juniors,1200,Due Soon,Next due 20 Oct`;

export default function Students() {
    const dispatch = useAppDispatch();
    const reduxStudents = useAppSelector(state => state.tuition.students);
    const reduxBatches = useAppSelector(state => state.tuition.batches);

    const [studentsList, setStudentsList] = useState<StudentItem[]>(INITIAL_STUDENTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedBatch, setSelectedBatch] = useState('All batches');
    const [selectedSort, setSelectedSort] = useState('Name');

    const [batchModalVisible, setBatchModalVisible] = useState(false);
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // Real API integration
    const { data: apiStudentsRes, isLoading: isApiLoading, refetch: refetchStudents } = useGetStudentsQuery();
    const { data: apiBatchesRes } = useGetBatchesQuery(undefined);

    // Dynamic batches from Redux / API
    const batchOptions = useMemo(() => {
        const list = ['All batches'];
        const sourceBatches = (reduxBatches && reduxBatches.length > 0)
            ? reduxBatches
            : (apiBatchesRes && Array.isArray(apiBatchesRes.data) ? apiBatchesRes.data : []);

        sourceBatches.forEach((b: any) => {
            const name = b.title || b.name;
            if (name && !list.includes(name)) list.push(name);
        });

        studentsList.forEach((s) => {
            if (s.batchName && !list.includes(s.batchName)) list.push(s.batchName);
        });
        return list;
    }, [reduxBatches, apiBatchesRes, studentsList]);

    useEffect(() => {
        if (apiStudentsRes && Array.isArray(apiStudentsRes.data)) {
            const mapped: StudentItem[] = apiStudentsRes.data.map((s: any) => ({
                id: s._id || s.id,
                name: s.name,
                classGrade: s.classGrade,
                parentName: s.parentName,
                phone: s.phone,
                subjects: s.subjects || [],
                batchName: s.batchName || 'General',
                batchTiming: s.batchTiming || '',
                feeAmount: Number(s.feeAmount) || 0,
                feePeriod: s.feePeriod || 'month',
                feeStatus: s.feeStatus || 'Due Soon',
                dueInfo: s.nextDueDate ? `Next due ${new Date(s.nextDueDate).toLocaleDateString('en-GB')}` : 'Due soon',
                attendanceStatus: 'Not marked',
                isActive: s.isActive !== false,
            }));
            setStudentsList(mapped);
            dispatch(setTuitionStudents(mapped as any));
        }
    }, [apiStudentsRes, dispatch]);

    // Load persisted students from tuitionStorage
    const refreshStudents = async () => {
        const stored = await tuitionStorage.getStudents();
        if (stored && stored.length > 0) {
            setStudentsList(stored);
        }
    };

    React.useEffect(() => {
        refreshStudents();
        refetchStudents();
        const unsubscribe = tuitionStorage.subscribe(() => {
            refreshStudents();
        });
        return () => unsubscribe();
    }, [refetchStudents]);

    // Filter and Sort students
    const filteredStudents = useMemo(() => {
        let result = studentsList.filter((student) => {
            // Search query filter: matches name, parent, phone, or class
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchName = student.name.toLowerCase().includes(query);
                const matchParent = student.parentName.toLowerCase().includes(query);
                const matchPhone = student.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''));
                const matchClass = student.classGrade.toLowerCase().includes(query);
                const matchSubjects = student.subjects.some((sub) => sub.toLowerCase().includes(query));

                if (!matchName && !matchParent && !matchPhone && !matchClass && !matchSubjects) {
                    return false;
                }
            }

            // Status filter
            if (selectedStatus === 'Active') {
                if (!student.isActive) return false;
            } else if (selectedStatus === 'Fee Pending') {
                if (student.feeStatus !== 'Overdue' && student.feeStatus !== 'Due Soon') return false;
            } else if (selectedStatus === 'Fee Paid') {
                if (student.feeStatus !== 'Paid') return false;
            } else if (selectedStatus === 'Overdue') {
                if (student.feeStatus !== 'Overdue') return false;
            }

            // Batch filter
            if (selectedBatch !== 'All batches') {
                if (student.batchName !== selectedBatch) return false;
            }

            return true;
        });

        // Sorting
        result = [...result].sort((a, b) => {
            if (selectedSort === 'Name') {
                return a.name.localeCompare(b.name);
            }
            if (selectedSort === 'Fee Amount') {
                return b.feeAmount - a.feeAmount;
            }
            if (selectedSort === 'Class') {
                return a.classGrade.localeCompare(b.classGrade);
            }
            return 0;
        });

        return result;
    }, [studentsList, searchQuery, selectedStatus, selectedBatch, selectedSort]);

    const exportSummary = useMemo(() => {
        const totalFees = studentsList.reduce((sum, s) => sum + s.feeAmount, 0);
        const overdueCount = studentsList.filter(s => s.feeStatus === 'Overdue').length;
        return {
            'Total Students': studentsList.length,
            'Active Students': studentsList.filter(s => s.isActive).length,
            'Total Monthly Fees': `₹${totalFees.toLocaleString()}`,
            'Overdue Dues': overdueCount,
        };
    }, [studentsList]);

    return (
        <CommonBg>
            <InsightHeader
                title={"Students"}
                subtitle={"Tution Center"}
                rightComponent={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: resAvarage(1) }}>
                        <ExportImportButton onPress={() => setShowExportModal(true)} />
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigate('AddStudent')}
                            style={styles.headerAddBtn}
                        >
                            <CustomText style={styles.headerAddBtnText}>+ Add</CustomText>
                        </TouchableOpacity>
                    </View>
                }
            />

            <ExportImportModal
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                sectionTitle="Tuition Students Listing"
                sectionSubtitle="Enrolled Student Records & Fees"
                exportColumns={STUDENT_COLUMNS}
                exportRows={studentsList}
                exportSummary={exportSummary}
                defaultFilename={`CredPilot_Students_${new Date().toISOString().split('T')[0]}`}
                sampleImportFormat={SAMPLE_STUDENTS_CSV}
                onImportData={async (rawInput) => {
                    const result = await importService.importStudents(rawInput);
                    await refreshStudents();
                    return result;
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* 1. Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchIcon size={resAvarage(2.6)} color="#64748B" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search name, parent, phone, class"
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        clearButtonMode="while-editing"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <CustomText style={styles.clearBtnText}>✕</CustomText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 2. Status Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterPillsContainer}
                >
                    {STATUS_FILTERS.map((item) => {
                        const isSelected = selectedStatus === item;
                        return (
                            <TouchableOpacity
                                key={item}
                                activeOpacity={0.7}
                                onPress={() => setSelectedStatus(item)}
                                style={[
                                    styles.filterPill,
                                    isSelected ? styles.filterPillActive : styles.filterPillInactive,
                                ]}
                            >
                                <CustomText
                                    style={[
                                        styles.filterPillText,
                                        isSelected ? styles.filterPillTextActive : styles.filterPillTextInactive,
                                    ]}
                                >
                                    {item}
                                </CustomText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* 3. Sub-header: Count & Dropdowns */}
                <View style={styles.subHeaderRow}>
                    <CustomText style={styles.studentCountText}>
                        {`${filteredStudents.length} students`}
                    </CustomText>

                    <View style={styles.dropdownsRow}>
                        {/* Batches Dropdown Button */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setBatchModalVisible(true)}
                            style={styles.dropdownButton}
                        >
                            <CustomText numberOfLines={1} style={styles.dropdownText}>
                                {selectedBatch}
                            </CustomText>
                            <ChevronDownIcon size={resAvarage(1.8)} color="#64748B" />
                        </TouchableOpacity>

                        {/* Sort Dropdown Button */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setSortModalVisible(true)}
                            style={styles.dropdownButton}
                        >
                            <CustomText numberOfLines={1} style={styles.dropdownText}>
                                {selectedSort}
                            </CustomText>
                            <ChevronDownIcon size={resAvarage(1.8)} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 4. Student Cards Listing */}
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onPress={(item) => {
                                navigate('StudentDetails', { student: item });
                            }}
                        />

                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <CustomText style={styles.emptyTitle}>No students found</CustomText>
                        <CustomText style={styles.emptySubtitle}>
                            Try adjusting your search or filters to see student records.
                        </CustomText>
                    </View>
                )}

                {/* Footer */}
                <CustomText style={styles.footer}>
                    on-device · offline · private
                </CustomText>
            </ScrollView>

            {/* Modal for Batch Filter */}
            <Modal
                visible={batchModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setBatchModalVisible(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setBatchModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalTitle}>Filter by Batch</CustomText>
                        {batchOptions.map((batch) => {
                            const isSelected = selectedBatch === batch;
                            return (
                                <TouchableOpacity
                                    key={batch}
                                    style={[
                                        styles.modalOption,
                                        isSelected && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedBatch(batch);
                                        setBatchModalVisible(false);
                                    }}
                                >
                                    <CustomText
                                        style={[
                                            styles.modalOptionText,
                                            isSelected && styles.modalOptionTextSelected,
                                        ]}
                                    >
                                        {batch}
                                    </CustomText>
                                    {isSelected && (
                                        <CustomText style={styles.checkmarkText}>✓</CustomText>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>

            {/* Modal for Sort Filter */}
            <Modal
                visible={sortModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setSortModalVisible(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setSortModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalTitle}>Sort Students by</CustomText>
                        {SORT_OPTIONS.map((opt) => {
                            const isSelected = selectedSort === opt;
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.modalOption,
                                        isSelected && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedSort(opt);
                                        setSortModalVisible(false);
                                    }}
                                >
                                    <CustomText
                                        style={[
                                            styles.modalOptionText,
                                            isSelected && styles.modalOptionTextSelected,
                                        ]}
                                    >
                                        {opt}
                                    </CustomText>
                                    {isSelected && (
                                        <CustomText style={styles.checkmarkText}>✓</CustomText>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Modal>
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: resAvarage(3),
        paddingTop: resAvarage(1),
        paddingBottom: resAvarage(6),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: resAvarage(10),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3.5),
        height: resAvarage(5.8),
        gap: resAvarage(2),
    },
    searchInput: {
        flex: 1,
        fontFamily: FontRegular,
        fontSize: font13,
        color: colors.black,
        paddingVertical: 0,
    },
    clearBtnText: {
        fontSize: font14,
        color: '#94A3B8',
        paddingHorizontal: resAvarage(1),
    },
    filterPillsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: resAvarage(1.8),
        paddingVertical: resAvarage(0.5),
        gap: resAvarage(1.2),
    },
    filterPill: {
        borderRadius: resAvarage(10),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(1.2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterPillActive: {
        backgroundColor: colors.black,
    },
    filterPillInactive: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterPillText: {
        fontSize: font13,
        fontFamily: FontMedium,
    },
    filterPillTextActive: {
        color: colors.white,
        fontFamily: FontSemiBold,
    },
    filterPillTextInactive: {
        color: colors.black,
    },
    subHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: resAvarage(2.2),
        marginBottom: resAvarage(1.8),
        paddingHorizontal: resAvarage(0.5),
    },
    studentCountText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: '#64748B',
    },
    dropdownsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: resAvarage(10),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(2.8),
        paddingVertical: resAvarage(0.8),
        gap: resAvarage(1),
    },
    dropdownText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#1E293B',
    },
    emptyContainer: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(6),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: resAvarage(2),
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    emptyTitle: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.black,
        marginBottom: resAvarage(1),
    },
    emptySubtitle: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: '#64748B',
        textAlign: 'center',
    },
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(3),
        fontSize: font10,
        marginBottom: resAvarage(4),
        color: colors.black60,
        fontFamily: FontMedium,
        alignSelf: 'center',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(6),
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        padding: resAvarage(4),
        elevation: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    modalTitle: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
        marginBottom: resAvarage(2.5),
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: resAvarage(2.2),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalOptionSelected: {
        backgroundColor: '#F8FAFC',
        paddingHorizontal: resAvarage(2),
        borderRadius: resAvarage(2),
    },
    modalOptionText: {
        fontFamily: FontRegular,
        fontSize: font14,
        color: '#1E293B',
    },
    modalOptionTextSelected: {
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    checkmarkText: {
        fontSize: font14,
        color: colors.black,
        fontFamily: FontBold,
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
});