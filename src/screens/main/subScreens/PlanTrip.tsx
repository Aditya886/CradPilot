import React, { useState, useCallback } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import Plus from '../../../assets/images/icons/whitePlus.svg'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { FontMedium, FontRegular } from '../../../utils/fontFamily'
import { font10, font12 } from '../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../utils/responsive'
import { query, insert, removeWhere, getAll } from '../../../storage/local/sqlite'
import { useFocusEffect } from '@react-navigation/native'
import PlanMainCard from './components/PlanMainCard'
import ButtonSlider from '../../../ui/components/ButtonSlider'
import PlanCard, { PlanItemData } from './components/PlanCard'
import { navigate } from '../../../navigation/NavigationUtils'
import AddNewPlanModal from '../../../ui/modals/AddNewPlanModal'
import DeleteConfirmationModal from '../../../ui/modals/DeleteConfirmationModal'
import EmptyStateCard from '../../../ui/components/EmptyStateCard'
import BudgetIcon from '../../../assets/images/icons/budget.svg'

export default function Insights() {
    const [selected, setSelected] = useState("All")
    const [showNewPlanModal, setShowNewPlanModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [planToDelete, setPlanToDelete] = useState<PlanItemData | null>(null)
    const [plansList, setPlansList] = useState<PlanItemData[]>([])

    const slider = ['All', 'Single', 'Group']

    const loadPlansFromDB = () => {
        try {
            const dbPlans = query('SELECT * FROM plans ORDER BY id DESC') || []
            const formattedPlans: PlanItemData[] = dbPlans.map((p: any) => {
                const spends = query('SELECT * FROM plan_spends WHERE plan_id = ?', [p.id]) || []
                const members = query('SELECT * FROM plan_members WHERE plan_id = ?', [p.id]) || []

                const spent = spends.reduce((sum: number, s: any) => sum + s.amount, 0)
                const isOver = spent > p.total
                const isSettled = spent === p.total && spent > 0

                let tagText = ''
                let statusVariant: 'left' | 'settled' | 'over' = 'left'
                if (isSettled) {
                    tagText = 'Settled'
                    statusVariant = 'settled'
                } else if (isOver) {
                    tagText = `₹${(spent - p.total).toLocaleString()} over`
                    statusVariant = 'over'
                } else {
                    tagText = `₹${Math.max(0, p.total - spent).toLocaleString()} left`
                    statusVariant = 'left'
                }

                return {
                    id: p.id.toString(),
                    title: p.title,
                    type: p.type,
                    peopleCount: p.type === 'Group' ? members.length : undefined,
                    itemsCount: spends.length,
                    spent,
                    total: p.total,
                    tagText,
                    statusVariant,
                }
            })

            setPlansList(formattedPlans)
        } catch (error) {
            console.error('Failed to load plans from SQLite:', error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadPlansFromDB()
        }, [])
    )

    const filteredPlans = React.useMemo(() => {
        if (selected === 'Single') {
            return plansList.filter(p => p.type === 'Single')
        }
        if (selected === 'Group') {
            return plansList.filter(p => p.type === 'Group')
        }
        return plansList
    }, [selected, plansList])

    const planTotals = React.useMemo(() => {
        const totalSpent = plansList.reduce((sum, p) => sum + p.spent, 0)
        const totalBudget = plansList.reduce((sum, p) => sum + p.total, 0)
        const totalLeft = Math.max(0, totalBudget - totalSpent)
        return {
            totalLent: totalSpent,
            outstanding: plansList.length,
            interestEarned: totalLeft,
        }
    }, [plansList])

    const handleCreatePlan = (data: { title: string; type: 'Single' | 'Group'; budget: number; note?: string; people?: string[] }) => {
        try {
            insert('plans', {
                title: data.title,
                type: data.type,
                total: data.budget,
                note: data.note || '',
                created_at: new Date().toISOString(),
            })

            const insertedPlans = query('SELECT * FROM plans WHERE title = ? ORDER BY id DESC LIMIT 1', [data.title])
            const planId = insertedPlans[0]?.id

            if (planId && data.type === 'Group' && data.people && data.people.length > 0) {
                data.people.forEach((pName) => {
                    insert('plan_members', {
                        plan_id: planId,
                        name: pName,
                        paid: 0,
                        owes: 0,
                    })
                })
            }

            loadPlansFromDB()
        } catch (error) {
            console.error('Error creating plan in SQLite:', error)
        }
    }

    const handleDeletePlanConfirm = () => {
        if (!planToDelete) return
        try {
            const numId = parseInt(planToDelete.id, 10)
            removeWhere('plans', 'id = ?', [numId])
            removeWhere('plan_members', 'plan_id = ?', [numId])
            removeWhere('plan_spends', 'plan_id = ?', [numId])
            setPlanToDelete(null)
            loadPlansFromDB()
        } catch (error) {
            console.error('Error deleting plan from SQLite:', error)
        }
    }

    const triggerDeletePlan = (item: PlanItemData) => {
        setPlanToDelete(item)
        setShowDeleteModal(true)
    }

    return (
        <CommonBg>
            <View style={{ flex: 1 }} >
                <InsightHeader title={"Plans & Trips"} subtitle={"My Budget plans"} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <PlanMainCard totals={planTotals} />
                    <View style={[styles.row, { marginHorizontal: resAvarage(3), marginVertical: resAvarage(3) }]} >
                        <ButtonSlider
                            onSelect={item => setSelected(item)}
                            options={slider}
                        />
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.planBtn}
                            onPress={() => setShowNewPlanModal(true)}
                        >
                            <Plus height={resAvarage(3)} width={resAvarage(3)} />
                            <CustomText style={styles.planBtnText} >New Plan</CustomText>
                        </TouchableOpacity>
                    </View>
                    {filteredPlans.length === 0 ? (
                        <EmptyStateCard
                            title="No Plans or Trips"
                            subtitle="Get started by creating a new plan. Track your budget, group expenses, and outstanding balances."
                            Icon={BudgetIcon}
                            btnTitle="+ Add New Plan"
                            onPressBtn={() => setShowNewPlanModal(true)}
                            style={{ marginHorizontal: resAvarage(3), marginTop: resAvarage(2) }}
                        />
                    ) : (
                        filteredPlans.map(item => (
                            <PlanCard
                                key={item.id}
                                item={item}
                                onPress={plan => navigate('TripDetails', { plan })}
                                onDelete={triggerDeletePlan}
                            />
                        ))
                    )}
                    <CustomText style={styles.footer} >on-device · offline · private</CustomText>
                </ScrollView>

                <AddNewPlanModal
                    show={showNewPlanModal}
                    setShow={setShowNewPlanModal}
                    onCreatePlan={handleCreatePlan}
                />

                <DeleteConfirmationModal
                    show={showDeleteModal}
                    setShow={setShowDeleteModal}
                    title="Delete Plan"
                    description={`Are you sure you want to delete "${planToDelete?.title || 'this plan'}"? All associated spends and members will be permanently removed.`}
                    onConfirm={handleDeletePlanConfirm}
                />
            </View>
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    planBtn: {
        backgroundColor: colors.black,
        padding: resAvarage(2),
        borderRadius: resAvarage(100),
        width: resWidth(25),
        justifyContent: 'center',
        alignItems: "center",
        flexDirection: "row"
    },
    planBtnText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.white,
        textAlign: 'center'
    },
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