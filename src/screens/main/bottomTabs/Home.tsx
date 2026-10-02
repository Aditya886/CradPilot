import React, { useState, useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { CommonBg } from '../../../ui/common/CommonBg'
import HomeHeader from './components/HomeHeader'
import FinCard from '../subScreens/components/FinCard'
import FinSections from '../subScreens/components/FinSections'
import RecentPay from '../subScreens/components/RecentPay'
import RecentLoan from '../subScreens/components/ResentLoan'
import { resAvarage } from '../../../utils/responsive'
import { query } from '../../../storage/local/sqlite'
import { useFocusEffect } from '@react-navigation/native'
import EmptyStateCard from '../../../ui/components/EmptyStateCard'
import FinanceIcon from '../../../assets/images/icons/finance.svg'
import { navigate } from '../../../navigation/NavigationUtils'
import { calculateExpectedInterest } from '../../../utils/FormatUtil'
import { useAppSelector } from '../../../utils/hooks'

export default function Home() {
    const currentUser = useAppSelector(state => state.app.currentUser);
    const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    const [totals, setTotals] = useState({
        totalLent: 0,
        outstanding: 0,
        interestEarned: 0
    })
    const [recentPayments, setRecentPayments] = useState<any[]>([])
    const [upcomingLoans, setUpcomingLoans] = useState<any[]>([])

    const loadFinanceData = () => {
        try {
            const allLoans = query('SELECT * FROM loans') || []
            const allPayments = query('SELECT * FROM payments') || []
            const allBorrowers = query('SELECT * FROM borrowers') || []

            // Calculations
            const totalLent = allLoans.reduce((sum, l) => sum + l.amount, 0)
            const interestEarned = allPayments.reduce((sum, p) => sum + p.to_interest, 0)

            const activeLoans = allLoans.filter((l: any) => l.status === 'Active' || l.status === 'OverDue');
            const outstanding = activeLoans.reduce((sum, l) => {
                const paymentsForLoan = allPayments.filter((p: any) => p.loan_id === l.id);
                const principalPaid = paymentsForLoan.reduce((s, p) => s + p.to_principal, 0);
                const interestPaid = paymentsForLoan.reduce((s, p) => s + p.to_interest, 0);
                
                const expectedInt = calculateExpectedInterest(l.amount, l.rate, l.rate_period, l.interest_type, l.compound_freq, l.repayment_method, l.term);
                const remPrincipal = Math.max(0, l.amount - principalPaid);
                const remInterest = Math.max(0, expectedInt - interestPaid);
                return sum + remPrincipal + remInterest;
            }, 0);

            setTotals({
                totalLent,
                outstanding,
                interestEarned
            })

            // Recent payments (limit 5)
            const sortedPayments = [...allPayments].sort((a, b) => b.id - a.id).slice(0, 5)
            const mappedPayments = sortedPayments.map((p) => {
                const loan = allLoans.find((l) => l.id === p.loan_id)
                const borrower = loan ? allBorrowers.find((b) => b.id === loan.borrower_id) : null
                const isAddition = p.to_principal < 0;
                return {
                    id: p.id,
                    title: borrower ? borrower.name : 'Unknown',
                    status: loan ? loan.status : 'Active',
                    total: loan ? loan.amount : 0,
                    amount: Math.abs(p.amount),
                    date: p.date,
                    category: isAddition ? 'Outgoing' : 'Incoming',
                    borrower: borrower ? {
                        id: borrower.id,
                        name: borrower.name,
                        phone: borrower.phone,
                        address: borrower.address
                    } : null
                }
            })
            setRecentPayments(mappedPayments)

            // Upcoming due dates (limit 5 active/overdue loans)
            const sortedLoans = [...activeLoans].slice(0, 5)
            const mappedLoans = sortedLoans.map((l) => {
                const borrower = allBorrowers.find((b) => b.id === l.borrower_id)
                const paymentsForLoan = allPayments.filter((p) => p.loan_id === l.id)
                const principalPaidForLoan = paymentsForLoan.reduce((sum, p) => sum + p.to_principal, 0)
                const outstandingForLoan = Math.max(0, l.amount - principalPaidForLoan)
                
                return {
                    id: l.id,
                    title: borrower ? borrower.name : 'Unknown',
                    status: l.status,
                    total: l.amount,
                    amount: outstandingForLoan,
                    date: l.due_date || 'N/A',
                    category: 'Outgoing',
                    borrower: borrower ? {
                        id: borrower.id,
                        name: borrower.name,
                        phone: borrower.phone,
                        address: borrower.address
                    } : null
                }
            })
            setUpcomingLoans(mappedLoans)

        } catch (error) {
            console.error('Failed to load finance data from SQLite:', error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadFinanceData()
        }, [])
    )

    return (
        <CommonBg>
            <View style={{ flex: 1 }}>
                <HomeHeader name={currentUser ? capitalize(currentUser) : undefined} onPressInsights={() => navigate("Insights")} />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: resAvarage(24) }}
                >
                    <FinCard totals={totals} />
                    <FinSections />
                    {recentPayments.length === 0 && upcomingLoans.length === 0 ? (
                        <EmptyStateCard
                            title="No Active Loans or Payments"
                            subtitle="Get started by adding a borrower and creating a loan. The Finance Center will track outstanding balances and upcoming due dates."
                            Icon={FinanceIcon}
                            btnTitle="+ Add New Loan"
                            onPressBtn={() => navigate("NewLoan")}
                            style={{ marginHorizontal: resAvarage(3), marginTop: resAvarage(2) }}
                        />
                    ) : (
                        <>
                            <RecentPay data={recentPayments} />
                            <RecentLoan data={upcomingLoans} />
                        </>
                    )}
                </ScrollView>
            </View>
        </CommonBg>
    )
}

const styles = StyleSheet.create({})
