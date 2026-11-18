import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    RefreshControl,
} from 'react-native';
import { CommonBg } from '../../../../ui/common/CommonBg';
import InsightHeader from '../components/InsightHeader';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontSemiBold } from '../../../../utils/fontFamily';
import { font13 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { query, remove, update } from '../../../../storage/local/sqlite';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { ShowToast } from '../../../../utils/CustomToast/ToastManager';
import DeleteConfirmationModal from '../../../../ui/modals/DeleteConfirmationModal';
import { useGetGoalsQuery, useToggleGoalStatusMutation, useDeleteGoalMutation } from '../../../../API';
import { ActivityIndicator } from 'react-native';

// Components
import SummaryCard from './components/SummaryCard';
import GoalCard, { GoalItem } from './components/GoalCard';
import TipCard from './components/TipCard';
import EmptyGoalsCard from './components/EmptyGoalsCard';
import NewGoalModal from './components/NewGoalModal';
import AddContributionModal from './components/AddContributionModal';
import AddAmountModal from './components/AddAmountModal';

type FilterType = 'All' | 'Active' | 'Done';

export default function SavingAndGoalsScreen() {
    const route = useRoute<any>();
    const [goalsList, setGoalsList] = useState<GoalItem[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
    const [refreshing, setRefreshing] = useState(false);

    // RTK Query integration
    const { data: apiGoalsRes, isLoading: isApiLoading, refetch: refetchGoals } = useGetGoalsQuery(
        selectedFilter === 'All' ? undefined : { filter: selectedFilter }
    );
    const [toggleStatusApi] = useToggleGoalStatusMutation();
    const [deleteGoalApi] = useDeleteGoalMutation();

    // Modals
    const [showNewGoalModal, setShowNewGoalModal] = useState(false);
    const [showContributionModal, setShowContributionModal] = useState(false);
    const [showAddAmountModal, setShowAddAmountModal] = useState(false);
    const [addAmountMode, setAddAmountMode] = useState<'add' | 'deduct'>('add');
    const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);

    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<GoalItem | null>(null);

    // Check if routed with openAddGoal
    useEffect(() => {
        if (route.params?.openAddGoal) {
            setShowNewGoalModal(true);
        }
    }, [route.params]);

    // Synchronize backend goals with local state and cache in SQLite
    useEffect(() => {
        if (apiGoalsRes && Array.isArray(apiGoalsRes.data)) {
            const apiGoals: GoalItem[] = apiGoalsRes.data.map((g: any) => ({
                id: g._id || g.id,
                title: g.title,
                saved: Number(g.saved) || 0,
                target: Number(g.target) || 0,
                days: g.days || 30,
                timeline: g.timeline,
                status: g.status || (g.saved >= g.target ? 'done' : 'active'),
                created_at: g.createdAt,
            }));
            setGoalsList(apiGoals);
        }
    }, [apiGoalsRes]);

    const loadGoals = useCallback(() => {
        try {
            const rows = query('SELECT * FROM goals ORDER BY id DESC') || [];
            const formatted: GoalItem[] = rows.map((r: any) => ({
                id: r.id,
                title: r.title,
                saved: Number(r.saved) || 0,
                target: Number(r.target) || 0,
                days: r.days,
                timeline: r.timeline,
                status: r.status || (r.saved >= r.target ? 'done' : 'active'),
                created_at: r.created_at,
            }));
            // Only fallback to sqlite if API haven't loaded yet
            setGoalsList(prev => (prev.length > 0 ? prev : formatted));
        } catch (error) {
            console.error('[SavingAndGoalsScreen] Failed to load goals:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadGoals();
            refetchGoals();
        }, [loadGoals, refetchGoals])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadGoals();
        refetchGoals().finally(() => setRefreshing(false));
    }, [loadGoals, refetchGoals]);

    // Computed Totals
    const summaryData = useMemo(() => {
        const totalSaved = goalsList.reduce((acc, g) => acc + (g.saved || 0), 0);
        const totalTarget = goalsList.reduce((acc, g) => acc + (g.target || 0), 0);
        const goalsCount = goalsList.length;
        const reachedCount = goalsList.filter(
            g => g.status === 'done' || (g.target > 0 && g.saved >= g.target)
        ).length;

        return {
            totalSaved,
            totalTarget,
            goalsCount,
            reachedCount,
        };
    }, [goalsList]);

    // Filtered goals
    const filteredGoals = useMemo(() => {
        if (selectedFilter === 'Active') {
            return goalsList.filter(
                g => g.status !== 'done' && (g.target === 0 || g.saved < g.target)
            );
        }
        if (selectedFilter === 'Done') {
            return goalsList.filter(
                g => g.status === 'done' || (g.target > 0 && g.saved >= g.target)
            );
        }
        return goalsList;
    }, [goalsList, selectedFilter]);

    // Handlers
    const handleMinusPress = (goal: GoalItem) => {
        setSelectedGoal(goal);
        setAddAmountMode('deduct');
        setShowAddAmountModal(true);
    };

    const handlePlusPress = (goal: GoalItem) => {
        setSelectedGoal(goal);
        setAddAmountMode('add');
        setShowAddAmountModal(true);
    };

    const handleAddContributionPress = (goal: GoalItem) => {
        setSelectedGoal(goal);
        setShowContributionModal(true);
    };

    const handleToggleComplete = async (goal: GoalItem) => {
        const isDone = goal.status === 'done' || (goal.target > 0 && goal.saved >= goal.target);
        const newStatus = isDone ? 'active' : 'done';

        try {
            // Update Backend API
            const res: any = await toggleStatusApi({ id: String(goal.id), status: newStatus });
            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                // Update SQLite
                update('goals', goal.id, {
                    status: newStatus,
                });
                ShowToast(
                    res?.data?.message || (newStatus === 'done'
                        ? `Marked "${goal.title}" as completed! 🎉`
                        : `Marked "${goal.title}" as active`),
                    'success'
                );
                loadGoals();
                refetchGoals();
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to update goal', 'error');
                return;
            }
        } catch (error) {
            console.error('[SavingAndGoalsScreen] Toggle complete error:', error);
            ShowToast('Failed to update goal', 'error');
        }
    };

    const handleDeletePress = (goal: GoalItem) => {
        setGoalToDelete(goal);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!goalToDelete) return;
        try {
            // Delete from Backend API
            const res: any = await deleteGoalApi(String(goalToDelete.id));
            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                // Delete from SQLite
                remove('goals', goalToDelete.id);
                ShowToast(res?.data?.message || `Deleted "${goalToDelete.title}"`, 'success');
                setShowDeleteModal(false);
                setGoalToDelete(null);
                loadGoals();
                refetchGoals();
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to delete goal', 'error');
                return;
            }
        } catch (error) {
            console.error('[SavingAndGoalsScreen] Delete goal error:', error);
            ShowToast('Failed to delete goal', 'error');
        }
    };

    return (
        <CommonBg>
            <InsightHeader
                title="Savings & Goals"
                subtitle="Track your savings"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Top Summary Black Card */}
                <SummaryCard
                    totalSaved={summaryData.totalSaved}
                    totalTarget={summaryData.totalTarget}
                    goalsCount={summaryData.goalsCount}
                    reachedCount={summaryData.reachedCount}
                />

                {/* Filters Row + "+ New goal" Button */}
                <View style={styles.filterRow}>
                    {/* Left: Filter tabs (All, Active, Done) */}
                    <View style={styles.tabsContainer}>
                        {(['All', 'Active', 'Done'] as FilterType[]).map((tab) => {
                            const isSelected = selectedFilter === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedFilter(tab)}
                                    style={[
                                        styles.tabPill,
                                        isSelected ? styles.activeTabPill : styles.inactiveTabPill,
                                    ]}
                                >
                                    <CustomText
                                        style={[
                                            styles.tabText,
                                            isSelected ? styles.activeTabText : styles.inactiveTabText,
                                        ]}
                                    >
                                        {tab}
                                    </CustomText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Right: + New goal Button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setShowNewGoalModal(true)}
                        style={styles.newGoalButton}
                    >
                        <CustomText style={styles.newGoalButtonText}>+ New goal</CustomText>
                    </TouchableOpacity>
                </View>

                {/* Goals List, Loading, or Empty State */}
                {isApiLoading && goalsList.length === 0 ? (
                    <View style={{ paddingVertical: resAvarage(4), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.black} />
                    </View>
                ) : filteredGoals.length === 0 ? (
                    <EmptyGoalsCard
                        title="No goals here yet"
                        subtitle={
                            selectedFilter === 'Done'
                                ? 'Completed goals will appear here.'
                                : 'Create one to start tracking progress.'
                        }
                    />
                ) : (
                    filteredGoals.map((item) => (
                        <GoalCard
                            key={item.id.toString()}
                            item={item}
                            onMinusPress={handleMinusPress}
                            onPlusPress={handlePlusPress}
                            onAddContributionPress={handleAddContributionPress}
                            onToggleComplete={handleToggleComplete}
                            onDeletePress={handleDeletePress}
                        />
                    ))
                )}

                {/* Bottom Tip Banner Card */}
                <TipCard />
            </ScrollView>

            {/* Modal 1: Add New Goal */}
            <NewGoalModal
                visible={showNewGoalModal}
                onClose={() => setShowNewGoalModal(false)}
                onSuccess={loadGoals}
            />

            {/* Modal 2: Add Contribution */}
            <AddContributionModal
                visible={showContributionModal}
                goal={selectedGoal}
                onClose={() => {
                    setShowContributionModal(false);
                    setSelectedGoal(null);
                }}
                onSuccess={loadGoals}
            />

            {/* Modal 3: Add / Deduct Amount */}
            <AddAmountModal
                visible={showAddAmountModal}
                goal={selectedGoal}
                initialMode={addAmountMode}
                onClose={() => {
                    setShowAddAmountModal(false);
                    setSelectedGoal(null);
                }}
                onSuccess={loadGoals}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                setShow={setShowDeleteModal}
                title="Delete Goal"
                description={`Are you sure you want to delete "${goalToDelete?.title}"? This action cannot be undone.`}
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
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: resAvarage(1.8),
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
    },
    activeTabPill: {
        backgroundColor: '#0D0D0D',
    },
    inactiveTabPill: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    tabText: {
        fontSize: font13,
    },
    activeTabText: {
        color: '#FFFFFF',
        fontFamily: FontSemiBold,
    },
    inactiveTabText: {
        color: '#333333',
        fontFamily: FontMedium,
    },
    newGoalButton: {
        backgroundColor: colors.theme,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    newGoalButtonText: {
        fontSize: font13,
        fontFamily: FontBold,
        color: '#0D0D0D',
    },
});

