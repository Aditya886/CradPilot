import React, { useState, useCallback } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { FontBold, FontBoldP, FontMedium, FontRegular } from '../../../utils/fontFamily'
import { font10, font12, font14, font15, font35 } from '../../../utils/fontSizes'
import { resAvarage, resWidth, scaleSize } from '../../../utils/responsive'
import { formatINR } from '../../../utils/FormatUtil'
import WhitePlus from '../../../assets/images/icons/whitePlus.svg'
import AddPerson from '../../../assets/images/icons/addPerson.svg'
import ScaleSplit from '../../../assets/images/icons/scaleSplit.svg'
import DeleteIcon from '../../../assets/images/icons/delete.svg'

import AddSpendModal from '../../../ui/modals/AddSpendModal'
import AddPersonsModal from '../../../ui/modals/AddPersonsModal'
import SplitFilterModal from '../../../ui/modals/SplitFilterModal'
import DeleteConfirmationModal from '../../../ui/modals/DeleteConfirmationModal'
import { query, insert, removeWhere, update } from '../../../storage/local/sqlite'
import { goBack } from '../../../navigation/NavigationUtils'
import { useFocusEffect } from '@react-navigation/native'

interface MemberData {
    id: string
    initial: string
    name: string
    paid: number
    owes: number
    net: number
}

interface SpendData {
    id: string
    title: string
    date: string
    paidBy: string
    amount: number
}

interface SettlementData {
    id: string
    from: string
    to: string
    amount: number
}

export default function TripDetails({ route }: any) {
    const plan = route?.params?.plan
    const planIdNum = plan?.id ? parseInt(plan.id, 10) : 0

    const [showAddSpendModal, setShowAddSpendModal] = useState(false)
    const [showAddPersonModal, setShowAddPersonModal] = useState(false)
    const [showSplitFilterModal, setShowSplitFilterModal] = useState(false)

    // Delete Modal States
    const [deleteType, setDeleteType] = useState<'plan' | 'person' | 'spend' | null>(null)
    const [itemToDelete, setItemToDelete] = useState<any>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [currentPlan, setCurrentPlan] = useState<any>(plan || {})
    const [membersList, setMembersList] = useState<MemberData[]>([])
    const [spendsList, setSpendsList] = useState<SpendData[]>([])

    const loadDataFromDB = () => {
        try {
            if (!planIdNum) return

            // Query plan
            const dbPlans = query('SELECT * FROM plans WHERE id = ?', [planIdNum])
            if (dbPlans && dbPlans.length > 0) {
                setCurrentPlan(dbPlans[0])
            }

            // Query spends
            const dbSpends = query('SELECT * FROM plan_spends WHERE plan_id = ? ORDER BY id DESC', [planIdNum]) || []
            const formattedSpends: SpendData[] = dbSpends.map((s: any) => ({
                id: s.id.toString(),
                title: s.title,
                date: s.date,
                paidBy: s.paid_by,
                amount: s.amount,
            }))
            setSpendsList(formattedSpends)

            // Query members
            const dbMembers = query('SELECT * FROM plan_members WHERE plan_id = ?', [planIdNum]) || []
            const totalSpentAmt = formattedSpends.reduce((sum, s) => sum + s.amount, 0)
            const equalOwes = dbMembers.length > 0 ? Math.round(totalSpentAmt / dbMembers.length) : 0

            const formattedMembers: MemberData[] = dbMembers.map((m: any) => {
                // Calculate paid by member from spends
                const memberPaid = formattedSpends
                    .filter(s => s.paidBy.toLowerCase() === m.name.toLowerCase())
                    .reduce((sum, s) => sum + s.amount, 0)

                const memberOwes = m.owes > 0 ? m.owes : equalOwes
                const net = memberPaid - memberOwes

                return {
                    id: m.id.toString(),
                    initial: (m.name.charAt(0) || 'P').toUpperCase(),
                    name: m.name,
                    paid: memberPaid,
                    owes: memberOwes,
                    net,
                }
            })
            setMembersList(formattedMembers)

        } catch (error) {
            console.error('Error loading TripDetails from SQLite:', error)
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadDataFromDB()
        }, [planIdNum])
    )

    const planTitle = currentPlan?.title || 'Trip Details'
    const totalBudget = currentPlan?.total ?? 10000
    const totalSpent = spendsList.reduce((sum, s) => sum + s.amount, 0)
    const isOver = totalSpent > totalBudget

    const tagLabel = isOver
        ? `${formatINR(totalSpent - totalBudget)} over`
        : `${formatINR(Math.max(0, totalBudget - totalSpent))} left`

    const progressPercent = isOver
        ? 100
        : Math.min(100, Math.max(0, (totalSpent / (totalBudget || 1)) * 100))

    // Calculate settlement suggestions
    const settlements: SettlementData[] = React.useMemo(() => {
        const debtors = membersList.filter(m => m.net < 0).map(m => ({ ...m, net: Math.abs(m.net) }))
        const creditors = membersList.filter(m => m.net > 0).map(m => ({ ...m }))

        const result: SettlementData[] = []
        let i = 0
        let j = 0

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i]
            const creditor = creditors[j]
            const amount = Math.min(debtor.net, creditor.net)

            if (amount > 0) {
                result.push({
                    id: `${debtor.id}-${creditor.id}`,
                    from: debtor.name,
                    to: creditor.name,
                    amount: Math.round(amount),
                })
            }

            debtor.net -= amount
            creditor.net -= amount

            if (debtor.net <= 0) i++
            if (creditor.net <= 0) j++
        }

        return result
    }, [membersList])

    // Handlers
    const handleAddSpend = (data: {
        title: string;
        amount: number;
        paidBy: string;
        payerAmounts?: { person: string; amount: number }[];
    }) => {
        try {
            const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            if (data.payerAmounts && data.payerAmounts.length > 1) {
                data.payerAmounts.forEach(pa => {
                    if (pa.amount > 0) {
                        insert('plan_spends', {
                            plan_id: planIdNum,
                            title: `${data.title} (${pa.person})`,
                            amount: pa.amount,
                            paid_by: pa.person,
                            date: todayStr,
                        })
                    }
                })
            } else {
                insert('plan_spends', {
                    plan_id: planIdNum,
                    title: data.title,
                    amount: data.amount,
                    paid_by: data.paidBy,
                    date: todayStr,
                })
            }
            loadDataFromDB()
        } catch (error) {
            console.error('Error adding spend in SQLite:', error)
        }
    }

    const handleAddPerson = (name: string) => {
        try {
            insert('plan_members', {
                plan_id: planIdNum,
                name: name.trim(),
                paid: 0,
                owes: 0,
            })
            loadDataFromDB()
        } catch (error) {
            console.error('Error adding person in SQLite:', error)
        }
    }

    const handleApplySplit = (data: { mode: 'Equally' | 'Custom'; memberShares: any[] }) => {
        try {
            if (data.mode === 'Custom') {
                data.memberShares.forEach((ms) => {
                    const memberRecord = membersList.find(m => m.name.toLowerCase() === ms.name.toLowerCase())
                    if (memberRecord) {
                        update('plan_members', parseInt(memberRecord.id, 10), { owes: ms.amount })
                    }
                })
            } else {
                membersList.forEach((m) => {
                    update('plan_members', parseInt(m.id, 10), { owes: 0 })
                })
            }
            loadDataFromDB()
        } catch (error) {
            console.error('Error applying split in SQLite:', error)
        }
    }

    // Delete actions
    const triggerDeletePlan = () => {
        setDeleteType('plan')
        setItemToDelete(currentPlan)
        setShowDeleteModal(true)
    }

    const triggerDeletePerson = (member: MemberData) => {
        setDeleteType('person')
        setItemToDelete(member)
        setShowDeleteModal(true)
    }

    const triggerDeleteSpend = (spend: SpendData) => {
        setDeleteType('spend')
        setItemToDelete(spend)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = () => {
        try {
            if (deleteType === 'plan') {
                removeWhere('plans', 'id = ?', [planIdNum])
                removeWhere('plan_members', 'plan_id = ?', [planIdNum])
                removeWhere('plan_spends', 'plan_id = ?', [planIdNum])
                goBack()
            } else if (deleteType === 'person' && itemToDelete) {
                removeWhere('plan_members', 'id = ?', [parseInt(itemToDelete.id, 10)])
                loadDataFromDB()
            } else if (deleteType === 'spend' && itemToDelete) {
                removeWhere('plan_spends', 'id = ?', [parseInt(itemToDelete.id, 10)])
                loadDataFromDB()
            }
        } catch (error) {
            console.error('Error handling delete in SQLite:', error)
        } finally {
            setDeleteType(null)
            setItemToDelete(null)
        }
    }

    const getDeleteTitle = () => {
        if (deleteType === 'plan') return 'Delete Plan'
        if (deleteType === 'person') return 'Remove Person'
        if (deleteType === 'spend') return 'Delete Spend Entry'
        return 'Delete'
    }

    const getDeleteDescription = () => {
        if (deleteType === 'plan') return `Are you sure you want to delete "${planTitle}"? All members and spends will be deleted.`
        if (deleteType === 'person') return `Are you sure you want to remove "${itemToDelete?.name}" from this plan?`
        if (deleteType === 'spend') return `Are you sure you want to delete spend "${itemToDelete?.title}" of ${formatINR(itemToDelete?.amount || 0)}?`
        return 'Are you sure you want to delete this item?'
    }

    return (
        <CommonBg>
            <View style={{ flex: 1 }}>
                {/* Header with Title & Delete Plan button */}
                <View style={styles.topHeaderRow}>
                    <View style={{ flex: 1 }}>
                        <InsightHeader title="Plans & Trips" subtitle={planTitle} />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={triggerDeletePlan}
                        style={styles.headerDeleteBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <DeleteIcon width={resAvarage(4.2)} height={resAvarage(4.2)} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* GROUP BUDGET Card */}
                    <View style={styles.budgetCard}>
                        <CustomText style={styles.budgetLabel}>
                            {currentPlan?.type === 'Single' ? 'SINGLE BUDGET' : 'GROUP BUDGET'}
                        </CustomText>
                        <CustomText style={styles.budgetAmount}>{formatINR(totalBudget)}</CustomText>

                        <View style={styles.budgetTrack}>
                            <View
                                style={[
                                    styles.budgetFill,
                                    {
                                        width: `${progressPercent}%`,
                                        backgroundColor: isOver ? colors.textRed : colors.theme,
                                    },
                                ]}
                            />
                        </View>

                        <View style={styles.budgetFooter}>
                            <CustomText style={styles.budgetFooterText}>
                                {`${formatINR(totalSpent)} spent`}
                            </CustomText>
                            <CustomText style={styles.budgetFooterText}>
                                {tagLabel}
                            </CustomText>
                        </View>
                    </View>

                    {/* Action Buttons Row */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.addSpendBtn}
                            onPress={() => setShowAddSpendModal(true)}
                        >
                            <WhitePlus width={resAvarage(2.8)} height={resAvarage(2.8)} />
                            <CustomText style={styles.addSpendBtnText}>Add spend</CustomText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.iconBtn}
                            onPress={() => setShowAddPersonModal(true)}
                        >
                            <AddPerson width={resAvarage(4.5)} height={resAvarage(4.5)} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.splitBtn}
                            onPress={() => setShowSplitFilterModal(true)}
                        >
                            <ScaleSplit width={resAvarage(4)} height={resAvarage(4)} />
                            <CustomText style={styles.splitBtnText}>Split</CustomText>
                        </TouchableOpacity>
                    </View>

                    {/* WHO'S IN Section */}
                    {membersList.length > 0 && (
                        <>
                            <View style={styles.sectionHeaderWrap}>
                                <CustomText style={styles.sectionHeader}>WHO'S IN</CustomText>
                            </View>
                            <View style={styles.card}>
                                {membersList.map((member, index) => (
                                    <View
                                        key={member.id}
                                        style={[
                                            styles.memberRow,
                                            index < membersList.length - 1 && styles.itemGap,
                                        ]}
                                    >
                                        <View style={styles.avatar}>
                                            <CustomText style={styles.avatarText}>{member.initial}</CustomText>
                                        </View>
                                        <View style={styles.memberInfo}>
                                            <CustomText style={styles.memberName}>{member.name}</CustomText>
                                            <CustomText style={styles.memberSub}>
                                                {`paid ${formatINR(member.paid)} · owes ${formatINR(member.owes)}`}
                                            </CustomText>
                                        </View>
                                        <CustomText
                                            style={[
                                                styles.memberNet,
                                                { color: member.net >= 0 ? colors.textGreen : colors.textRed },
                                            ]}
                                        >
                                            {`${member.net >= 0 ? '+' : '-'}${formatINR(Math.abs(member.net))}`}
                                        </CustomText>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => triggerDeletePerson(member)}
                                            style={styles.itemDeleteBtn}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <DeleteIcon width={resAvarage(3.2)} height={resAvarage(3.2)} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* SPENDS Section */}
                    <View style={styles.sectionHeaderWrap}>
                        <CustomText style={styles.sectionHeader}>SPENDS</CustomText>
                    </View>
                    <View style={styles.card}>
                        {spendsList.length === 0 ? (
                            <CustomText style={styles.emptyText}>No spend entries yet</CustomText>
                        ) : (
                            spendsList.map((spend, index) => (
                                <View
                                    key={spend.id}
                                    style={[
                                        styles.spendRow,
                                        index < spendsList.length - 1 && styles.itemGap,
                                    ]}
                                >
                                    <View style={styles.spendInfo}>
                                        <CustomText style={styles.spendTitle}>{spend.title}</CustomText>
                                        <CustomText style={styles.spendSub}>
                                            {`${spend.date} · paid by ${spend.paidBy}`}
                                        </CustomText>
                                    </View>
                                    <CustomText style={styles.spendAmount}>
                                        {formatINR(spend.amount)}
                                    </CustomText>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => triggerDeleteSpend(spend)}
                                        style={styles.itemDeleteBtn}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <DeleteIcon width={resAvarage(3.2)} height={resAvarage(3.2)} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>

                    {/* SETTLE UP · EQUAL SPLIT Section */}
                    {settlements.length > 0 && (
                        <>
                            <View style={styles.sectionHeaderWrap}>
                                <CustomText style={styles.sectionHeader}>SETTLE UP · EQUAL SPLIT</CustomText>
                            </View>
                            <View style={styles.card}>
                                {settlements.map((settle, index) => (
                                    <View
                                        key={settle.id}
                                        style={[
                                            styles.settleRow,
                                            index < settlements.length - 1 && styles.itemGap,
                                        ]}
                                    >
                                        <View style={styles.settleNames}>
                                            <CustomText style={styles.settleName}>{settle.from}</CustomText>
                                            <CustomText style={styles.settleArrow}> → </CustomText>
                                            <CustomText style={styles.settleName}>{settle.to}</CustomText>
                                        </View>
                                        <CustomText style={styles.settleAmount}>
                                            {formatINR(settle.amount)}
                                        </CustomText>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    <CustomText style={styles.footer}>on-device · offline · private</CustomText>
                </ScrollView>

                {/* Modals */}
                <AddSpendModal
                    show={showAddSpendModal}
                    setShow={setShowAddSpendModal}
                    people={membersList.map(m => m.name)}
                    onAddSpend={handleAddSpend}
                />

                <AddPersonsModal
                    show={showAddPersonModal}
                    setShow={setShowAddPersonModal}
                    onAddPerson={handleAddPerson}
                />

                <SplitFilterModal
                    show={showSplitFilterModal}
                    setShow={setShowSplitFilterModal}
                    totalAmount={totalSpent || totalBudget}
                    members={membersList.map(m => m.name)}
                    onApplySplit={handleApplySplit}
                />

                <DeleteConfirmationModal
                    show={showDeleteModal}
                    setShow={setShowDeleteModal}
                    title={getDeleteTitle()}
                    description={getDeleteDescription()}
                    onConfirm={handleConfirmDelete}
                />
            </View>
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    topHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: resAvarage(3),
    },
    headerDeleteBtn: {
        padding: resAvarage(1.5),
        marginTop: resAvarage(1),
    },
    scrollContent: {
        paddingBottom: resAvarage(5),
    },
    budgetCard: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(5),
        marginHorizontal: resAvarage(3),
        marginTop: resAvarage(2),
        paddingHorizontal: resAvarage(4.5),
        paddingVertical: resAvarage(4),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    budgetLabel: {
        fontSize: font12,
        letterSpacing: resAvarage(0.2),
        textTransform: 'uppercase',
        color: colors.white60,
        fontFamily: FontMedium,
    },
    budgetAmount: {
        fontSize: font35,
        color: colors.white,
        fontFamily: FontBoldP,
        marginVertical: resAvarage(1),
    },
    budgetTrack: {
        height: scaleSize(7),
        backgroundColor: '#262626',
        borderRadius: resAvarage(100),
        marginVertical: resAvarage(2),
        overflow: 'hidden',
        width: '100%',
    },
    budgetFill: {
        height: '100%',
        borderRadius: resAvarage(100),
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    budgetFooterText: {
        fontSize: font12,
        color: colors.white70,
        fontFamily: FontRegular,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: resAvarage(3),
        marginTop: resAvarage(3),
        gap: resAvarage(2),
    },
    addSpendBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: resAvarage(2.2),
        gap: resAvarage(1.5),
    },
    addSpendBtnText: {
        color: colors.white,
        fontSize: font14,
        fontFamily: FontMedium,
    },
    iconBtn: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E8EBEF',
        borderRadius: resAvarage(100),
        width: resAvarage(9),
        height: resAvarage(8.5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    splitBtn: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E8EBEF',
        borderRadius: resAvarage(100),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: resAvarage(3.5),
        height: resAvarage(8.5),
        gap: resAvarage(1.2),
    },
    splitBtnText: {
        color: colors.black,
        fontSize: font14,
        fontFamily: FontMedium,
    },
    sectionHeaderWrap: {
        marginHorizontal: resAvarage(3),
        marginTop: resAvarage(3.5),
        marginBottom: resAvarage(1.5),
    },
    sectionHeader: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        letterSpacing: resAvarage(0.2),
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(3),
        marginHorizontal: resAvarage(3),
        borderWidth: 1,
        borderColor: '#E8EBEF',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemGap: {
        marginBottom: resAvarage(3),
    },
    avatar: {
        width: resAvarage(7.5),
        height: resAvarage(7.5),
        borderRadius: resAvarage(100),
        backgroundColor: '#F0F2F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: resAvarage(2.5),
    },
    avatarText: {
        fontSize: font14,
        fontFamily: FontBold,
        color: colors.black,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
    },
    memberSub: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: resAvarage(0.4),
    },
    memberNet: {
        fontSize: font14,
        fontFamily: FontMedium,
        marginRight: resAvarage(2),
    },
    itemDeleteBtn: {
        padding: resAvarage(0.8),
    },
    spendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    spendInfo: {
        flex: 1,
    },
    spendTitle: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
    },
    spendSub: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: resAvarage(0.4),
    },
    spendAmount: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
        marginRight: resAvarage(2),
    },
    settleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settleNames: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settleName: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
    },
    settleArrow: {
        fontSize: font15,
        fontFamily: FontMedium,
        color: colors.black60,
        marginHorizontal: resAvarage(0.5),
    },
    settleAmount: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
    },
    emptyText: {
        fontSize: font14,
        fontFamily: FontRegular,
        color: colors.black60,
        textAlign: 'center',
        paddingVertical: resAvarage(2),
    },
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(3.5),
        fontSize: font10,
        marginBottom: resAvarage(5),
        color: colors.black60,
        fontFamily: FontMedium,
    },
})