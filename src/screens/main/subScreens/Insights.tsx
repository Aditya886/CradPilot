import React, { useState, useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import CommonList from '../../../ui/components/CommonList'
import { dates } from '../../../assets/DefaultData'
import InsightCard from './components/InsightCard'
import InsightInfo from './components/InsightInfo'
import Spending from './components/Spending'
import BudgetPerform from './components/BudgetPerform'
import SavingAndGoals from './components/SavingAndGoals'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { FontMedium } from '../../../utils/fontFamily'
import { font10 } from '../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../utils/responsive'
import { query } from '../../../storage/local/sqlite'
import { useFocusEffect } from '@react-navigation/native'

export default function Insights() {
    const [selected, setSelected] = useState({
        id: 1,
        name: "Today"
    })

    const [insightData, setInsightData] = useState<any>({
        summary: {
            earned: 0,
            lent: 0,
            savedPercentage: 0,
            spendPercentage: 0,
            borrowedPercentage: 0
        },
        infoBoxes: [],
        borrowersDistribution: [],
        topLendings: [],
        loanProgress: [],
        goalsList: []
    })

    const loadInsights = () => {
        try {
            const allLoans = query('SELECT * FROM loans') || []
            const allPayments = query('SELECT * FROM payments') || []
            const allBorrowers = query('SELECT * FROM borrowers') || []
            const allGoals = query('SELECT * FROM goals') || []

            // Summary calculations
            const totalLent = allLoans.reduce((sum: number, l: any) => sum + l.amount, 0)
            const totalInterestEarned = allPayments.reduce((sum: number, p: any) => sum + p.to_interest, 0)
            const totalPrincipalPaid = allPayments.reduce((sum: number, p: any) => sum + p.to_principal, 0)
            const outstanding = Math.max(0, totalLent - totalPrincipalPaid)

            const savedPercentage = totalLent > 0 ? Math.round((totalPrincipalPaid / totalLent) * 100) : 0
            const spendPercentage = totalLent > 0 ? Math.round((outstanding / totalLent) * 100) : 0
            const borrowedPercentage = 100 - savedPercentage - spendPercentage

            // Info Boxes
            const infoBoxes = [
                { id: 'Income', value: totalPrincipalPaid + totalInterestEarned, per: totalLent > 0 ? Math.round((totalPrincipalPaid / totalLent) * 100) : 0, type: 'increment' },
                { id: 'Outstanding', value: outstanding, per: totalLent > 0 ? Math.round((outstanding / totalLent) * 100) : 0, type: 'decrement' },
                { id: 'Interest earned', value: totalInterestEarned, per: totalLent > 0 ? Math.round((totalInterestEarned / totalLent) * 100) : 0, type: 'increment' },
                { id: 'Active Borrowers', value: allBorrowers.length, per: allBorrowers.length * 10, type: 'increment' }
            ]

            // Borrowers Distribution
            const colorPalette = [colors.black, colors.theme, colors.textGreen, colors.textOrange, colors.textBlue, colors.optionPurple]
            const borrowersDistribution = allBorrowers.map((b: any, idx: number) => {
                const bLoans = allLoans.filter((l: any) => l.borrower_id === b.id)
                const bLentAmount = bLoans.reduce((sum: number, l: any) => sum + l.amount, 0)
                return {
                    value: totalLent > 0 ? Math.round((bLentAmount / totalLent) * 100) : 0,
                    color: colorPalette[idx % colorPalette.length],
                    name: b.name
                }
            }).filter((item: any) => item.value > 0)

            // Top Lendings
            const mappedLendings = allLoans.map((l: any) => {
                const b = allBorrowers.find((borr: any) => borr.id === l.borrower_id)
                const lPayments = allPayments.filter((p: any) => p.loan_id === l.id)
                const principalPaid = lPayments.reduce((sum: number, p: any) => sum + p.to_principal, 0)
                const outstandingBal = Math.max(0, l.amount - principalPaid)
                return {
                    title: b ? b.name : l.title,
                    value: outstandingBal
                }
            }).sort((a: any, b: any) => b.value - a.value).slice(0, 5)

            // Loan Progress
            const loanProgress = allLoans.map((l: any) => {
                const lPayments = allPayments.filter((p: any) => p.loan_id === l.id)
                const principalPaid = lPayments.reduce((sum: number, p: any) => sum + p.to_principal, 0)
                return {
                    title: l.title,
                    value: principalPaid,
                    total: l.amount
                }
            }).slice(0, 5)

            setInsightData({
                summary: {
                    earned: totalInterestEarned,
                    lent: totalLent,
                    savedPercentage,
                    spendPercentage,
                    borrowedPercentage: borrowedPercentage > 0 ? borrowedPercentage : 0
                },
                infoBoxes,
                borrowersDistribution,
                topLendings: mappedLendings,
                loanProgress,
                goalsList: allGoals
            })

        } catch (error) {
            console.error('Failed to load insights:', error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadInsights()
        }, [])
    )

    const showFooter = React.useMemo(() => {
        return (insightData.topLendings?.length || 0) > 2 || (insightData.goalsList?.length || 0) > 2;
    }, [insightData]);

    return (
        <CommonBg>
            <View style={{ flex: 1 }} >
                <InsightHeader title={"Insights"} subtitle={"Patterns, made visible."} />
                <ScrollView>
                    <CommonList data={dates} selected={selected} setSelected={setSelected} />
                    <InsightCard summary={insightData.summary} />
                    <InsightInfo info={insightData.infoBoxes} />
                    <Spending chartData={insightData.borrowersDistribution} listData={insightData.topLendings} />
                    {insightData.loanProgress && insightData.loanProgress.length > 0 && (
                        <BudgetPerform loanProgress={insightData.loanProgress} />
                    )}
                    {insightData.goalsList && insightData.goalsList.length > 0 && (
                        <SavingAndGoals goals={insightData.goalsList} onRefresh={loadInsights} />
                    )}
                    {showFooter && <CustomText style={styles.footer} >on-device · offline · private</CustomText>}
                </ScrollView>
            </View>
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(2),
        fontSize: font10,
        marginBottom: resAvarage(5),
        color: colors.black60,
        fontFamily: FontMedium
    }
})