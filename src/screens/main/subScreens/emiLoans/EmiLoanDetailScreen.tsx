import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { CommonBg } from '../../../../ui/common/CommonBg';
import InsightHeader from '../components/InsightHeader';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily';
import { font11, font12, font13, font16, font20, font24, font26 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { formatINR } from '../../../../utils/FormatUtil';
import { query, update, remove, insert } from '../../../../storage/local/sqlite';
import { useRoute } from '@react-navigation/native';
import { goBack } from '../../../../navigation/NavigationUtils';
import { ShowToast } from '../../../../utils/CustomToast/ToastManager';
import DeleteConfirmationModal from '../../../../ui/modals/DeleteConfirmationModal';
import { 
    useGetEmiLoanDetailQuery,
    useMarkEmiPaidMutation, 
    useUndoLastEmiMutation, 
    useForecloseLoanMutation, 
    useDeleteEmiLoanMutation 
} from '../../../../API';

// Components
import CircularProgress from '../savingAndGoals/components/CircularProgress';
import AmortisationScheduleCard from './components/AmortisationScheduleCard';
import { computeLoanStats } from './utils/emiCalculator';
import Svg, { Path } from 'react-native-svg';

const CheckIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const TrashIcon = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6" stroke="#DC2626" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function EmiLoanDetailScreen() {
    const route = useRoute<any>();
    const loanId = route.params?.loanId || route.params?.loanItem?.id;
    const initialLoan = route.params?.loanItem || null;

    const [loan, setLoan] = useState<any>(initialLoan);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showForecloseModal, setShowForecloseModal] = useState(false);

    // RTK Query API Hooks
    const { data: apiDetailRes, refetch: refetchDetail } = useGetEmiLoanDetailQuery(String(loanId), {
        skip: !loanId || typeof loanId === 'number',
    });
    const [markEmiPaidApi] = useMarkEmiPaidMutation();
    const [undoLastEmiApi] = useUndoLastEmiMutation();
    const [forecloseLoanApi] = useForecloseLoanMutation();
    const [deleteEmiLoanApi] = useDeleteEmiLoanMutation();

    // Sync from API if available
    useEffect(() => {
        if (apiDetailRes && apiDetailRes.data) {
            const r = apiDetailRes.data;
            setLoan((prev: any) => ({
                id: r._id || r.id || prev?.id || loanId,
                title: r.name || r.title || prev?.title || 'Loan',
                lender: r.lender || prev?.lender || 'Lender',
                amount: Number(r.amount) || Number(prev?.amount) || 0,
                rate: Number(r.rate) || Number(prev?.rate) || 0,
                tenure: Number(r.tenure) || Number(prev?.tenure) || 0,
                start_date: r.startDate ? new Date(r.startDate).toLocaleDateString('en-GB') : (r.start_date || prev?.start_date || ''),
                emi_amount: Number(r.monthlyEmi || r.emi_amount) || Number(prev?.emi_amount) || 0,
                paid_emis: Number(r.paidEmis ?? r.paid_emis ?? prev?.paid_emis ?? 0),
                status: r.status === 'closed' || (r.tenure > 0 && (r.paidEmis ?? r.paid_emis) >= r.tenure) ? 'closed' : 'active',
                created_at: r.createdAt || prev?.created_at,
            }));
        }
    }, [apiDetailRes, loanId]);

    const loadLoanDetails = useCallback(() => {
        if (!loanId) return;
        try {
            const rows = query('SELECT * FROM emi_loans WHERE id = ?', [loanId]) || [];
            if (rows.length > 0) {
                setLoan((prev: any) => ({ ...prev, ...rows[0] }));
            }
        } catch (error) {
            console.error('[EmiLoanDetailScreen] Failed to load loan:', error);
        }
    }, [loanId]);

    useEffect(() => {
        loadLoanDetails();
    }, [loadLoanDetails]);

    const currentPaidEmis = Number(loan?.paid_emis ?? loan?.paidEmis ?? 0);

    const stats = useMemo(() => {
        if (!loan) return null;
        return computeLoanStats(
            Number(loan.amount) || 0,
            Number(loan.rate) || 0,
            Number(loan.tenure) || 0,
            loan.start_date || (loan.startDate ? new Date(loan.startDate).toLocaleDateString('en-GB') : ''),
            currentPaidEmis
        );
    }, [loan, currentPaidEmis]);

    if (!loan || !stats) {
        return (
            <CommonBg>
                <InsightHeader title="Loan Details" subtitle="Loading..." />
            </CommonBg>
        );
    }

    const progressPct = Math.round(stats.progressRatio * 100);
    const isFullyPaid = currentPaidEmis >= loan.tenure;

    // Action: Mark next EMI paid
    const handleMarkEmiPaid = async () => {
        if (isFullyPaid) {
            ShowToast('This loan is already fully paid!', 'info');
            return;
        }

        const nextEmiNum = currentPaidEmis + 1;
        const emiDetail = stats.schedule[nextEmiNum - 1];
        const newPaidEmis = nextEmiNum;
        const newStatus = newPaidEmis >= loan.tenure ? 'closed' : 'active';

        // Optimistic UI update
        setLoan((prev: any) => ({
            ...prev,
            paid_emis: newPaidEmis,
            paidEmis: newPaidEmis,
            status: newStatus,
        }));

        const res: any = await markEmiPaidApi({ id: String(loan.id) });
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || `EMI #${nextEmiNum} marked as paid! 🎉`, 'success');

            try {
                update('emi_loans', loan.id, {
                    paid_emis: newPaidEmis,
                    status: newStatus,
                });
            } catch (err) { }

            try {
                insert('emi_payments', {
                    loan_id: loan.id,
                    emi_number: nextEmiNum,
                    amount: stats.monthlyEmi,
                    principal_component: emiDetail?.principal ?? 0,
                    interest_component: emiDetail?.interest ?? 0,
                    date: new Date().toLocaleDateString('en-GB'),
                    created_at: new Date().toISOString(),
                });
            } catch (err) { }

            loadLoanDetails();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to update EMI status', 'error');
            return;
        }
    };

    // Action: Undo last EMI
    const handleUndoLast = async () => {
        if (!loan || currentPaidEmis <= 0) {
            ShowToast('No paid EMIs to undo', 'info');
            return;
        }

        const newPaidEmis = currentPaidEmis - 1;

        const res: any = await undoLastEmiApi({ id: String(loan.id) });
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || `Reverted payment for EMI #${currentPaidEmis}`, 'info');

            setLoan((prev: any) => ({
                ...prev,
                paid_emis: newPaidEmis,
                paidEmis: newPaidEmis,
                status: 'active',
            }));

            try {
                update('emi_loans', loan.id, {
                    paid_emis: newPaidEmis,
                    status: 'active',
                });
            } catch (err) { }

            loadLoanDetails();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to revert EMI', 'error');
            return;
        }
    };

    // Action: Foreclose loan
    const handleConfirmForeclose = async () => {
        if (!loan) return;

        const res: any = await forecloseLoanApi({ id: String(loan.id) });
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || 'Loan foreclosed successfully! 🎉', 'success');

            setLoan((prev: any) => ({
                ...prev,
                paid_emis: loan.tenure,
                paidEmis: loan.tenure,
                status: 'closed',
            }));

            try {
                update('emi_loans', loan.id, {
                    paid_emis: loan.tenure,
                    status: 'closed',
                });
            } catch (err) { }

            setShowForecloseModal(false);
            loadLoanDetails();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to foreclose loan', 'error');
            return;
        }
    };

    // Action: Delete loan
    const handleConfirmDelete = async () => {
        if (!loan) return;

        const res: any = await deleteEmiLoanApi(String(loan.id));
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || 'Loan removed successfully', 'info');

            try {
                remove('emi_loans', loan.id);
            } catch (err) { }

            setShowDeleteModal(false);
            goBack();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to delete loan', 'error');
            return;
        }
    };

    return (
        <CommonBg>
            <InsightHeader
                title="Loan Details"
                subtitle="Track progress"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Top Black Card matching Image 3 */}
                <View style={styles.topCard}>
                    <CustomText style={styles.lenderLabel}>{loan.lender}</CustomText>
                    <CustomText style={styles.loanTitle}>{loan.title || loan.name}</CustomText>

                    <View style={styles.topCardRow}>
                        {/* Circular Donut Ring on Left */}
                        <View style={styles.donutContainer}>
                            <CircularProgress
                                size={resWidth(25)}
                                strokeWidth={resWidth(3.5)}
                                progress={stats.progressRatio}
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        {/* EMI & Totals on Right */}
                        <View style={styles.topCardRight}>
                            <CustomText style={styles.monthlyEmiLabel}>Monthly EMI</CustomText>
                            <CustomText style={styles.monthlyEmiValue}>
                                {formatINR(stats.monthlyEmi)}
                            </CustomText>
                            <CustomText style={styles.totalPayableText}>
                                Total payable {formatINR(stats.totalPayable)}
                            </CustomText>
                            <CustomText style={styles.interestText}>
                                Interest {formatINR(stats.totalInterest)}
                            </CustomText>
                        </View>
                    </View>
                </View>

                {/* Middle Card: Repayment Progress */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeaderRow}>
                        <CustomText style={styles.progressHeaderLabel}>
                            REPAYMENT PROGRESS
                        </CustomText>
                        <CustomText style={styles.progressRatioText}>
                            {currentPaidEmis}/{loan.tenure}
                        </CustomText>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progressPct}%` },
                            ]}
                        />
                    </View>

                    {/* 2x2 Stats Grid */}
                    <View style={styles.statsGrid}>
                        {/* Box 1: Paid so far */}
                        <View style={styles.statBox}>
                            <CustomText style={styles.statBoxLabel}>PAID SO FAR</CustomText>
                            <CustomText style={styles.statBoxValue}>
                                {formatINR(stats.paidSoFar)}
                            </CustomText>
                        </View>

                        {/* Box 2: Outstanding */}
                        <View style={styles.statBox}>
                            <CustomText style={styles.statBoxLabel}>OUTSTANDING</CustomText>
                            <CustomText style={styles.statBoxValue}>
                                {formatINR(stats.outstanding)}
                            </CustomText>
                        </View>

                        {/* Box 3: Remaining EMIs */}
                        <View style={styles.statBox}>
                            <CustomText style={styles.statBoxLabel}>REMAINING EMIS</CustomText>
                            <CustomText style={styles.statBoxValue}>
                                {stats.remainingEmis}
                            </CustomText>
                        </View>

                        {/* Box 4: Next Due */}
                        <View style={styles.statBox}>
                            <CustomText style={styles.statBoxLabel}>NEXT DUE</CustomText>
                            <CustomText style={styles.statBoxValue} numberOfLines={1}>
                                {stats.nextDueDate}
                            </CustomText>
                        </View>
                    </View>

                    {/* Action Buttons: [✓ Mark EMI paid] [Undo last] [Foreclose] */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleMarkEmiPaid}
                            style={styles.markPaidBtn}
                        >
                            <CheckIcon />
                            <CustomText style={styles.markPaidBtnText}>
                                {isFullyPaid ? 'Paid in full' : 'Mark EMI paid'}
                            </CustomText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleUndoLast}
                            style={styles.actionCapsuleBtn}
                        >
                            <CustomText style={styles.actionCapsuleBtnText}>Undo last</CustomText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setShowForecloseModal(true)}
                            style={styles.actionCapsuleBtn}
                        >
                            <CustomText style={styles.actionCapsuleBtnText}>Foreclose</CustomText>
                        </TouchableOpacity>
                    </View>

                    {/* Remove Loan Button */}
                    <View style={styles.removeRow}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setShowDeleteModal(true)}
                            style={styles.removeBtn}
                        >
                            <TrashIcon />
                            <CustomText style={styles.removeBtnText}>Remove</CustomText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Card: Amortisation Schedule */}
                <AmortisationScheduleCard schedule={stats.schedule} />
            </ScrollView>

            {/* Foreclose Confirmation Modal */}
            <DeleteConfirmationModal
                show={showForecloseModal}
                setShow={setShowForecloseModal}
                title="Foreclose Loan"
                description={`Are you sure you want to foreclose "${loan.title || loan.name}"? This will mark all remaining EMIs as paid and close the loan.`}
                confirmText="Foreclose"
                onConfirm={handleConfirmForeclose}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                setShow={setShowDeleteModal}
                title="Remove Loan"
                description={`Are you sure you want to remove "${loan.title || loan.name}"? All payment records will be permanently deleted.`}
                confirmText="Remove"
                onConfirm={handleConfirmDelete}
            />
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: resAvarage(3),
        paddingBottom: resAvarage(12),
    },
    topCard: {
        backgroundColor: '#0D0D0D',
        borderRadius: resAvarage(5),
        paddingHorizontal: resWidth(5),
        paddingVertical: resAvarage(3),
        marginBottom: resAvarage(2),
    },
    lenderLabel: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    loanTitle: {
        fontSize: font24,
        fontFamily: FontBold,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    topCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    donutContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: resWidth(4),
    },
    topCardRight: {
        flex: 1,
        justifyContent: 'center',
    },
    monthlyEmiLabel: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
    },
    monthlyEmiValue: {
        fontSize: font24,
        fontFamily: FontBold,
        color: '#FFFFFF',
        marginVertical: 2,
    },
    totalPayableText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#8E8E93',
        marginTop: 2,
    },
    interestText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#8E8E93',
        marginTop: 2,
    },
    progressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(4.5),
        borderWidth: 1,
        borderColor: '#ECECEC',
        padding: resWidth(4.5),
        marginBottom: resAvarage(2),
    },
    progressHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressHeaderLabel: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    progressRatioText: {
        fontSize: font13,
        fontFamily: FontSemiBold,
        color: '#141414',
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#EBEBEB',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressFill: {
        height: 6,
        backgroundColor: '#141414',
        borderRadius: 3,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 18,
    },
    statBox: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    statBoxLabel: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statBoxValue: {
        fontSize: font16,
        fontFamily: FontBold,
        color: '#141414',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    markPaidBtn: {
        flex: 1.3,
        height: 40,
        backgroundColor: '#0D0D0D',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 10,
    },
    markPaidBtnText: {
        fontSize: font12,
        fontFamily: FontSemiBold,
        color: '#FFFFFF',
    },
    actionCapsuleBtn: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6,
    },
    actionCapsuleBtnText: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: '#141414',
    },
    removeRow: {
        alignItems: 'flex-end',
        marginTop: 4,
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ECECEC',
        backgroundColor: '#FFFFFF',
    },
    removeBtnText: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: '#DC2626',
    },
});

