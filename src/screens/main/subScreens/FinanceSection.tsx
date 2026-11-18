import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, ScrollView, View, RefreshControl } from 'react-native';
import { CommonBg } from '../../../ui/common/CommonBg';
import InsightHeader from './components/InsightHeader';
import FinCard from './components/FinCard';
import FinSections from './components/FinSections';
import RecentPay from './components/RecentPay';
import RecentLoan from './components/ResentLoan';
import EmptyStateCard from '../../../ui/components/EmptyStateCard';
import FinanceIcon from '../../../assets/images/icons/finance.svg';
import CustomText from '../../../ui/components/CustomText';
import { colors } from '../../../utils/colors';
import { FontMedium } from '../../../utils/fontFamily';
import { font10 } from '../../../utils/fontSizes';
import { resWidth, resAvarage } from '../../../utils/responsive';
import { query } from '../../../storage/local/sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { navigate } from '../../../navigation/NavigationUtils';
import { calculateExpectedInterest } from '../../../utils/FormatUtil';
import { useGetFinanceDashboardQuery } from '../../../API';

export default function FinanceSection() {
    const [totals, setTotals] = useState({
        totalLent: 0,
        outstanding: 0,
        interestEarned: 0,
    });
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [upcomingLoans, setUpcomingLoans] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // RTK Query backend integration
    const { data: apiFinanceDashboard, refetch: refetchFinance } = useGetFinanceDashboardQuery(undefined);

    const loadFinanceData = useCallback(() => {
        try {
            const allLoans = query('SELECT * FROM loans') || [];
            const allPayments = query('SELECT * FROM payments') || [];
            const allBorrowers = query('SELECT * FROM borrowers') || [];

            // Calculations
            const totalLent = allLoans.reduce((sum: number, l: any) => sum + l.amount, 0);
            const interestEarned = allPayments.reduce((sum: number, p: any) => sum + p.to_interest, 0);

            const activeLoans = allLoans.filter((l: any) => l.status === 'Active' || l.status === 'OverDue');
            const outstanding = activeLoans.reduce((sum: number, l: any) => {
                const paymentsForLoan = allPayments.filter((p: any) => p.loan_id === l.id);
                const principalPaid = paymentsForLoan.reduce((s: number, p: any) => s + p.to_principal, 0);
                const interestPaid = paymentsForLoan.reduce((s: number, p: any) => s + p.to_interest, 0);

                const expectedInt = calculateExpectedInterest(
                    l.amount,
                    l.rate,
                    l.rate_period,
                    l.interest_type,
                    l.compound_freq,
                    l.repayment_method,
                    l.term
                );
                const remPrincipal = Math.max(0, l.amount - principalPaid);
                const remInterest = Math.max(0, expectedInt - interestPaid);
                return sum + remPrincipal + remInterest;
            }, 0);

            setTotals({
                totalLent,
                outstanding,
                interestEarned,
            });

            // Recent payments (limit 5)
            const sortedPayments = [...allPayments].sort((a: any, b: any) => b.id - a.id).slice(0, 5);
            const mappedPayments = sortedPayments.map((p: any) => {
                const loan = allLoans.find((l: any) => l.id === p.loan_id);
                const borrower = loan ? allBorrowers.find((b: any) => b.id === loan.borrower_id) : null;
                const isAddition = p.to_principal < 0;
                return {
                    id: p.id,
                    title: borrower ? borrower.name : 'Unknown',
                    status: loan ? loan.status : 'Active',
                    total: loan ? loan.amount : 0,
                    amount: Math.abs(p.amount),
                    date: p.date,
                    category: isAddition ? 'Outgoing' : 'Incoming',
                    borrower: borrower
                        ? {
                              id: borrower.id,
                              name: borrower.name,
                              phone: borrower.phone,
                              address: borrower.address,
                          }
                        : null,
                };
            });
            setRecentPayments(mappedPayments);

            // Upcoming due dates (limit 5 active/overdue loans)
            const sortedLoans = [...activeLoans].slice(0, 5);
            const mappedLoans = sortedLoans.map((l: any) => {
                const borrower = allBorrowers.find((b: any) => b.id === l.borrower_id);
                const paymentsForLoan = allPayments.filter((p: any) => p.loan_id === l.id);
                const principalPaidForLoan = paymentsForLoan.reduce((sum: number, p: any) => sum + p.to_principal, 0);
                const outstandingForLoan = Math.max(0, l.amount - principalPaidForLoan);

                return {
                    id: l.id,
                    title: borrower ? borrower.name : 'Unknown',
                    status: l.status,
                    total: l.amount,
                    amount: outstandingForLoan,
                    date: l.due_date || 'N/A',
                    category: 'Outgoing',
                    borrower: borrower
                        ? {
                              id: borrower.id,
                              name: borrower.name,
                              phone: borrower.phone,
                              address: borrower.address,
                          }
                        : null,
                };
            });
            setUpcomingLoans(mappedLoans);
        } catch (error) {
            console.error('Failed to load finance data from SQLite:', error);
        }
    }, []);

    // Sync API dashboard data when available
    useEffect(() => {
        if (apiFinanceDashboard?.data) {
            const d = apiFinanceDashboard.data;
            if (d.summary) {
                setTotals({
                    totalLent: d.summary.totalLent || 0,
                    outstanding: d.summary.totalOutstanding || 0,
                    interestEarned: d.summary.totalInterestEarned || 0,
                });
            }
        }
    }, [apiFinanceDashboard]);

    useFocusEffect(
        useCallback(() => {
            loadFinanceData();
            refetchFinance();
        }, [loadFinanceData, refetchFinance])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadFinanceData();
        refetchFinance().finally(() => setRefreshing(false));
    }, [loadFinanceData, refetchFinance]);

    const showFooter = recentPayments.length > 0 || upcomingLoans.length > 0;

    return (
        <CommonBg>
            <InsightHeader title={"Finance Center"} subtitle={"Every Transaction"} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <FinCard totals={totals} />
                <FinSections />

                {recentPayments.length === 0 && upcomingLoans.length === 0 ? (
                    <EmptyStateCard
                        title="No Active Loans or Payments"
                        subtitle="Get started by adding a borrower and creating a loan. The Finance Center will track outstanding balances and upcoming due dates."
                        Icon={FinanceIcon}
                        btnTitle="+ Add New Loan"
                        onPressBtn={() => navigate('NewLoan')}
                        style={styles.emptyCard}
                    />
                ) : (
                    <>
                        {recentPayments.length > 0 && <RecentPay data={recentPayments} />}
                        {upcomingLoans.length > 0 && <RecentLoan data={upcomingLoans} />}
                    </>
                )}

                {showFooter && (
                    <CustomText style={styles.footer}>on-device · offline · private</CustomText>
                )}
            </ScrollView>
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: resAvarage(16),
    },
    emptyCard: {
        marginHorizontal: resAvarage(3),
        marginTop: resAvarage(2),
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
    },
});
