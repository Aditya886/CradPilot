import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useState, useCallback } from 'react'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import { resAvarage } from '../../../utils/responsive'
import UserCard from './components/UserCard'
import LoanDetail from './components/LoanDetail'
import CustomText from '../../../ui/components/CustomText'
import LoansCard from './components/LoansCard'
import { font13 } from '../../../utils/fontSizes'
import { FontMedium } from '../../../utils/fontFamily'
import { query, getOne } from '../../../storage/local/sqlite'
import { useFocusEffect } from '@react-navigation/native'
import { navigate, goBack } from '../../../navigation/NavigationUtils'
import DeleteConfirmationModal from '../../../ui/modals/DeleteConfirmationModal'
import { calculateExpectedInterest } from '../../../utils/FormatUtil'

export default function User({ route }: any) {
    const { data: initialData } = route?.params
    const [borrowerData, setBorrowerData] = useState(initialData)
    const [loans, setLoans] = useState<any[]>([])
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false)
    const [stats, setStats] = useState({
        activeCount: 0,
        paymentsCount: 0,
        completedCount: 0,
        overdueCount: 0
    })

    const loadData = () => {
        try {
            // Get current borrower info
            const b = getOne('borrowers', initialData.id)
            if (!b) return

            // Fetch loans for this borrower
            const myLoans = query('SELECT * FROM loans WHERE borrower_id = ? ORDER BY id DESC', [b.id]) || []
            const myLoanIds = myLoans.map((l: any) => l.id)

            // Fetch payments for these loans
            let myPayments: any[] = []
            if (myLoanIds.length > 0) {
                const placeholders = myLoanIds.map(() => '?').join(',')
                myPayments = query(`SELECT * FROM payments WHERE loan_id IN (${placeholders})`, myLoanIds) || []
            }

            const activeLoansForB = myLoans.filter((l: any) => l.status === 'Active' || l.status === 'OverDue');
            const outStand = activeLoansForB.reduce((sum, l) => {
                const paymentsForLoan = myPayments.filter((p: any) => p.loan_id === l.id);
                const principalPaid = paymentsForLoan.reduce((s, p) => s + p.to_principal, 0);
                const interestPaid = paymentsForLoan.reduce((s, p) => s + p.to_interest, 0);
                
                const expectedInt = calculateExpectedInterest(l.amount, l.rate, l.rate_period, l.interest_type, l.compound_freq, l.repayment_method, l.term);
                const remPrincipal = Math.max(0, l.amount - principalPaid);
                const remInterest = Math.max(0, expectedInt - interestPaid);
                return sum + remPrincipal + remInterest;
            }, 0);
            const earn = myPayments.reduce((sum: number, p: any) => sum + p.to_interest, 0)

            // Active loans next due date
            const activeLoans = myLoans.filter((l: any) => l.status === 'Active' || l.status === 'OverDue')
            const dueDates = activeLoans.map((l: any) => l.due_date).filter((d: any) => !!d)
            const nextDueDate = dueDates.length > 0 ? dueDates[0] : 'N/A'

            let status = 'Complete'
            if (myLoans.length > 0) {
                if (myLoans.some((l: any) => l.status === 'OverDue')) {
                    status = 'OverDue'
                } else if (myLoans.some((l: any) => l.status === 'Active')) {
                    status = 'Good'
                }
            }

            setBorrowerData({
                id: b.id,
                name: b.name,
                phone: b.phone,
                address: b.address,
                status,
                outStand,
                earn,
                dueDate: nextDueDate
            })

            // Map loans for rendering in FlatList
            const mappedLoans = myLoans.map((l: any) => {
                const paymentsForLoan = myPayments.filter((p: any) => p.loan_id === l.id)
                const principalPaid = paymentsForLoan.reduce((sum: number, p: any) => sum + p.to_principal, 0)
                const outstandingBalance = Math.max(0, l.amount - principalPaid)
                const paymentCount = paymentsForLoan.length

                return {
                    id: l.id,
                    title: l.title,
                    amount: l.amount,
                    intrest: l.rate,
                    intrestType: l.rate_period,
                    totalInstallments: l.term || 12,
                    status: l.status,
                    installment: paymentCount,
                    outStand: outstandingBalance,
                    date: l.due_date || 'N/A'
                }
            })
            setLoans(mappedLoans)

            // Calculate Stats
            const activeCount = myLoans.filter((l: any) => l.status === 'Active').length
            const completedCount = myLoans.filter((l: any) => l.status === 'Completed').length
            const overdueCount = myLoans.filter((l: any) => l.status === 'OverDue').length
            const paymentsCount = myPayments.length

            setStats({
                activeCount,
                paymentsCount,
                completedCount,
                overdueCount
            })

        } catch (error) {
            console.error('Failed to load user info:', error)
        }
    }

    const handleDeleteUser = () => {
        try {
            if (borrowerData?.id) {
                const borrowerLoans = query('SELECT id FROM loans WHERE borrower_id = ?', [borrowerData.id]);
                const loanIds = borrowerLoans.map((l: any) => l.id);
                if (loanIds.length > 0) {
                    const placeholders = loanIds.map(() => '?').join(',');
                    query(`DELETE FROM payments WHERE loan_id IN (${placeholders})`, loanIds);
                    query('DELETE FROM loans WHERE borrower_id = ?', [borrowerData.id]);
                }
                query('DELETE FROM borrowers WHERE id = ?', [borrowerData.id]);
            }
            goBack();
        } catch (e) {
            console.error("Error deleting borrower:", e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData()
        }, [])
    )

    return (
        <CommonBg>
            <InsightHeader title={"Borrowers"} subtitle={"User"} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: resAvarage(8) }}
            >
                <UserCard 
                    item={borrowerData} 
                    onDeleteUser={() => setShowDeleteUserModal(true)} 
                />
                <LoanDetail stats={stats} />
                <View >
                    <View style={styles.row} >
                        <CustomText style={styles.title} >Loans</CustomText>
                        <TouchableOpacity onPress={() => navigate("NewLoan", { borrower: borrowerData })}>
                            <CustomText style={styles.subtitle} >+ New Loan</CustomText>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={loans}
                        scrollEnabled={false}
                        contentContainerStyle={{
                            gap: resAvarage(1.5),
                            paddingTop: resAvarage(4),
                            paddingBottom: resAvarage(8)
                        }}
                        renderItem={({ item }: any) => <LoansCard name={borrowerData?.name} item={item} />}
                    />
                </View>
            </ScrollView>

            <DeleteConfirmationModal
                show={showDeleteUserModal}
                setShow={setShowDeleteUserModal}
                onConfirm={handleDeleteUser}
                title="Delete Borrower?"
                description={`Are you sure you want to delete ${borrowerData?.name || 'this borrower'}? This action will permanently delete this borrower, all of their loans, and all payment history. It cannot be undone.`}
            />
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: resAvarage(2),
        marginHorizontal: resAvarage(3)
    },
    title: {
        fontSize: font13,
        textTransform: 'uppercase',
        letterSpacing: resAvarage(0.3)
    },
    subtitle: {
        textDecorationLine: "underline",
        fontFamily: FontMedium
    }
})