import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    RefreshControl,
} from 'react-native';
import { CommonBg } from '../../../ui/common/CommonBg';
import InsightHeader from './components/InsightHeader';
import CustomText from '../../../ui/components/CustomText';
import { colors } from '../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../utils/fontFamily';
import { font10, font11, font12, font13, font14, font15, font16, font20, font26 } from '../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../utils/responsive';
import { formatINR } from '../../../utils/FormatUtil';
import { query } from '../../../storage/local/sqlite';
import { tuitionStorage } from '../../../services/tuitionStorage';
import { useFocusEffect } from '@react-navigation/native';
import { computeLoanStats } from './emiLoans/utils/emiCalculator';
import { useGetInsightsOverviewQuery } from '../../../API';
import { ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type InsightSectionFilter = 'All' | 'Finance' | 'Tuition' | 'Debts' | 'EMIs' | 'Plans' | 'Goals';

const TrendingUpIcon = ({ color = colors.theme }: { color?: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 6H23V12" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const TrendingDownIcon = ({ color = '#EF4444' }: { color?: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M17 18H23V12" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function Insights() {
    const [selectedFilter, setSelectedFilter] = useState<InsightSectionFilter>('All');
    const [refreshing, setRefreshing] = useState(false);

    // RTK Query Insights integration
    const { data: insightsRes, isLoading: isApiLoading, refetch: refetchInsights } = useGetInsightsOverviewQuery(
        selectedFilter === 'All' ? undefined : { section: selectedFilter }
    );

    // Section metrics state
    const [financeData, setFinanceData] = useState({
        totalLent: 0,
        principalRecovered: 0,
        interestEarned: 0,
        outstanding: 0,
        borrowersCount: 0,
    });

    const [tuitionData, setTuitionData] = useState({
        totalRevenue: 0,
        collected: 0,
        pending: 0,
        studentsCount: 0,
        batchesCount: 0,
    });

    const [debtsData, setDebtsData] = useState({
        incoming: 0,
        outgoing: 0,
        net: 0,
        personsCount: 0,
    });

    const [emiData, setEmiData] = useState({
        totalBorrowed: 0,
        totalInterest: 0,
        outstanding: 0,
        monthlyCommitment: 0,
        loansCount: 0,
    });

    const [plansData, setPlansData] = useState({
        totalBudget: 0,
        totalSpent: 0,
        plansCount: 0,
    });

    const [goalsData, setGoalsData] = useState({
        totalTarget: 0,
        totalSaved: 0,
        goalsCount: 0,
    });

    // Synchronize backend insights when available
    useEffect(() => {
        if (insightsRes && insightsRes.data) {
            const d = insightsRes.data;
            if (d.finance) setFinanceData(prev => ({ ...prev, ...d.finance }));
            if (d.tuition) setTuitionData(prev => ({ ...prev, ...d.tuition }));
            if (d.debts) setDebtsData(prev => ({ ...prev, ...d.debts }));
            if (d.emi) setEmiData(prev => ({ ...prev, ...d.emi }));
            if (d.plans) setPlansData(prev => ({ ...prev, ...d.plans }));
            if (d.goals) setGoalsData(prev => ({ ...prev, ...d.goals }));
        }
    }, [insightsRes]);

    const loadAllInsights = useCallback(async () => {
        try {
            // 1. Finance & Loans
            const allLoans = query('SELECT * FROM loans') || [];
            const allPayments = query('SELECT * FROM payments') || [];
            const allBorrowers = query('SELECT * FROM borrowers') || [];

            const totalLent = allLoans.reduce((sum: number, l: any) => sum + (Number(l.amount) || 0), 0);
            const interestEarned = allPayments.reduce((sum: number, p: any) => sum + (Number(p.to_interest) || 0), 0);
            const principalRecovered = allPayments.reduce((sum: number, p: any) => sum + (Number(p.to_principal) || 0), 0);
            const financeOutstanding = Math.max(0, totalLent - principalRecovered);

            setFinanceData({
                totalLent,
                principalRecovered,
                interestEarned,
                outstanding: financeOutstanding,
                borrowersCount: allBorrowers.length,
            });

            // 2. Tuition Center
            try {
                const students = await tuitionStorage.getStudents();
                const pendingFees = await tuitionStorage.getPendingFees();
                const batches = await tuitionStorage.getBatches();

                const totalStudentFees = students.reduce((sum: number, s: any) => sum + (Number(s.feeAmount) || 0), 0);
                const totalPending = pendingFees.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
                const collected = Math.max(0, totalStudentFees - totalPending);

                setTuitionData({
                    totalRevenue: totalStudentFees,
                    collected,
                    pending: totalPending,
                    studentsCount: students.length,
                    batchesCount: batches.length,
                });
            } catch (err) { }

            // 3. Debts Ledger
            const debtPersons = query('SELECT * FROM debt_persons') || [];
            const debtTxns = query('SELECT * FROM debt_transactions') || [];

            let debtsIncoming = 0;
            let debtsOutgoing = 0;
            debtTxns.forEach((t: any) => {
                const amt = Number(t.amount) || 0;
                if (t.type === 'incoming') debtsIncoming += amt;
                else if (t.type === 'outgoing') debtsOutgoing += amt;
            });

            setDebtsData({
                incoming: debtsIncoming,
                outgoing: debtsOutgoing,
                net: debtsIncoming - debtsOutgoing,
                personsCount: debtPersons.length,
            });

            // 4. EMI & Loans
            const emiLoans = query('SELECT * FROM emi_loans') || [];
            let emiTotalBorrowed = 0;
            let emiTotalInterest = 0;
            let emiTotalOutstanding = 0;
            let emiMonthly = 0;

            emiLoans.forEach((l: any) => {
                const stats = computeLoanStats(
                    Number(l.amount) || 0,
                    Number(l.rate) || 0,
                    Number(l.tenure) || 0,
                    l.start_date || '',
                    Number(l.paid_emis) || 0
                );
                emiTotalBorrowed += Number(l.amount) || 0;
                emiTotalInterest += stats.totalInterest;
                if (l.status !== 'closed' && l.paid_emis < l.tenure) {
                    emiTotalOutstanding += stats.outstanding;
                    emiMonthly += stats.monthlyEmi;
                }
            });

            setEmiData({
                totalBorrowed: emiTotalBorrowed,
                totalInterest: emiTotalInterest,
                outstanding: emiTotalOutstanding,
                monthlyCommitment: emiMonthly,
                loansCount: emiLoans.length,
            });

            // 5. Plans & Trips
            const plans = query('SELECT * FROM plans') || [];
            const planSpends = query('SELECT * FROM plan_spends') || [];
            const plansBudget = plans.reduce((sum: number, p: any) => sum + (Number(p.total) || 0), 0);
            const plansSpent = planSpends.reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);

            setPlansData({
                totalBudget: plansBudget,
                totalSpent: plansSpent,
                plansCount: plans.length,
            });

            // 6. Savings & Goals
            const goals = query('SELECT * FROM goals') || [];
            const goalsTarget = goals.reduce((sum: number, g: any) => sum + (Number(g.target) || 0), 0);
            const goalsSaved = goals.reduce((sum: number, g: any) => sum + (Number(g.saved) || 0), 0);

            setGoalsData({
                totalTarget: goalsTarget,
                totalSaved: goalsSaved,
                goalsCount: goals.length,
            });
        } catch (error) {
            console.error('[Insights] Failed to load metrics:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadAllInsights();
            refetchInsights();
        }, [loadAllInsights, refetchInsights])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadAllInsights();
        refetchInsights().finally(() => setRefreshing(false));
    }, [loadAllInsights, refetchInsights]);

    // Overall Profit or Loss calculation:
    // Earnings/Inflow: Finance Interest Earned + Tuition Fees Collected + Incoming Debts Received
    // Expenses/Outflow: Plan Spends + EMI Interest (paid/incurred) + Outgoing Debts Lent
    const overallPL = useMemo(() => {
        const totalInflow = financeData.interestEarned + tuitionData.collected + debtsData.incoming;
        const totalOutflow = plansData.totalSpent + emiData.totalInterest + debtsData.outgoing;
        const net = totalInflow - totalOutflow;
        const isProfit = net >= 0;

        return {
            totalInflow,
            totalOutflow,
            net,
            isProfit,
        };
    }, [financeData, tuitionData, debtsData, plansData, emiData]);

    const filters: InsightSectionFilter[] = ['All', 'Finance', 'Tuition', 'Debts', 'EMIs', 'Plans', 'Goals'];

    return (
        <CommonBg>
            <InsightHeader
                title="Financial Insights"
                subtitle="Overall profit/loss"
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* 1. OVERALL NET POSITION (PROFIT OR LOSS) */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryTopRow}>
                        <CustomText style={styles.summaryLabel}>OVERALL NET POSITION</CustomText>
                        <View style={[styles.plBadge, overallPL.isProfit ? styles.profitBadge : styles.lossBadge]}>
                            {overallPL.isProfit ? <TrendingUpIcon /> : <TrendingDownIcon />}
                            <CustomText style={[styles.plBadgeText, overallPL.isProfit ? styles.profitText : styles.lossText]}>
                                {overallPL.isProfit ? 'NET PROFIT' : 'NET LOSS'}
                            </CustomText>
                        </View>
                    </View>

                    <CustomText style={[styles.netAmount, overallPL.isProfit ? styles.profitAmountText : styles.lossAmountText]}>
                        {overallPL.isProfit ? '+' : '-'}{formatINR(Math.abs(overallPL.net))}
                    </CustomText>

                    {/* Breakdown Inflow vs Outflow */}
                    <View style={styles.flowRow}>
                        <View style={styles.flowBox}>
                            <CustomText style={styles.flowLabel}>TOTAL INFLOW / EARNED</CustomText>
                            <CustomText style={styles.flowValue}>{formatINR(overallPL.totalInflow)}</CustomText>
                            <CustomText style={styles.flowHint}>Interest, Tuition, Receivables</CustomText>
                        </View>

                        <View style={styles.flowBox}>
                            <CustomText style={styles.flowLabel}>TOTAL OUTFLOW / EXPENSES</CustomText>
                            <CustomText style={styles.flowValue}>{formatINR(overallPL.totalOutflow)}</CustomText>
                            <CustomText style={styles.flowHint}>Trips, EMI Interest, Payables</CustomText>
                        </View>
                    </View>
                </View>

                {/* 2. SECTION FILTERS */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScroll}
                >
                    {filters.map((f) => {
                        const isSelected = selectedFilter === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                activeOpacity={0.8}
                                onPress={() => setSelectedFilter(f)}
                                style={[
                                    styles.filterTab,
                                    isSelected ? styles.activeFilterTab : styles.inactiveFilterTab,
                                ]}
                            >
                                <CustomText
                                    style={[
                                        styles.filterTabText,
                                        isSelected ? styles.activeFilterTabText : styles.inactiveFilterTabText,
                                    ]}
                                >
                                    {f}
                                </CustomText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* 3. SECTION-WISE BREAKDOWN CARDS */}

                {/* SECTION: FINANCE & LOANS */}
                {(selectedFilter === 'All' || selectedFilter === 'Finance') && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <CustomText style={styles.sectionTitle}>Finance & Loans (Lending)</CustomText>
                            <View style={[styles.sectionPill, { backgroundColor: '#E0F2FE' }]}>
                                <CustomText style={[styles.sectionPillText, { color: '#0284C7' }]}>
                                    Profit: {formatINR(financeData.interestEarned)}
                                </CustomText>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>INTEREST EARNED</CustomText>
                                <CustomText style={[styles.metricValue, { color: colors.theme }]}>
                                    {formatINR(financeData.interestEarned)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>TOTAL LENT</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(financeData.totalLent)}</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>PRINCIPAL RECOVERED</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(financeData.principalRecovered)}</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>OUTSTANDING DUE</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(financeData.outstanding)}</CustomText>
                            </View>
                        </View>
                    </View>
                )}

                {/* SECTION: TUITION CENTER */}
                {(selectedFilter === 'All' || selectedFilter === 'Tuition') && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <CustomText style={styles.sectionTitle}>Tuition Center</CustomText>
                            <View style={[styles.sectionPill, { backgroundColor: colors.black }]}>
                                <CustomText style={[styles.sectionPillText, { color: colors.theme }]}>
                                    Collected: {formatINR(tuitionData.collected)}
                                </CustomText>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>FEES COLLECTED</CustomText>
                                <CustomText style={[styles.metricValue, { color: colors.theme }]}>
                                    {formatINR(tuitionData.collected)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>PENDING DUES</CustomText>
                                <CustomText style={[styles.metricValue, { color: '#EF4444' }]}>
                                    {formatINR(tuitionData.pending)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>TOTAL REVENUE EXPECTED</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(tuitionData.totalRevenue)}</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>ACTIVE ENROLLED</CustomText>
                                <CustomText style={styles.metricValue}>{tuitionData.studentsCount} Students</CustomText>
                            </View>
                        </View>
                    </View>
                )}

                {/* SECTION: DEBTS LEDGER */}
                {(selectedFilter === 'All' || selectedFilter === 'Debts') && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <CustomText style={styles.sectionTitle}>Debts Ledger</CustomText>
                            <View style={[styles.sectionPill, { backgroundColor: debtsData.net >= 0 ? colors.black : '#FEE2E2' }]}>
                                <CustomText style={[styles.sectionPillText, { color: debtsData.net >= 0 ? colors.theme : '#DC2626' }]}>
                                    Net: {debtsData.net >= 0 ? '+' : ''}{formatINR(debtsData.net)}
                                </CustomText>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>INCOMING (RECEIVED)</CustomText>
                                <CustomText style={[styles.metricValue, { color: colors.theme }]}>
                                    {formatINR(debtsData.incoming)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>OUTGOING (GIVEN)</CustomText>
                                <CustomText style={[styles.metricValue, { color: '#EF4444' }]}>
                                    {formatINR(debtsData.outgoing)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>NET BALANCE</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(debtsData.net)}</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>RECORDED PERSONS</CustomText>
                                <CustomText style={styles.metricValue}>{debtsData.personsCount} People</CustomText>
                            </View>
                        </View>
                    </View>
                )}

                {/* SECTION: EMI & LOANS */}
                {(selectedFilter === 'All' || selectedFilter === 'EMIs') && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <CustomText style={styles.sectionTitle}>EMI & Loans (Borrowings)</CustomText>
                            <View style={[styles.sectionPill, { backgroundColor: '#FEE2E2' }]}>
                                <CustomText style={[styles.sectionPillText, { color: '#DC2626' }]}>
                                    Interest: {formatINR(emiData.totalInterest)}
                                </CustomText>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>OUTSTANDING PRINCIPAL</CustomText>
                                <CustomText style={[styles.metricValue, { color: '#EF4444' }]}>
                                    {formatINR(emiData.outstanding)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>MONTHLY EMI COMMITTED</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(emiData.monthlyCommitment)}/mo</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>TOTAL BORROWED</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(emiData.totalBorrowed)}</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>TOTAL INTEREST CHARGES</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(emiData.totalInterest)}</CustomText>
                            </View>
                        </View>
                    </View>
                )}

                {/* SECTION: PLANS & TRIPS */}
                {(selectedFilter === 'All' || selectedFilter === 'Plans') && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <CustomText style={styles.sectionTitle}>Plans & Trips</CustomText>
                            <View style={[styles.sectionPill, { backgroundColor: '#F3F4F6' }]}>
                                <CustomText style={[styles.sectionPillText, { color: '#4B5563' }]}>
                                    Spent: {formatINR(plansData.totalSpent)}
                                </CustomText>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>TOTAL SPENT</CustomText>
                                <CustomText style={[styles.metricValue, { color: '#EF4444' }]}>
                                    {formatINR(plansData.totalSpent)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>PLANNED BUDGET</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(plansData.totalBudget)}</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>BUDGET REMAINING</CustomText>
                                <CustomText style={styles.metricValue}>
                                    {formatINR(Math.max(0, plansData.totalBudget - plansData.totalSpent))}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>ACTIVE PLANS</CustomText>
                                <CustomText style={styles.metricValue}>{plansData.plansCount} Plans</CustomText>
                            </View>
                        </View>
                    </View>
                )}

                {/* SECTION: SAVINGS & GOALS */}
                {(selectedFilter === 'All' || selectedFilter === 'Goals') && (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <CustomText style={styles.sectionTitle}>Savings & Goals</CustomText>
                            <View style={[styles.sectionPill, { backgroundColor: colors.theme }]}>
                                <CustomText style={[styles.sectionPillText, { color: '#0D0D0D' }]}>
                                    Saved: {formatINR(goalsData.totalSaved)}
                                </CustomText>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>TOTAL SAVED</CustomText>
                                <CustomText style={[styles.metricValue, { color: colors.theme }]}>
                                    {formatINR(goalsData.totalSaved)}
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>TARGETED AMOUNT</CustomText>
                                <CustomText style={styles.metricValue}>{formatINR(goalsData.totalTarget)}</CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>ACHIEVED</CustomText>
                                <CustomText style={styles.metricValue}>
                                    {goalsData.totalTarget > 0 ? Math.round((goalsData.totalSaved / goalsData.totalTarget) * 100) : 0}%
                                </CustomText>
                            </View>
                            <View style={styles.metricBox}>
                                <CustomText style={styles.metricLabel}>ACTIVE GOALS</CustomText>
                                <CustomText style={styles.metricValue}>{goalsData.goalsCount} Goals</CustomText>
                            </View>
                        </View>
                    </View>
                )}

                <CustomText style={styles.footer}>on-device · offline · private</CustomText>
            </ScrollView>
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: resAvarage(3),
        paddingBottom: resAvarage(12),
    },
    summaryCard: {
        backgroundColor: '#0D0D0D',
        borderRadius: resAvarage(5),
        paddingHorizontal: resWidth(5),
        paddingVertical: resAvarage(3),
        marginBottom: resAvarage(2),
    },
    summaryTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    summaryLabel: {
        fontSize: font11,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    plBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
    },
    profitBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    lossBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    plBadgeText: {
        fontSize: font11,
        fontFamily: FontBold,
    },
    profitText: {
        color: colors.theme,
    },
    lossText: {
        color: '#EF4444',
    },
    netAmount: {
        fontSize: font26,
        fontFamily: FontBold,
        marginVertical: 4,
    },
    profitAmountText: {
        color: colors.theme,
    },
    lossAmountText: {
        color: '#EF4444',
    },
    flowRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#202020',
    },
    flowBox: {
        flex: 1,
    },
    flowLabel: {
        fontSize: font10,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    flowValue: {
        fontSize: font16,
        fontFamily: FontBold,
        color: '#FFFFFF',
    },
    flowHint: {
        fontSize: font10,
        fontFamily: FontRegular,
        color: '#666666',
        marginTop: 2,
    },
    filtersScroll: {
        flexDirection: 'row',
        gap: 8,
        marginVertical: resAvarage(1.8),
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    activeFilterTab: {
        backgroundColor: '#0D0D0D',
    },
    inactiveFilterTab: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    filterTabText: {
        fontSize: font13,
    },
    activeFilterTabText: {
        color: '#FFFFFF',
        fontFamily: FontSemiBold,
    },
    inactiveFilterTabText: {
        color: '#333333',
        fontFamily: FontMedium,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(4.5),
        borderWidth: 1,
        borderColor: '#ECECEC',
        padding: resWidth(4.5),
        marginBottom: resAvarage(2),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: font16,
        fontFamily: FontBold,
        color: '#141414',
    },
    sectionPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    sectionPillText: {
        fontSize: font11,
        fontFamily: FontBold,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    metricBox: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    metricLabel: {
        fontSize: font10,
        fontFamily: FontMedium,
        color: '#8E8E93',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: font15,
        fontFamily: FontBold,
        color: '#141414',
    },
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: '100%',
        marginTop: resAvarage(2),
        fontSize: font10,
        marginBottom: resAvarage(5),
        color: colors.black60,
        fontFamily: FontMedium,
    },
});
