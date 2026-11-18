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
import { query } from '../../../../storage/local/sqlite';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { navigate } from '../../../../navigation/NavigationUtils';
import { useGetEmiLoansQuery } from '../../../../API';
import { ActivityIndicator } from 'react-native';

// Components
import EmiSummaryCard from './components/EmiSummaryCard';
import EmiLoanCard, { EmiLoanItem } from './components/EmiLoanCard';
import AddLoanModal from './components/AddLoanModal';
import EmptyGoalsCard from '../savingAndGoals/components/EmptyGoalsCard';
import { computeLoanStats } from './utils/emiCalculator';

type EmiFilterType = 'All' | 'Active' | 'Closed';

export default function EmiLoansScreen() {
    const route = useRoute<any>();
    const [loansList, setLoansList] = useState<EmiLoanItem[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<EmiFilterType>('All');
    const [refreshing, setRefreshing] = useState(false);
    const [showAddLoanModal, setShowAddLoanModal] = useState(false);

    // RTK Query integration
    const { data: apiLoansRes, isLoading: isApiLoading, refetch: refetchLoans } = useGetEmiLoansQuery(
        selectedFilter === 'All' ? undefined : { filter: selectedFilter }
    );

    useEffect(() => {
        if (route.params?.openAddLoan) {
            setShowAddLoanModal(true);
        }
    }, [route.params]);

    // Synchronize backend EMI loans
    useEffect(() => {
        if (apiLoansRes && Array.isArray(apiLoansRes.data)) {
            const apiLoans: EmiLoanItem[] = apiLoansRes.data.map((r: any) => ({
                id: r._id || r.id,
                title: r.name || r.title,
                lender: r.lender,
                amount: Number(r.amount) || 0,
                rate: Number(r.rate) || 0,
                tenure: Number(r.tenure) || 0,
                start_date: r.startDate ? new Date(r.startDate).toLocaleDateString('en-GB') : '',
                emi_amount: Number(r.monthlyEmi) || 0,
                paid_emis: Number(r.paidEmis) || 0,
                status: r.status === 'closed' || (r.tenure > 0 && r.paidEmis >= r.tenure) ? 'closed' : 'active',
                created_at: r.createdAt,
            }));
            setLoansList(apiLoans);
        }
    }, [apiLoansRes]);

    const loadLoans = useCallback(() => {
        try {
            const rows = query('SELECT * FROM emi_loans ORDER BY id DESC') || [];
            const formatted: EmiLoanItem[] = rows.map((r: any) => ({
                id: r.id,
                title: r.title,
                lender: r.lender,
                amount: Number(r.amount) || 0,
                rate: Number(r.rate) || 0,
                tenure: Number(r.tenure) || 0,
                start_date: r.start_date,
                emi_amount: Number(r.emi_amount) || 0,
                paid_emis: Number(r.paid_emis) || 0,
                status: r.status === 'closed' || (r.tenure > 0 && r.paid_emis >= r.tenure) ? 'closed' : 'active',
                created_at: r.created_at,
            }));
            setLoansList(prev => (prev.length > 0 ? prev : formatted));
        } catch (error) {
            console.error('[EmiLoansScreen] Failed to load loans:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadLoans();
            refetchLoans();
        }, [loadLoans, refetchLoans])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadLoans();
        refetchLoans().finally(() => setRefreshing(false));
    }, [loadLoans, refetchLoans]);

    // Computed totals across all loans
    const summaryData = useMemo(() => {
        let totalOutstanding = 0;
        let dueEveryMonth = 0;
        let activeCount = 0;
        let closedCount = 0;
        let totalBorrowed = 0;
        let totalInterest = 0;

        loansList.forEach((loan) => {
            const stats = computeLoanStats(
                loan.amount,
                loan.rate,
                loan.tenure,
                loan.start_date,
                loan.paid_emis
            );

            totalBorrowed += loan.amount;
            totalInterest += stats.totalInterest;

            const isClosed = loan.status === 'closed' || loan.paid_emis >= loan.tenure;
            if (isClosed) {
                closedCount++;
            } else {
                activeCount++;
                totalOutstanding += stats.outstanding;
                dueEveryMonth += stats.monthlyEmi;
            }
        });

        return {
            totalOutstanding,
            dueEveryMonth,
            activeCount,
            closedCount,
            totalBorrowed,
            totalInterest,
        };
    }, [loansList]);

    // Filtered loans list
    const filteredLoans = useMemo(() => {
        if (selectedFilter === 'Active') {
            return loansList.filter(
                (l) => l.status === 'active' && l.paid_emis < l.tenure
            );
        }
        if (selectedFilter === 'Closed') {
            return loansList.filter(
                (l) => l.status === 'closed' || (l.tenure > 0 && l.paid_emis >= l.tenure)
            );
        }
        return loansList;
    }, [loansList, selectedFilter]);

    const handleLoanPress = (loan: EmiLoanItem) => {
        navigate('EmiLoanDetail', { loanId: loan.id, loanItem: loan });
    };

    return (
        <CommonBg>
            <InsightHeader
                title="EMI & Loans"
                subtitle="Track your EMIs"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Top Black Summary Card */}
                <EmiSummaryCard
                    totalOutstanding={summaryData.totalOutstanding}
                    dueEveryMonth={summaryData.dueEveryMonth}
                    activeCount={summaryData.activeCount}
                    closedCount={summaryData.closedCount}
                    totalBorrowed={summaryData.totalBorrowed}
                    totalInterest={summaryData.totalInterest}
                />

                {/* Filter Tabs + "+ Add loan" Button */}
                <View style={styles.filterRow}>
                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        {(['All', 'Active', 'Closed'] as EmiFilterType[]).map((tab) => {
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

                    {/* + Add loan Button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setShowAddLoanModal(true)}
                        style={styles.addLoanButton}
                    >
                        <CustomText style={styles.addLoanButtonText}>+ Add loan</CustomText>
                    </TouchableOpacity>
                </View>

                {/* Loans List */}
                {isApiLoading && loansList.length === 0 ? (
                    <View style={{ paddingVertical: resAvarage(4), alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.black} />
                    </View>
                ) : filteredLoans.length === 0 ? (
                    <EmptyGoalsCard
                        title="No loans found"
                        subtitle={
                            selectedFilter === 'Closed'
                                ? 'Closed loans will appear here once fully repaid.'
                                : 'Add a loan to track repayments and amortization.'
                        }
                    />
                ) : (
                    filteredLoans.map((loan) => (
                        <EmiLoanCard
                            key={loan.id.toString()}
                            item={loan}
                            onPress={handleLoanPress}
                        />
                    ))
                )}
            </ScrollView>

            {/* Add Loan Modal */}
            <AddLoanModal
                visible={showAddLoanModal}
                onClose={() => setShowAddLoanModal(false)}
                onSuccess={loadLoans}
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
    addLoanButton: {
        backgroundColor: colors.theme,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addLoanButtonText: {
        fontSize: font13,
        fontFamily: FontBold,
        color: '#0D0D0D',
    },
});

