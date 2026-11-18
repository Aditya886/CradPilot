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
import CustomButton from '../../../../ui/components/CustomButton';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { font10, font11, font12, font13, font14, font15, font16, font20, font24 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { navigate } from '../../../../navigation/NavigationUtils';
import { showFlashMessage } from '../../../../utils/flashMessage';
import InsightHeader from '../components/InsightHeader';
import {
    PendingFeeCard,
    PendingStudentItem,
    SearchIcon,
} from './components';
import ExportImportButton from '../../../../ui/components/ExportImportButton';
import ExportImportModal from '../../../../ui/modals/ExportImportModal';
import { ExportColumn } from '../../../../services/exportService';
import { importService } from '../../../../services/importService';
import { tuitionStorage } from '../../../../services/tuitionStorage';
import { useGetPendingFeesQuery, useRecordTuitionPaymentMutation } from '../../../../API';
import { ShowToast } from '../../../../utils/CustomToast/ToastManager';

type FilterType = 'all' | 'this_month' | 'last_month' | 'overdue';

interface FilterOption {
    id: FilterType;
    label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
    { id: 'all', label: 'All Pending' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'overdue', label: 'Overdue' },
];

export default function PendingFees() {
    const [students, setStudents] = useState<PendingStudentItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showExportModal, setShowExportModal] = useState(false);

    // RTK Query backend integration
    const { data: apiPendingRes, refetch: refetchPending } = useGetPendingFeesQuery(undefined);
    const [recordPaymentApi] = useRecordTuitionPaymentMutation();

    React.useEffect(() => {
        if (apiPendingRes && Array.isArray(apiPendingRes.data)) {
            const mapped: PendingStudentItem[] = apiPendingRes.data.map((item: any) => ({
                id: item._id || item.id,
                name: item.name || item.studentName || 'Student',
                classGrade: item.classGrade || item.grade || '',
                feeAmount: Number(item.feeAmount || item.amount || 0),
                dueFormatted: item.dueFormatted || (item.dueDate ? `Due ${item.dueDate}` : 'Due Soon'),
                statusType: item.statusType || (item.daysOverdue > 0 ? 'overdue' : 'due_soon'),
                daysText: item.daysText || (item.daysOverdue > 0 ? `Overdue by ${item.daysOverdue} days` : 'Due soon'),
                category: item.category || 'this_month',
            }));
            setStudents(mapped);
        } else {
            tuitionStorage.getPendingFees().then(persisted => {
                if (persisted && persisted.length > 0) {
                    setStudents(persisted as any);
                }
            });
        }
    }, [apiPendingRes]);

    // Record Payment Modal State
    const [selectedStudent, setSelectedStudent] = useState<PendingStudentItem | null>(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank'>('UPI');

    // Filter students based on search query and category
    const filteredStudents = useMemo(() => {
        return students.filter((item) => {
            // Search matching
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.classGrade.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            // Category matching
            if (activeFilter === 'all') return true;
            if (activeFilter === 'overdue') return item.statusType === 'overdue';
            if (activeFilter === 'this_month') return item.category === 'this_month';
            if (activeFilter === 'last_month') return item.category === 'last_month';

            return true;
        });
    }, [students, searchQuery, activeFilter]);

    // Calculate dynamic totals for the summary cards
    const summaryMetrics = useMemo(() => {
        const totalAmount = students.reduce((sum, item) => sum + item.feeAmount, 0);
        return {
            totalStudentsCount: students.length,
            totalPendingAmount: totalAmount,
        };
    }, [students]);
    const { totalStudentsCount, totalPendingAmount } = summaryMetrics;

    const handleCardPress = (item: PendingStudentItem) => {
        navigate('StudentDetails', {
            student: {
                id: item.id,
                name: item.name,
                classGrade: item.classGrade,
                feeAmount: `₹${item.feeAmount.toLocaleString('en-IN')}`,
                feeStatus: item.statusType === 'overdue' ? 'Overdue' : 'Due Soon',
                phone: '+91 98765 43210',
                parentName: 'Ramesh ' + item.name.split(' ')[1],
                batchName: 'Morning Batch (Mon, Wed, Fri)',
                batchTiming: '04:00 PM – 05:30 PM',
                subjects: ['Physics', 'Mathematics'],
            },
        });
    };

    const handleOpenRecordPayment = (item: PendingStudentItem) => {
        setSelectedStudent(item);
        setPaymentAmount(String(item.feeAmount));
        setPaymentMode('UPI');
        setIsPaymentModalVisible(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedStudent) return;
        const amt = Number(paymentAmount) || selectedStudent.feeAmount;

        const payload = {
            amount: amt,
            paymentMode,
            date: new Date().toISOString(),
        };

        const res: any = await recordPaymentApi({
            studentId: String(selectedStudent.id),
            body: payload,
        });

        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || `Payment of ₹${amt.toLocaleString('en-IN')} for ${selectedStudent.name} recorded!`, 'success');
            setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
            setIsPaymentModalVisible(false);
            setSelectedStudent(null);
            refetchPending();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to record payment', 'error');
            return;
        }
    };

    const feeExportColumns: ExportColumn[] = [
        { key: 'name', label: 'Student Name' },
        { key: 'classGrade', label: 'Class / Grade' },
        { key: 'feeAmount', label: 'Pending Fee (₹)', type: 'currency' },
        { key: 'dueFormatted', label: 'Due Date' },
        { key: 'statusType', label: 'Status' },
        { key: 'daysText', label: 'Days Info' },
        { key: 'category', label: 'Category' },
    ];

    const feeSampleCsv = `Student Name,Class / Grade,Pending Fee (₹),Due Date,Status,Days Info,Category
Sneha Iyer,Class 11,10000,Due 15 Sept,overdue,Overdue by 31 days,last_month
Aman Kumar,Class 10,2000,Due 3 Oct,overdue,Overdue by 13 days,this_month
Rahul Sharma,Class 8,1500,Due 17 Oct,due_soon,Due in 1 days,this_month`;

    return (
        <CommonBg>
            <InsightHeader
                title={"Pending Fees"}
                subtitle={"Every Transaction"}
                rightComponent={
                    <ExportImportButton onPress={() => setShowExportModal(true)} />
                }
            />

            <ExportImportModal
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                sectionTitle="Pending Fees & Payments"
                sectionSubtitle="Tuition Center Fee Dues & Ledger"
                exportColumns={feeExportColumns}
                exportRows={students}
                exportSummary={{
                    'Total Pending Students': summaryMetrics.totalStudentsCount,
                    'Total Outstanding Amount': `₹${summaryMetrics.totalPendingAmount.toLocaleString('en-IN')}`,
                    'Overdue Students': students.filter(s => s.statusType === 'overdue').length,
                }}
                defaultFilename={`CredPilot_PendingFees_${new Date().toISOString().split('T')[0]}`}
                sampleImportFormat={feeSampleCsv}
                onImportData={async (rawInput) => {
                    const result = await importService.importPendingFees(rawInput);
                    if (result.success && result.data) {
                        setStudents(result.data as any);
                    }
                    return result;
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Summary Cards Row: STUDENTS & AMOUNT PENDING */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryCard}>
                        <CustomText style={styles.summaryLabel}>STUDENTS</CustomText>
                        <CustomText style={styles.summaryValueBlack}>
                            {totalStudentsCount}
                        </CustomText>
                    </View>

                    <View style={styles.summaryCard}>
                        <CustomText style={styles.summaryLabel}>AMOUNT PENDING</CustomText>
                        <CustomText style={styles.summaryValueRed}>
                            {`₹${totalPendingAmount.toLocaleString('en-IN')}`}
                        </CustomText>
                    </View>
                </View>

                {/* 2. Search Input */}
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
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={styles.clearBtn}
                        >
                            <CustomText style={styles.clearBtnText}>✕</CustomText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* 3. Filter Pills Row */}
                <View style={styles.filtersWrapper}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersScroll}
                    >
                        {FILTER_OPTIONS.map((filter) => {
                            const isActive = activeFilter === filter.id;
                            return (
                                <TouchableOpacity
                                    key={filter.id}
                                    activeOpacity={0.7}
                                    onPress={() => setActiveFilter(filter.id)}
                                    style={[
                                        styles.filterPill,
                                        isActive && styles.filterPillActive,
                                    ]}
                                >
                                    <CustomText
                                        style={[
                                            styles.filterPillText,
                                            isActive && styles.filterPillTextActive,
                                        ]}
                                    >
                                        {filter.label}
                                    </CustomText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* 4. Student Pending Fee Cards List */}
                <View style={styles.listContainer}>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((item) => (
                            <PendingFeeCard
                                key={item.id}
                                item={item}
                                onPress={handleCardPress}
                                onRecordPayment={handleOpenRecordPayment}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <CustomText style={styles.emptyTitle}>No pending fees found</CustomText>
                            <CustomText style={styles.emptySubtitle}>
                                {searchQuery
                                    ? `No students matching "${searchQuery}"`
                                    : 'All student fees in this filter have been cleared.'}
                            </CustomText>
                            {(searchQuery.length > 0 || activeFilter !== 'all') && (
                                <TouchableOpacity
                                    style={styles.resetBtn}
                                    onPress={() => {
                                        setSearchQuery('');
                                        setActiveFilter('all');
                                    }}
                                >
                                    <CustomText style={styles.resetBtnText}>Clear filters</CustomText>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Bottom Footer */}
                <CustomText style={styles.footer}>
                    on-device · offline · private
                </CustomText>
            </ScrollView>

            {/* Record Payment Confirmation Modal */}
            <Modal
                visible={isPaymentModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsPaymentModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsPaymentModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalCard}>
                                <CustomText style={styles.modalHeaderTitle}>Record Payment</CustomText>
                                <CustomText style={styles.modalStudentName}>
                                    {selectedStudent?.name} · {selectedStudent?.classGrade}
                                </CustomText>

                                {/* Amount Field */}
                                <View style={styles.modalInputGroup}>
                                    <CustomText style={styles.modalInputLabel}>PAYMENT AMOUNT</CustomText>
                                    <View style={styles.amountInputRow}>
                                        <CustomText style={styles.rupeeSymbol}>₹</CustomText>
                                        <TextInput
                                            style={styles.modalAmountInput}
                                            value={paymentAmount}
                                            onChangeText={setPaymentAmount}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#94A3B8"
                                        />
                                    </View>
                                </View>

                                {/* Payment Mode */}
                                <View style={styles.modalInputGroup}>
                                    <CustomText style={styles.modalInputLabel}>PAYMENT MODE</CustomText>
                                    <View style={styles.modeRow}>
                                        {(['UPI', 'Cash', 'Bank'] as const).map((mode) => (
                                            <TouchableOpacity
                                                key={mode}
                                                activeOpacity={0.7}
                                                onPress={() => setPaymentMode(mode)}
                                                style={[
                                                    styles.modePill,
                                                    paymentMode === mode && styles.modePillActive,
                                                ]}
                                            >
                                                <CustomText
                                                    style={[
                                                        styles.modeText,
                                                        paymentMode === mode && styles.modeTextActive,
                                                    ]}
                                                >
                                                    {mode}
                                                </CustomText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.modalActionsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setIsPaymentModalVisible(false)}
                                        style={styles.cancelBtn}
                                    >
                                        <CustomText style={styles.cancelBtnText}>Cancel</CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={handleConfirmPayment}
                                        style={styles.confirmBtn}
                                    >
                                        <CustomText style={styles.confirmBtnText}>Confirm Payment</CustomText>
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
    summaryRow: {
        flexDirection: 'row',
        gap: resAvarage(2.5),
        marginBottom: resAvarage(2.5),
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(3),
        borderWidth: 1,
        borderColor: '#EEEEEE',
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    summaryLabel: {
        fontFamily: FontMedium,
        fontSize: font11,
        color: '#64748B',
        letterSpacing: 1.1,
        textTransform: 'uppercase',
        marginBottom: resAvarage(0.8),
    },
    summaryValueBlack: {
        fontFamily: FontBold,
        fontSize: font24,
        color: colors.black,
    },
    summaryValueRed: {
        fontFamily: FontBold,
        fontSize: font24,
        color: '#DC2626',
    },
    searchBar: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: resAvarage(3.5),
        height: resAvarage(6.2),
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
    filtersWrapper: {
        marginBottom: resAvarage(2.5),
    },
    filtersScroll: {
        flexDirection: 'row',
        gap: resAvarage(1.5),
    },
    filterPill: {
        paddingHorizontal: resAvarage(3.8),
        paddingVertical: resAvarage(1.2),
        borderRadius: resAvarage(100),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterPillActive: {
        backgroundColor: colors.black,
        borderColor: colors.black,
    },
    filterPillText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black,
    },
    filterPillTextActive: {
        color: colors.white,
        fontFamily: FontBold,
    },
    listContainer: {
        marginBottom: resAvarage(2),
    },
    emptyContainer: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(6),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginTop: resAvarage(1),
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
        textAlign: 'center',
    },
    resetBtn: {
        marginTop: resAvarage(2),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(1),
        backgroundColor: '#F1F5F9',
        borderRadius: resAvarage(100),
    },
    resetBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font12,
        color: colors.black,
    },
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(2),
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
        maxWidth: resWidth(88),
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(4.5),
        elevation: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    modalHeaderTitle: {
        fontFamily: FontBold,
        fontSize: font20,
        color: colors.black,
    },
    modalStudentName: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.4),
        marginBottom: resAvarage(3),
    },
    modalInputGroup: {
        marginBottom: resAvarage(2.5),
    },
    modalInputLabel: {
        fontFamily: FontMedium,
        fontSize: font11,
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: resAvarage(1),
    },
    amountInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: resAvarage(3),
        height: resAvarage(6.5),
    },
    rupeeSymbol: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
        marginRight: resAvarage(1),
    },
    modalAmountInput: {
        flex: 1,
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
        paddingVertical: 0,
    },
    modeRow: {
        flexDirection: 'row',
        gap: resAvarage(1.5),
    },
    modePill: {
        flex: 1,
        paddingVertical: resAvarage(1.5),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: resAvarage(2.5),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modePillActive: {
        backgroundColor: colors.black,
        borderColor: colors.black,
    },
    modeText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black,
    },
    modeTextActive: {
        color: colors.white,
        fontFamily: FontBold,
    },
    modalActionsRow: {
        flexDirection: 'row',
        gap: resAvarage(2),
        marginTop: resAvarage(1.5),
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: resAvarage(2),
        borderRadius: resAvarage(3),
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
        color: '#64748B',
    },
    confirmBtn: {
        flex: 1.5,
        paddingVertical: resAvarage(2),
        borderRadius: resAvarage(3),
        backgroundColor: colors.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnText: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.white,
    },
});