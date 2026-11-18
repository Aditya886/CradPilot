import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { CommonBg } from '../../../../ui/common/CommonBg';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontMedium } from '../../../../utils/fontFamily';
import { font10 } from '../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { navigate } from '../../../../navigation/NavigationUtils';
import InsightHeader from '../components/InsightHeader';
import {
    TuitionTotalCard,
    MonthlyStatsCards,
    TuitionQuickActions,
    UpcomingDuesCard,
    DueItem,
} from './components';
import ExportImportButton from '../../../../ui/components/ExportImportButton';
import ExportImportModal from '../../../../ui/modals/ExportImportModal';
import { ExportColumn } from '../../../../services/exportService';
import { importService } from '../../../../services/importService';
import { tuitionStorage } from '../../../../services/tuitionStorage';
import { useGetTuitionDashboardQuery } from '../../../../API';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch } from '../../../../API/hooks/ReduxHooks';
import { setTuitionDashboard } from '../../../../storage/redux/silce/TuitionSlice';

export default function TutionSection({ isHomeScreen }: any) {
    const dispatch = useAppDispatch();
    const [showFooter, setShowFooter] = useState(true);
    const [showExportModal, setShowExportModal] = useState(false);
    const [students, setStudents] = useState<any[]>([]);

    // Real API integration
    const { data: dashboardRes, refetch: refetchDashboard } = useGetTuitionDashboardQuery();

    const loadStudents = async () => {
        const data = await tuitionStorage.getStudents();
        setStudents(data);
    };

    React.useEffect(() => {
        if (dashboardRes?.data) {
            dispatch(setTuitionDashboard(dashboardRes.data));
        }
    }, [dashboardRes, dispatch]);

    useFocusEffect(
        React.useCallback(() => {
            loadStudents();
            refetchDashboard();
        }, [refetchDashboard])
    );

    React.useEffect(() => {
        loadStudents();
        const unsub = tuitionStorage.subscribe(() => {
            loadStudents();
        });
        return () => unsub();
    }, []);

    const dashboardData = dashboardRes?.data || {};
    const totalFeeCollected = dashboardData.totalFeeCollected || 0;
    const pendingAmount = dashboardData.pendingAmount || 0;
    const activeStudents = dashboardData.activeStudents || students.length || 0;
    const upcomingDues = dashboardData.upcomingDues || [];

    const handleAdd = () => {
        navigate('AddStudent');
    };

    const handleStudents = () => {
        navigate('Students');
    };

    const handlePending = () => {
        navigate('PendingFees');
    };

    const handleAttendance = () => {
        navigate('Attendance');
    };

    const handleBatches = () => {
        navigate('Batch');
    };

    const handleSeeAllDues = () => {
        navigate('PendingFees');
    };

    const handleDueItemPress = (item: DueItem) => {
        navigate('StudentDetails', {
            student: {
                id: String(item.id),
                name: item.name,
                classGrade: (item as any).classGrade || 'Class 10',
                parentName: (item as any).parentName || 'Parent of ' + item.name,
                phone: (item as any).phone || '',
                subjects: (item as any).subjects || [],
                batchName: (item as any).batchName || 'General',
                batchTiming: (item as any).batchTiming || '',
                feeAmount: item.amount,
                feePeriod: (item as any).feePeriod || 'month',
                feeStatus: item.status,
                dueInfo: item.dueDate,
                attendanceStatus: 'Not marked',
                isActive: true,
            },
        });
    };

    const handleAddPayment = (item: DueItem) => {
        navigate('PendingFees');
    };

    const tuitionColumns: ExportColumn[] = [
        { key: 'name', label: 'Student Name' },
        { key: 'classGrade', label: 'Class' },
        { key: 'batchName', label: 'Batch' },
        { key: 'feeAmount', label: 'Fee Amount (₹)', type: 'currency' },
        { key: 'feeStatus', label: 'Fee Status' },
        { key: 'phone', label: 'Phone' },
    ];

    return (
        <CommonBg>
            <InsightHeader
                title={"Tution Center"}
                subtitle={"Fees & Payments"}
                hideBack={isHomeScreen}
                rightComponent={
                    <ExportImportButton onPress={() => setShowExportModal(true)} />
                }
            />

            <ExportImportModal
                visible={showExportModal}
                onClose={() => setShowExportModal(false)}
                sectionTitle="Tuition Center Overview"
                sectionSubtitle="Students, Fees & Batches"
                exportColumns={tuitionColumns}
                exportRows={students}
                exportSummary={{
                    'Active Students': students.length,
                    'Total Monthly Fees': `₹${students.reduce((s, x) => s + (x.feeAmount || 0), 0).toLocaleString()}`,
                }}
                defaultFilename={`CredPilot_TuitionCenter_${new Date().toISOString().split('T')[0]}`}
                sampleImportFormat={`Student Name,Class,Batch,Fee Amount (₹),Fee Status,Phone\nAman Kumar,Class 10,Evening Seniors,2000,Overdue,99582 11870\nIshaan Gupta,Class 12,Board Prep,12000,Paid,88004 77211`}
                onImportData={async (rawInput) => {
                    const result = await importService.importStudents(rawInput);
                    await loadStudents();
                    return result;
                }}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, isHomeScreen && { paddingBottom: resAvarage(22) }]}
            >
                <TuitionTotalCard
                    totalFeeCollected={totalFeeCollected}
                    pendingAmount={pendingAmount}
                    activeStudents={activeStudents}
                />

                <MonthlyStatsCards
                    thisMonthCollected={totalFeeCollected}
                    thisMonthPending={pendingAmount}
                />

                <TuitionQuickActions
                    onPressAdd={handleAdd}
                    onPressStudents={handleStudents}
                    onPressPending={handlePending}
                    onPressAttendance={handleAttendance}
                    onPressBatches={handleBatches}
                />

                <UpcomingDuesCard
                    dues={upcomingDues}
                    onPressSeeAll={handleSeeAllDues}
                    onPressItem={handleDueItemPress}
                    onPressAddPayment={handleAddPayment}
                />

                {showFooter && (
                    <CustomText style={styles.footer}>
                        on-device · offline · private
                    </CustomText>
                )}
            </ScrollView>
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: resAvarage(3),
        paddingBottom: resAvarage(6),
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
        alignSelf: 'center',
    },
});