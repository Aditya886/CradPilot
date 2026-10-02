import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import { resAvarage, resWidth } from '../../../utils/responsive'
import DetailCard from './components/DetailCard'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../utils/fontFamily'
import { font12, font13, font14, font16, font18, font24, font20, font15 } from '../../../utils/fontSizes'
import { formatINR } from '../../../utils/FormatUtil'
import Check from "../../../assets/images/icons/check.svg"
import Cross from "../../../assets/images/icons/close.svg"
import Dot from "../../../assets/images/icons/dot.svg"
import Delete from "../../../assets/images/icons/delete.svg"
import BackIcon from "../../../assets/images/icons/back.svg"
import NextIcon from "../../../assets/images/icons/next.svg"
import AddLoanPaymentModal from '../../../ui/modals/AddLoanPaymentModal'
import DeleteLoanHistoryModal from '../../../ui/modals/DeleteLoanHistoryModal'
import DeleteConfirmationModal from '../../../ui/modals/DeleteConfirmationModal'
import { query, getOne, insert, update, remove, getWhere } from '../../../storage/local/sqlite'
import { goBack } from '../../../navigation/NavigationUtils'
import AddAmountModal from '../../../ui/modals/AddAmountModal'
import { calculateExpectedInterest } from '../../../utils/FormatUtil'
import { syncNotifications } from '../../../services/localNotificationService'

export default function LoanDetails({ route }: any) {
    const { item: initialItem, name } = route?.params;
    
    // React state to make screen reactive
    const [selectedYearIndex, setSelectedYearIndex] = React.useState(0);
    const [loan, setLoan] = React.useState<any>(null);
    const [historyList, setHistoryList] = React.useState<any[]>([]);
    const [outstandingAmount, setOutstandingAmount] = React.useState(0);
    const [currentInstallment, setCurrentInstallment] = React.useState(0);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [showDeleteLoanModal, setShowDeleteLoanModal] = React.useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = React.useState(false);
    const [selectedPaymentIndex, setSelectedPaymentIndex] = React.useState<number | null>(null);
    const [showAddAmountModal, setShowAddAmountModal] = React.useState(false);

    const borrower = React.useMemo(() => {
        if (!loan) return null;
        return getOne('borrowers', loan.borrower_id);
    }, [loan]);

    // Computed history statistics
    const totalReceived = React.useMemo(() => {
        return historyList.reduce((sum, p) => sum + p.amount, 0);
    }, [historyList]);

    const interestEarned = React.useMemo(() => {
        return historyList.reduce((sum, p) => sum + p.toInterest, 0);
    }, [historyList]);

    const lastPaymentDate = React.useMemo(() => {
        return historyList.length > 0 ? historyList[historyList.length - 1].date : 'N/A';
    }, [historyList]);

    const loadLoanData = () => {
        try {
            const l = getOne('loans', initialItem.id);
            if (!l) return;

            const payments = getWhere('payments', 'loan_id = ?', [l.id]) || [];
            
            // Map payments (historyList is ordered newest first in the UI, but database can be any order. Let's sort descending by id)
            const sortedPayments = [...payments].sort((a: any, b: any) => b.id - a.id);
            const mappedPayments = sortedPayments.map((p: any) => ({
                id: p.id,
                amount: p.amount,
                date: p.date,
                mode: p.mode,
                toPrincipal: p.to_principal,
                toInterest: p.to_interest,
                balanceAfter: p.balance_after
            }));
            
            setHistoryList(mappedPayments);

            const totalPrincipalPaid = payments.reduce((sum: number, p: any) => sum + p.to_principal, 0);
            const outstanding = Math.max(0, l.amount - totalPrincipalPaid);

            setOutstandingAmount(outstanding);
            setCurrentInstallment(payments.length);

            // Calculate computed fields for camelCase mapping
            const latestHistory = mappedPayments.length > 0 ? mappedPayments[0].date : 'N/A';
            const sumReceived = payments.reduce((sum, p) => sum + p.amount, 0);
            const sumInterest = payments.reduce((sum, p) => sum + p.to_interest, 0);

            setLoan({
                id: l.id,
                borrower_id: l.borrower_id,
                loanId: l.id,
                title: l.title,
                amount: l.amount,
                description: l.description,
                loanDate: l.loan_date,
                dueDate: l.due_date,
                intrest: l.rate,
                intrestType: l.rate_period,
                repaymentType: l.interest_type,
                appliedOn: l.interest_applied,
                repaymentMode: l.repayment_method,
                totalInstallments: l.term || 12,
                status: l.status,
                installmentAmount: Math.round(l.amount / (l.term || 12)),
                interestEarned: sumInterest,
                totalReceived: sumReceived,
                lastPaymentDate: latestHistory
            });

        } catch (error) {
            console.error('Failed to load loan data from database:', error);
        }
    };

    React.useEffect(() => {
        loadLoanData();
    }, []);

    // Calculated fields based on outstanding amount state
    const remainingPrincipal = outstandingAmount;
    
    const expectedInterest = React.useMemo(() => {
        if (!loan) return 0;
        return calculateExpectedInterest(
            loan.amount,
            loan.intrest,
            loan.intrestType,
            loan.repaymentType,
            loan.compoundFreq,
            loan.repaymentMode,
            loan.totalInstallments
        );
    }, [loan]);

    const totalInterestPaid = React.useMemo(() => {
        return historyList.reduce((sum, p) => sum + p.toInterest, 0);
    }, [historyList]);

    const outstandingInterest = Math.max(0, expectedInterest - totalInterestPaid);
    const totalOutstanding = remainingPrincipal + outstandingInterest;

    // Loan Progress Calculation
    const totalInstallments = loan?.totalInstallments ?? 12;
    const percentage = totalInstallments > 0 ? Math.round((currentInstallment / totalInstallments) * 100) : 0;
    const remaining = totalInstallments - currentInstallment;

    // Progress bar color based on status
    const getProgressBarColor = () => {
        if (outstandingAmount <= 0) {
            return colors.textGreen;
        }
        const s = loan?.status?.toLowerCase();
        if (s === 'overdue') {
            return colors.textRed;
        }
        if (s === 'good' || s === 'completed' || s === 'complete') {
            return colors.textGreen;
        }
        if (s === 'active') {
            return colors.theme;
        }
        return colors.theme;
    };
    const progressBarColor = getProgressBarColor();

    // Payment Overdue Calculation
    const amountDue = Math.min(outstandingAmount, loan?.installmentAmount || outstandingAmount);
    const dueDate = loan?.dueDate || 'N/A';

    const calculateDaysLate = (dueDateStr: string) => {
        if (!dueDateStr || dueDateStr === 'N/A') return 0;
        const parts = dueDateStr.split('/');
        if (parts.length !== 3) return 0;
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const due = new Date(year, month, day);
        const today = new Date();
        due.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - due.getTime();
        if (diffTime <= 0) return 0;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLate = loan?.status?.toLowerCase() === 'overdue' ? calculateDaysLate(dueDate) : 0;

    // Alias item to loan so that the JSX code doesn't need modification
    const item = loan;

    // Dynamic layout/color configurations based on status
    const getPaymentCardConfig = () => {
        if (outstandingAmount <= 0) {
            return {
                title: 'LOAN COMPLETED',
                badgeText: 'Completed',
                badgeTextColor: colors.textGreen,
                badgeBgColor: 'rgba(20, 151, 74, 0.15)',
                cardBgColor: 'rgba(20, 151, 74, 0.05)',
                cardBorderColor: 'rgba(20, 151, 74, 0.08)',
                showDaysLate: false
            };
        }
        const s = loan?.status?.toLowerCase();
        if (s === 'overdue') {
            return {
                title: 'PAYMENT OVERDUE',
                badgeText: 'Attention',
                badgeTextColor: colors.textRed,
                badgeBgColor: 'rgba(207, 70, 48, 0.15)',
                cardBgColor: 'rgba(207, 70, 48, 0.06)',
                cardBorderColor: 'rgba(207, 70, 48, 0.08)',
                showDaysLate: true
            };
        }
        if (s === 'good' || s === 'completed' || s === 'complete') {
            return {
                title: 'PAYMENT DUE',
                badgeText: 'On Track',
                badgeTextColor: colors.textGreen,
                badgeBgColor: 'rgba(20, 151, 74, 0.15)',
                cardBgColor: 'rgba(20, 151, 74, 0.05)',
                cardBorderColor: 'rgba(20, 151, 74, 0.08)',
                showDaysLate: false
            };
        }
        // Active
        return {
            title: 'PAYMENT DUE',
            badgeText: 'Active',
            badgeTextColor: colors.textTheme,
            badgeBgColor: colors.theme,
            cardBgColor: 'rgba(205, 250, 39, 0.06)',
            cardBorderColor: 'rgba(205, 250, 39, 0.08)',
            showDaysLate: false
        };
    };
    const cardConfig = getPaymentCardConfig();

    // Style helper for each month item in the grid
    const getMonthItemStyle = (status: string) => {
        switch (status) {
            case 'on time':
                return {
                    backgroundColor: 'rgba(20, 151, 74, 0.05)',
                    borderColor: '#14974A',
                    textColor: '#14974A',
                    valColor: '#14974A',
                };
            case 'late':
                return {
                    backgroundColor: 'rgba(255, 159, 67, 0.05)',
                    borderColor: '#FF9F43',
                    textColor: '#FF9F43',
                    valColor: '#FF9F43',
                };
            case 'missed':
                return {
                    backgroundColor: 'rgba(207, 70, 48, 0.05)',
                    borderColor: '#CF4630',
                    textColor: '#CF4630',
                    valColor: '#CF4630',
                };
            case 'upcoming':
            default:
                return {
                    backgroundColor: 'rgba(20, 20, 20, 0.02)',
                    borderColor: 'rgba(20, 20, 20, 0.08)',
                    textColor: 'rgba(20, 20, 20, 0.35)',
                    valColor: 'rgba(20, 20, 20, 0.35)',
                };
        }
    };

    // Generate monthly payments mock data dynamically based on the loan state
    const monthsData = React.useMemo(() => {
        const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Default start month is Dec (index 11) and start year is 2025 if not parseable
        let startMonthIdx = 11;
        let startYear = 2025;
        if (loan?.loanDate) {
            const parts = loan.loanDate.split('/');
            if (parts.length === 3) {
                const monthParsed = parseInt(parts[1], 10);
                const yearParsed = parseInt(parts[2], 10);
                if (!isNaN(monthParsed) && monthParsed >= 1 && monthParsed <= 12) {
                    startMonthIdx = monthParsed - 1;
                }
                if (!isNaN(yearParsed)) {
                    startYear = yearParsed;
                }
            }
        }

        const list = [];
        const isOverdue = loan?.status?.toLowerCase() === 'overdue';

        for (let i = 0; i < totalInstallments; i++) {
            const totalMonthsFromStart = startMonthIdx + i;
            const mIdx = totalMonthsFromStart % 12;
            const name = monthsList[mIdx];
            const yearOfThisMonth = startYear + Math.floor(totalMonthsFromStart / 12);

            let status = 'upcoming';
            let label = Dot;

            if (i < currentInstallment) {
                status = 'on time';
                label = Check;
            } else if (i === currentInstallment) {
                if (isOverdue) {
                    status = 'missed';
                    label = Cross;
                } else {
                    status = 'upcoming';
                    label = Dot;
                }
            } else {
                status = 'upcoming';
                label = Dot;
            }

            list.push({ name, status, label, year: yearOfThisMonth });
        }
        return list;
    }, [loan, currentInstallment, totalInstallments]);

    // Unique years present in the monthly installment grid
    const uniqueYears = React.useMemo(() => {
        const yearsSet = new Set<number>();
        monthsData.forEach(m => yearsSet.add(m.year));
        return Array.from(yearsSet).sort((a, b) => a - b);
    }, [monthsData]);

    // Current year selected for the monthly grid view
    const currentYear = uniqueYears[selectedYearIndex] || 2026;

    // Filter months to only display the ones matching the selected year page
    const monthsForCurrentYear = React.useMemo(() => {
        return monthsData.filter(m => m.year === currentYear);
    }, [monthsData, currentYear]);

    // Reset page view index when uniqueYears list changes
    React.useEffect(() => {
        setSelectedYearIndex(0);
    }, [uniqueYears]);

    // Handler to record a payment
    const handleRecordPayment = (data: {
        amount: number;
        date: string;
        method: string;
        allocation: string;
        notes: string;
    }) => {
        let interestAllocated = 0;
        let principalAllocated = 0;

        if (data.allocation === 'Interest') {
            interestAllocated = data.amount;
            principalAllocated = 0;
        } else if (data.allocation === 'Principal') {
            interestAllocated = 0;
            principalAllocated = data.amount;
        } else {
            interestAllocated = Math.round(Math.min(data.amount, outstandingInterest));
            principalAllocated = data.amount - interestAllocated;
        }

        const newOutstanding = Math.max(0, outstandingAmount - principalAllocated);

        try {
            insert('payments', {
                loan_id: loan.id,
                amount: data.amount,
                date: data.date,
                mode: data.method.toLowerCase(),
                to_principal: principalAllocated,
                to_interest: interestAllocated,
                balance_after: Math.round(newOutstanding),
                notes: data.notes || ''
            });

            // Update loan status if principal becomes 0
            if (newOutstanding <= 0) {
                update('loans', loan.id, { status: 'Completed' });
            }

            loadLoanData();
            syncNotifications();
        } catch (error) {
            console.error('Failed to record payment in database:', error);
        }
    };

    const handleAddAmount = (data: {
        amount: number;
        date: string;
        method: string;
        notes: string;
    }) => {
        const newOutstanding = outstandingAmount + data.amount;
        try {
            insert('payments', {
                loan_id: loan.id,
                amount: -data.amount,
                date: data.date,
                mode: data.method.toLowerCase(),
                to_principal: -data.amount,
                to_interest: 0,
                balance_after: Math.round(newOutstanding),
                notes: data.notes || 'Principal Top-up'
            });

            if (newOutstanding > 0 && loan.status === 'Completed') {
                update('loans', loan.id, { status: 'Active' });
            }

            loadLoanData();
            syncNotifications();
        } catch (error) {
            console.error('Failed to add amount in database:', error);
        }
    };

    // Handler to delete a payment history record
    const handleDeletePayment = () => {
        if (selectedPaymentIndex === null) return;
        const paymentToDelete = historyList[selectedPaymentIndex];
        
        try {
            remove('payments', paymentToDelete.id);

            // Recheck outstanding principal
            const remainingPayments = getWhere('payments', 'loan_id = ?', [loan.id]) || [];
            const totalPrincipalPaid = remainingPayments.reduce((sum: number, p: any) => sum + p.to_principal, 0);
            const remainingOutstanding = Math.max(0, loan.amount - totalPrincipalPaid);

            if (remainingOutstanding > 0 && loan.status === 'Completed') {
                update('loans', loan.id, { status: 'Active' });
            } else if (remainingOutstanding <= 0 && loan.status !== 'Completed') {
                update('loans', loan.id, { status: 'Completed' });
            }

            loadLoanData();
            syncNotifications();
            setSelectedPaymentIndex(null);
        } catch (error) {
            console.error('Failed to delete payment from database:', error);
        }
    };

    const handleDeleteLoan = () => {
        try {
            query('DELETE FROM payments WHERE loan_id = ?', [initialItem.id]);
            query('DELETE FROM loans WHERE id = ?', [initialItem.id]);
            syncNotifications();
            goBack();
        } catch (e) {
            console.error("Error deleting loan:", e);
        }
    };

    const handleDeleteUser = () => {
        try {
            if (borrower?.id) {
                const borrowerLoans = query('SELECT id FROM loans WHERE borrower_id = ?', [borrower.id]);
                const loanIds = borrowerLoans.map((l: any) => l.id);
                if (loanIds.length > 0) {
                    const placeholders = loanIds.map(() => '?').join(',');
                    query(`DELETE FROM payments WHERE loan_id IN (${placeholders})`, loanIds);
                    query('DELETE FROM loans WHERE borrower_id = ?', [borrower.id]);
                }
                query('DELETE FROM borrowers WHERE id = ?', [borrower.id]);
            }
            syncNotifications();
            goBack();
        } catch (e) {
            console.error("Error deleting borrower:", e);
        }
    };

    return (
        <CommonBg>
            <InsightHeader title={"User"} subtitle={name} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: resAvarage(8) }}
            >
                {/* Top outstanding details card */}
                 <DetailCard 
                    item={{ 
                        ...item, 
                        outStand: totalOutstanding,
                        remainingPrincipal: remainingPrincipal,
                        outstandingInterest: outstandingInterest
                    }} 
                    borrowerName={borrower?.name} 
                    borrowerPhone={borrower?.phone}
                    onDeleteLoan={() => setShowDeleteLoanModal(true)}
                    onDeleteUser={() => setShowDeleteUserModal(true)}
                    onAddAmount={() => setShowAddAmountModal(true)}
                />

                {/* Loan Progress Card */}
                <View style={styles.progressCard}>
                    <View style={styles.row}>
                        <CustomText style={styles.progressLabel}>LOAN PROGRESS</CustomText>
                        <CustomText style={styles.progressPercentage}>{`${percentage}%`}</CustomText>
                    </View>
                    <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: progressBarColor }]} />
                    </View>
                    <CustomText style={styles.progressSummary}>
                        {`${currentInstallment} of ${totalInstallments} installments paid · ${remaining} remaining`}
                    </CustomText>
                </View>

                {/* Payment Overdue Card */}
                <View style={[styles.overdueCard, { backgroundColor: cardConfig.cardBgColor }]}>
                    <View style={styles.row}>
                        <CustomText style={styles.overdueTitle}>{cardConfig.title}</CustomText>
                        <View style={[styles.attentionBadge, { backgroundColor: cardConfig.badgeBgColor }]}>
                            <CustomText style={[styles.attentionText, { color: cardConfig.badgeTextColor }]}>{cardConfig.badgeText}</CustomText>
                        </View>
                    </View>

                    <View style={[styles.row, { marginTop: resAvarage(2.5), alignItems: 'flex-start' }]}>
                        <View style={{ gap: resAvarage(0.5) }}>
                            <CustomText style={styles.infoLabel}>Amount due</CustomText>
                            <CustomText style={styles.amountDueValue}>{formatINR(amountDue)}</CustomText>
                        </View>
                        {dueDate && dueDate !== 'N/A' && (
                            <View style={{ gap: resAvarage(0.5) }}>
                                <CustomText style={styles.infoLabel}>Due date</CustomText>
                                <CustomText style={styles.dueDateValue}>{dueDate}</CustomText>
                                {cardConfig.showDaysLate && (
                                    <CustomText style={styles.daysLateText}>{`${daysLate} days late`}</CustomText>
                                )}
                            </View>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={styles.recordButton} 
                        activeOpacity={0.8}
                        onPress={() => setShowAddModal(true)}
                    >
                        <CustomText style={styles.plusIcon}>+</CustomText>
                        <CustomText style={styles.recordButtonText}>Record payment</CustomText>
                    </TouchableOpacity>
                </View>

                {/* Monthly Payments Card */}
                <View style={styles.monthsCard}>
                    <View style={styles.monthsCardHeader}>
                        <CustomText style={styles.cardTitle}>MONTHLY PAYMENTS</CustomText>
                        {uniqueYears.length > 1 ? (
                            <View style={styles.yearNavigation}>
                                <TouchableOpacity 
                                    disabled={selectedYearIndex === 0} 
                                    onPress={() => setSelectedYearIndex(prev => prev - 1)}
                                    style={[styles.navButton, selectedYearIndex === 0 && styles.navButtonDisabled]}
                                    activeOpacity={0.7}
                                >
                                    <BackIcon width={resAvarage(2.5)} height={resAvarage(2.5)} stroke={selectedYearIndex === 0 ? colors.black30 : colors.black} />
                                </TouchableOpacity>
                                <CustomText style={styles.yearText}>{currentYear}</CustomText>
                                <TouchableOpacity 
                                    disabled={selectedYearIndex === uniqueYears.length - 1} 
                                    onPress={() => setSelectedYearIndex(prev => prev + 1)}
                                    style={[styles.navButton, selectedYearIndex === uniqueYears.length - 1 && styles.navButtonDisabled]}
                                    activeOpacity={0.7}
                                >
                                    <NextIcon width={resAvarage(2.5)} height={resAvarage(2.5)} stroke={selectedYearIndex === uniqueYears.length - 1 ? colors.black30 : colors.black} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <CustomText style={styles.yearTextHeader}>{currentYear}</CustomText>
                        )}
                    </View>

                    <View style={styles.gridContainer}>
                        {monthsForCurrentYear?.map((m, idx) => {
                            const config = getMonthItemStyle(m.status);
                            return (
                                <View key={idx} style={[styles.gridItem, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
                                    <CustomText style={[styles.monthName, { color: config.textColor }]}>{m.name}</CustomText>
                                    {<m.label width={resAvarage(3)} height={resAvarage(3)} />}
                                </View>
                            );
                        })}
                    </View>

                    {/* Legend */}
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#14974A' }]} />
                            <CustomText style={styles.legendText}>On time</CustomText>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#CF4630' }]} />
                            <CustomText style={styles.legendText}>Missed</CustomText>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: 'rgba(20, 20, 20, 0.35)' }]} />
                            <CustomText style={styles.legendText}>Upcoming</CustomText>
                        </View>
                    </View>
                </View>

                {/* Loan Configuration Card */}
                {item && (
                    <View style={styles.configCard}>
                        <CustomText style={styles.configTitle}>LOAN CONFIGURATION</CustomText>

                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Loan ID</CustomText>
                            <CustomText style={styles.configValue}>{item.loanId ?? item.id}</CustomText>
                        </View>
                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Original principal</CustomText>
                            <CustomText style={styles.configValue}>{formatINR(item.amount ?? 0)}</CustomText>
                        </View>
                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Loan date</CustomText>
                            <CustomText style={styles.configValue}>{item.loanDate ?? 'N/A'}</CustomText>
                        </View>
                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Rate</CustomText>
                            <CustomText style={styles.configValue}>{`${item.intrest ?? 0}% ${item.intrestType ?? ""}`}</CustomText>
                        </View>
                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Type</CustomText>
                            <CustomText style={styles.configValue}>{item.repaymentType ?? 'N/A'}</CustomText>
                        </View>
                        {item.repaymentType === 'Reducing' && (
                            <>
                                <View style={styles.configRow}>
                                    <CustomText style={styles.configKey}>Applied on</CustomText>
                                    <CustomText style={styles.configValue}>{item.appliedOn ?? 'N/A'}</CustomText>
                                </View>
                                <View style={styles.configRow}>
                                    <CustomText style={styles.configKey}>Repayment</CustomText>
                                    <CustomText style={styles.configValue}>{item.repaymentMode ?? 'N/A'}</CustomText>
                                </View>
                            </>
                        )}
                        {item.repaymentType === 'Reducing' && item.repaymentMode === 'Installments' && (
                            <>
                                <View style={styles.configRow}>
                                    <CustomText style={styles.configKey}>Installment</CustomText>
                                    <CustomText style={styles.configValue}>{formatINR(item.installmentAmount ?? 0)}</CustomText>
                                </View>
                                <View style={styles.configRow}>
                                    <CustomText style={styles.configKey}>Term</CustomText>
                                    <CustomText style={styles.configValue}>{`${item.totalInstallments ?? 0} Months`}</CustomText>
                                </View>
                            </>
                        )}
                        {item.repaymentMode === 'Installments' && (
                            <View style={styles.configRow}>
                                <CustomText style={styles.configKey}>Due date</CustomText>
                                <CustomText style={styles.configValue}>{item.dueDate ?? 'N/A'}</CustomText>
                            </View>
                        )}
                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Last payment</CustomText>
                            <CustomText style={styles.configValue}>{item.lastPaymentDate ?? 'N/A'}</CustomText>
                        </View>
                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Interest earned</CustomText>
                            <CustomText style={styles.configValue}>{formatINR(item.interestEarned ?? 0)}</CustomText>
                        </View>
                        <View style={styles.configRow}>
                            <CustomText style={styles.configKey}>Total received</CustomText>
                            <CustomText style={styles.configValue}>{formatINR(item.totalReceived ?? 0)}</CustomText>
                        </View>
                    </View>
                )}

                {/* Payment History Section */}
                {historyList.length > 0 && (
                    <View style={styles.historySection}>
                        <CustomText style={styles.historySectionTitle}>PAYMENT HISTORY</CustomText>
                        {historyList.map((payment, idx) => {
                            const isAddition = payment.toPrincipal < 0;
                            return (
                                <View key={idx} style={styles.historyCard}>
                                    <View style={styles.historyHeader}>
                                        <View>
                                            <CustomText style={[styles.historyReceivedText, isAddition && { color: colors.textRed }]}>
                                                {isAddition 
                                                    ? `${formatINR(Math.abs(payment.amount))} added`
                                                    : `${formatINR(payment.amount)} received`
                                                }
                                            </CustomText>
                                            <CustomText style={styles.historyDateText}>
                                                {payment.date} · {payment.mode}
                                            </CustomText>
                                        </View>
                                        <TouchableOpacity 
                                            style={styles.deleteButton} 
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                setSelectedPaymentIndex(idx);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <Delete width={resAvarage(4.5)} height={resAvarage(4.5)} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.historyBreakdownRow}>
                                        <View style={styles.historyBreakdownCol}>
                                            <CustomText style={styles.historyBreakdownLabel}>
                                                {isAddition ? "Added to principal" : "To principal"}
                                            </CustomText>
                                            <CustomText style={styles.historyBreakdownValue}>
                                                {formatINR(Math.abs(payment.toPrincipal))}
                                            </CustomText>
                                        </View>
                                        <View style={styles.historyBreakdownCol}>
                                            <CustomText style={styles.historyBreakdownLabel}>To interest</CustomText>
                                            <CustomText style={styles.historyBreakdownValue}>
                                                {formatINR(payment.toInterest)}
                                            </CustomText>
                                        </View>
                                        <View style={styles.historyBreakdownCol}>
                                            <CustomText style={styles.historyBreakdownLabel}>Balance after</CustomText>
                                            <CustomText style={styles.historyBreakdownValue}>
                                                {formatINR(payment.balanceAfter)}
                                            </CustomText>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Record Payment Modal */}
            <AddLoanPaymentModal
                show={showAddModal}
                setShow={setShowAddModal}
                outstandingInterest={outstandingInterest}
                remainingPrincipal={remainingPrincipal}
                defaultAmount={amountDue}
                onRecordPayment={handleRecordPayment}
            />

            {/* Add Amount Modal */}
            <AddAmountModal
                show={showAddAmountModal}
                setShow={setShowAddAmountModal}
                outstandingAmount={outstandingAmount}
                onAddAmount={handleAddAmount}
            />

            {/* Delete Payment Modal */}
            <DeleteLoanHistoryModal
                show={showDeleteModal}
                setShow={setShowDeleteModal}
                onDelete={handleDeletePayment}
            />

            <DeleteConfirmationModal
                show={showDeleteLoanModal}
                setShow={setShowDeleteLoanModal}
                onConfirm={handleDeleteLoan}
                title="Delete Loan?"
                description={`Are you sure you want to delete "${loan?.title || 'this loan'}"? This action will permanently remove all associated payment records and cannot be undone.`}
            />

            <DeleteConfirmationModal
                show={showDeleteUserModal}
                setShow={setShowDeleteUserModal}
                onConfirm={handleDeleteUser}
                title="Delete Borrower?"
                description={`Are you sure you want to delete ${borrower?.name || 'this borrower'}? This action will permanently delete this borrower, all of their loans, and all payment history. It cannot be undone.`}
            />
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    progressCard: {
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(3),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        shadowColor: colors.black,
        shadowOffset: {
            height: resAvarage(0.5),
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: resAvarage(1),
        elevation: 1,
        gap: resAvarage(2)
    },
    progressLabel: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black60,
        letterSpacing: resAvarage(0.1),
        textTransform: 'uppercase'
    },
    progressPercentage: {
        fontSize: font16,
        fontFamily: FontBold,
        color: colors.black
    },
    progressBarTrack: {
        height: resAvarage(1.2),
        width: '100%',
        backgroundColor: 'rgba(20, 20, 20, 0.06)',
        borderRadius: resAvarage(100),
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.black,
        borderRadius: resAvarage(100)
    },
    progressSummary: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: resAvarage(0.5)
    },
    overdueCard: {
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(3),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: colors.black30
    },
    overdueTitle: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black90,
        letterSpacing: resAvarage(0.1),
        textTransform: 'uppercase'
    },
    attentionBadge: {
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(0.4),
        paddingHorizontal: resAvarage(2),
        alignItems: 'center',
        justifyContent: 'center'
    },
    attentionText: {
        fontSize: font12,
        fontFamily: FontSemiBold,
    },
    infoLabel: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black80
    },
    amountDueValue: {
        fontSize: font24,
        fontFamily: FontBold,
        color: colors.black,
        marginTop: resAvarage(0.5)
    },
    dueDateValue: {
        fontSize: font18,
        fontFamily: FontBold,
        color: colors.black,
        marginTop: resAvarage(0.5)
    },
    daysLateText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.textRed,
        marginTop: resAvarage(0.3)
    },
    recordButton: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3),
        marginTop: resAvarage(4.5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: resWidth(1)
    },
    plusIcon: {
        color: colors.white,
        fontSize: font20,
        fontFamily: FontMedium,
        lineHeight: font20,
    },
    recordButtonText: {
        color: colors.white,
        fontSize: font16,
        fontFamily: FontSemiBold
    },
    monthsCard: {
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(3),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
    },
    cardTitle: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black80,
        letterSpacing: resAvarage(0.1),
        textTransform: 'uppercase',
    },
    monthsCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(3.5),
    },
    yearNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resWidth(2),
    },
    yearText: {
        fontSize: font14,
        fontFamily: FontBold,
        color: colors.black,
        minWidth: resWidth(12),
        textAlign: 'center',
    },
    yearTextHeader: {
        fontSize: font14,
        fontFamily: FontBold,
        color: colors.black,
    },
    navButton: {
        padding: resAvarage(1),
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: resAvarage(2),
    },
    gridItem: {
        width: '22.5%',
        paddingVertical: resAvarage(1),
        aspectRatio: 1,
        borderRadius: resAvarage(3),
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: resAvarage(0.5)
    },
    monthName: {
        fontSize: font12,
        fontFamily: FontBold,
    },
    monthIndicator: {
        fontSize: font14,
        fontFamily: FontBold,
        marginTop: -resAvarage(0.2)
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: resAvarage(3.5),
        paddingHorizontal: resWidth(1)
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resWidth(1.5),
        marginVertical: resAvarage(0.5)
    },
    legendDot: {
        width: resAvarage(2),
        height: resAvarage(2),
        borderRadius: resAvarage(100),
    },
    legendText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black70
    },
    configCard: {
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(3),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        shadowColor: colors.black,
        shadowOffset: {
            height: resAvarage(0.5),
            width: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: resAvarage(1),
        elevation: 1,
        gap: resAvarage(1)
    },
    configTitle: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black60,
        letterSpacing: resAvarage(0.1),
        textTransform: 'uppercase',
        marginBottom: resAvarage(2)
    },
    configRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: resAvarage(1.2),
    },
    configKey: {
        fontSize: font14,
        fontFamily: FontRegular,
        color: colors.black60
    },
    configValue: {
        fontSize: font14,
        fontFamily: FontSemiBold,
        color: colors.black
    },
    historySection: {
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(4.5),
        marginBottom: resAvarage(5),
        gap: resAvarage(3),
    },
    historySectionTitle: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black80,
        letterSpacing: resAvarage(0.1),
        textTransform: 'uppercase',
    },
    historyCard: {
        backgroundColor: colors.bgWhite,
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        borderRadius: resAvarage(6),
        padding: resAvarage(4.5),
        gap: resAvarage(3.5),
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    historyReceivedText: {
        fontSize: font16,
        fontFamily: FontBold,
        color: colors.black,
    },
    historyDateText: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: resAvarage(0.5),
    },
    deleteButton: {
        padding: resAvarage(1),
    },
    historyBreakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyBreakdownCol: {
        flex: 1,
        gap: resAvarage(0.5),
    },
    historyBreakdownLabel: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
    },
    historyBreakdownValue: {
        fontSize: font15,
        fontFamily: FontSemiBold,
        color: colors.black,
    },
})