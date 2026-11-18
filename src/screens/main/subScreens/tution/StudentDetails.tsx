import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Modal,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { CommonBg } from '../../../../ui/common/CommonBg';
import CustomText from '../../../../ui/components/CustomText';
import CustomButton from '../../../../ui/components/CustomButton';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { font10, font12, font13, font14, font16, font18 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import InsightHeader from '../components/InsightHeader';
import { goBack } from '../../../../navigation/NavigationUtils';
import { ShowToast } from '../../../../utils/CustomToast/ToastManager';
import { useRecordTuitionPaymentMutation } from '../../../../API';
import { useAppDispatch } from '../../../../storage/redux/store';
import { removeTuitionStudent } from '../../../../storage/redux/silce/TuitionSlice';
import {
    StudentProfileCard,
    StudentFeeCard,
    StudentPaymentHistory,
    StudentAttendanceCalendar,
    StudentStudyHistory,
    RemoveStudentModal,
    StudentItem,
} from './components';
import ExportImportButton from '../../../../ui/components/ExportImportButton';
import ExportImportModal from '../../../../ui/modals/ExportImportModal';
import { ExportColumn } from '../../../../services/exportService';
import { importService } from '../../../../services/importService';

export default function StudentDetails({ route }: any) {
    const dispatch = useAppDispatch();
    const [recordPaymentApi] = useRecordTuitionPaymentMutation();
    const student: StudentItem = route?.params?.student || {
        id: '',
        name: 'Student',
        classGrade: '',
        parentName: '',
        phone: '',
        subjects: [],
        batchName: '',
        batchTiming: '',
        feeAmount: 0,
        feePeriod: 'month',
        feeStatus: 'Active',
        dueInfo: '',
        attendanceStatus: 'Not marked',
        isActive: true,
    };

    const initialFeeNum = Number(String(student.feeAmount).replace(/[^0-9]/g, '')) || 0;

    const [feeStatus, setFeeStatus] = useState<string>(student.feeStatus || 'Active');
    const [pendingAmount, setPendingAmount] = useState<number>(
        student.feeStatus === 'Paid' ? 0 : initialFeeNum
    );
    const [paymentHistory, setPaymentHistory] = useState<any[]>((student as any).paymentHistory || []);

    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [paymentAmountInput, setPaymentAmountInput] = useState(String(initialFeeNum));
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank'>('UPI');

    const handleRecordPayment = () => {
        setPaymentAmountInput(String(pendingAmount > 0 ? pendingAmount : initialFeeNum));
        setPaymentMode('UPI');
        setIsPaymentModalVisible(true);
    };

    const handleConfirmPayment = async () => {
        const amt = Number(paymentAmountInput) || initialFeeNum;
        const payload = {
            amount: amt,
            paymentMode,
            date: new Date().toISOString(),
        };

        const res: any = await recordPaymentApi({
            studentId: String(student.id),
            body: payload,
        });

        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || `Payment of ₹${amt.toLocaleString('en-IN')} recorded!`, 'success');

            setFeeStatus('Paid');
            setPendingAmount(0);
            setPaymentHistory((prev) => [
                {
                    id: String(res?.data?.data?._id || Date.now()),
                    monthTitle: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                    paidDetail: `Paid ${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'short' })} · ${paymentMode}`,
                    amount: amt,
                },
                ...prev,
            ]);
            setIsPaymentModalVisible(false);
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to record payment', 'error');
            return;
        }
    };

    const handleConfirmRemove = () => {
        setIsRemoveModalVisible(false);
        if (student?.id) {
            dispatch(removeTuitionStudent(student.id));
        }
        ShowToast(`Student "${student.name}" removed successfully`, 'success');
        goBack();
    };

    const statementExportColumns: ExportColumn[] = [
        { key: 'monthTitle', label: 'Payment Period' },
        { key: 'paidDetail', label: 'Payment Details' },
        { key: 'amount', label: 'Amount Paid (₹)', type: 'currency' },
    ];

    return (
        <CommonBg>
            <InsightHeader
                title={"Student Statement"}
                subtitle={student.name}
                rightComponent={
                    <ExportImportButton onPress={() => setShowExportModal(true)} label="Export Statement" />
                }
            />

            <ExportImportModal
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                sectionTitle={`Statement: ${student.name}`}
                sectionSubtitle="Student Fee & Profile Ledger"
                exportColumns={statementExportColumns}
                exportRows={paymentHistory}
                exportSummary={{
                    'Student Name': student.name,
                    'Class / Grade': student.classGrade,
                    'Batch': student.batchName,
                    'Monthly Fee': `₹${initialFeeNum}`,
                    'Current Fee Status': feeStatus,
                    'Total Payments Logged': paymentHistory.length,
                }}
                defaultFilename={`CredPilot_Statement_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`}
                sampleImportFormat={`Payment Period,Payment Details,Amount Paid (₹)\nOctober 2026,Paid 16 Oct · UPI,2000\nSeptember 2026,Paid 3 Sept · Cash,2000`}
                onImportData={async (rawInput) => {
                    const { rows } = importService.parseTabularData(rawInput);
                    if (rows.length === 0) {
                        return { success: false, message: 'No payment rows found', rowCount: 0 };
                    }
                    const newEntries: any[] = [];
                    rows.forEach((r, idx) => {
                        const monthTitle = r['monthtitle'] || r['paymentperiod'] || r['period'] || 'Payment';
                        const paidDetail = r['paiddetail'] || r['details'] || 'Imported Payment';
                        const amount = parseFloat(r['amountpaid'] || r['amount'] || String(initialFeeNum)) || initialFeeNum;
                        newEntries.push({
                            id: String(Date.now() + idx),
                            monthTitle,
                            paidDetail,
                            amount,
                        });
                    });
                    setPaymentHistory(prev => [...newEntries, ...prev]);
                    return {
                        success: true,
                        message: `Imported ${newEntries.length} payment records for ${student.name}!`,
                        rowCount: newEntries.length,
                    };
                }}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Student Profile Card */}
                <StudentProfileCard
                    name={student.name}
                    classGrade={student.classGrade}
                    sinceDate={(student as any).startDate ? new Date((student as any).startDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                    parentName={student.parentName}
                    batchName={student.batchName}
                    batchTiming={student.batchTiming}
                    batchDays={(student as any).batchDays || ''}
                    phone={student.phone}
                    subjects={student.subjects}
                />

                {/* 2. Monthly Fee Card */}
                <StudentFeeCard
                    monthlyFee={student.feeAmount}
                    feeStatus={feeStatus}
                    lastPaidAmount={initialFeeNum}
                    lastPaidDate={feeStatus === 'Paid' ? new Date().toLocaleDateString('en-GB') : (student as any).lastPaidDate || 'N/A'}
                    nextDueDate={student.dueInfo || 'Due soon'}
                    pendingAmount={pendingAmount}
                    overdueDays={feeStatus === 'Overdue' ? 1 : 0}
                    onPressRecordPayment={handleRecordPayment}
                />

                {/* 3. Payment History Section */}
                <StudentPaymentHistory history={paymentHistory} />

                {/* 4. Attendance Calendar Section */}
                <StudentAttendanceCalendar
                    initialMonth={new Date().getMonth()}
                    initialYear={new Date().getFullYear()}
                    paidDates={[]}
                    upcomingDueDates={[]}
                />

                {/* 5. Study History Section */}
                <StudentStudyHistory />

                {/* 6. Remove Student Button */}
                <View style={styles.removeBtnContainer}>
                    <CustomButton
                        title="Remove Student"
                        variant="error"
                        linear={false}
                        backgroundColor="#FEE2E2"
                        textColor="#DC2626"
                        onPress={() => setIsRemoveModalVisible(true)}
                        style={styles.removeButton}
                    />
                </View>

                {/* Bottom Footer */}
                <CustomText style={styles.footer}>
                    on-device · offline · private
                </CustomText>
            </ScrollView>

            {/* Confirm Remove Student Modal */}
            <RemoveStudentModal
                visible={isRemoveModalVisible}
                studentName={student.name}
                onClose={() => setIsRemoveModalVisible(false)}
                onConfirm={handleConfirmRemove}
            />

            {/* Record Payment Modal */}
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
                                    {student.name} · {student.classGrade}
                                </CustomText>

                                {/* Amount Field */}
                                <View style={styles.modalInputGroup}>
                                    <CustomText style={styles.modalInputLabel}>PAYMENT AMOUNT</CustomText>
                                    <View style={styles.amountInputRow}>
                                        <CustomText style={styles.rupeeSymbol}>₹</CustomText>
                                        <TextInput
                                            style={styles.modalAmountInput}
                                            value={paymentAmountInput}
                                            onChangeText={setPaymentAmountInput}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#94A3B8"
                                        />
                                    </View>
                                </View>

                                {/* Payment Mode Options */}
                                <View style={styles.modalInputGroup}>
                                    <CustomText style={styles.modalInputLabel}>PAYMENT MODE</CustomText>
                                    <View style={styles.modeTabsRow}>
                                        {(['UPI', 'Cash', 'Bank'] as const).map((mode) => {
                                            const isSelected = paymentMode === mode;
                                            return (
                                                <TouchableOpacity
                                                    key={mode}
                                                    onPress={() => setPaymentMode(mode)}
                                                    style={[
                                                        styles.modeTab,
                                                        isSelected && styles.modeTabActive,
                                                    ]}
                                                >
                                                    <CustomText
                                                        style={[
                                                            styles.modeTabText,
                                                            isSelected && styles.modeTabTextActive,
                                                        ]}
                                                    >
                                                        {mode}
                                                    </CustomText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Buttons: Cancel & Confirm */}
                                <View style={styles.modalButtonsRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setIsPaymentModalVisible(false)}
                                        style={styles.cancelButton}
                                    >
                                        <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={handleConfirmPayment}
                                        style={styles.confirmButton}
                                    >
                                        <CustomText style={styles.confirmButtonText}>
                                            Confirm Payment
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
        paddingTop: resAvarage(1),
        paddingBottom: resAvarage(6),
    },
    removeBtnContainer: {
        marginTop: resAvarage(3),
        marginBottom: resAvarage(1),
    },
    removeButton: {
        borderRadius: resAvarage(3),
        borderWidth: 1,
        borderColor: '#FECACA',
        height: resAvarage(6.2),
    },
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(2),
        fontSize: font10,
        marginBottom: resAvarage(4),
        color: colors.black60,
        fontFamily: FontMedium,
        alignSelf: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    modalHeaderTitle: {
        fontFamily: FontBold,
        fontSize: font18,
        color: colors.black,
    },
    modalStudentName: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: '#64748B',
        marginTop: resAvarage(0.5),
        marginBottom: resAvarage(3),
    },
    modalInputGroup: {
        marginBottom: resAvarage(2.5),
    },
    modalInputLabel: {
        fontFamily: FontMedium,
        fontSize: font10,
        color: '#64748B',
        letterSpacing: 1.1,
        marginBottom: resAvarage(1),
    },
    amountInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: resAvarage(3),
        paddingHorizontal: resAvarage(3),
        backgroundColor: '#F8FAFC',
        height: resAvarage(6.2),
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
    modeTabsRow: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: resAvarage(100),
        padding: resAvarage(0.5),
    },
    modeTab: {
        flex: 1,
        paddingVertical: resAvarage(1.2),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: resAvarage(100),
    },
    modeTabActive: {
        backgroundColor: colors.white,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    modeTabText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: '#64748B',
    },
    modeTabTextActive: {
        fontFamily: FontBold,
        color: colors.black,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
        marginTop: resAvarage(1.5),
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(1.6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: '#64748B',
    },
    confirmButton: {
        flex: 1.6,
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(1.6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontFamily: FontBold,
        fontSize: font13,
        color: colors.white,
    },
});