import { query, getAll, insert, clearTable } from '../storage/local/sqlite';
import { tuitionStorage } from './tuitionStorage';
import { exportService, ExportColumn } from './exportService';
import { importService, ImportParseResult } from './importService';

export const fullBackupService = {
    /**
     * Gather all data across the entire app for complete backup export
     */
    async collectAllAppData(): Promise<{
        allData: Record<string, any>;
        flattenedRows: Record<string, any>[];
        summary: Record<string, string | number>;
    }> {
        const borrowers = query('SELECT * FROM borrowers') || [];
        const loans = query('SELECT * FROM loans') || [];
        const payments = query('SELECT * FROM payments') || [];
        const goals = query('SELECT * FROM goals') || [];
        const debtPersons = query('SELECT * FROM debt_persons') || [];
        const debtTransactions = query('SELECT * FROM debt_transactions') || [];
        const plans = query('SELECT * FROM plans') || [];
        const planMembers = query('SELECT * FROM plan_members') || [];
        const planSpends = query('SELECT * FROM plan_spends') || [];

        const tuitionStudents = await tuitionStorage.getStudents();
        const tuitionAttendance = await tuitionStorage.getAttendanceRecords();
        const tuitionPending = await tuitionStorage.getPendingFees();

        const allData = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            borrowers,
            loans,
            payments,
            goals,
            debt_persons: debtPersons,
            debt_transactions: debtTransactions,
            plans,
            plan_members: planMembers,
            plan_spends: planSpends,
            tuition_students: tuitionStudents,
            tuition_attendance: tuitionAttendance,
            tuition_pending_fees: tuitionPending,
        };

        // Create flattened tabular rows for Excel & PDF report
        const flattenedRows: Record<string, any>[] = [];

        // 1. Tuition students
        tuitionStudents.forEach(s => {
            flattenedRows.push({
                section: 'Tuition Center',
                itemType: 'Student',
                name: s.name,
                category: s.classGrade,
                amount: s.feeAmount,
                status: s.feeStatus,
                dateOrInfo: s.dueInfo || s.batchName,
            });
        });

        // 2. Plans & Trips
        plans.forEach(p => {
            flattenedRows.push({
                section: 'Plans & Trips',
                itemType: p.type || 'Plan',
                name: p.title,
                category: p.type,
                amount: p.total,
                status: 'Active',
                dateOrInfo: p.created_at || 'Trip Budget',
            });
        });

        // 3. Plan Spends
        planSpends.forEach(s => {
            flattenedRows.push({
                section: 'Plans & Trips',
                itemType: 'Expense',
                name: s.title,
                category: `Paid by ${s.paid_by}`,
                amount: s.amount,
                status: 'Spent',
                dateOrInfo: s.date,
            });
        });

        // 4. Debts
        debtPersons.forEach(d => {
            flattenedRows.push({
                section: 'Debts & Credit',
                itemType: 'Contact',
                name: d.name,
                category: d.phone,
                amount: 0,
                status: 'Tracked',
                dateOrInfo: d.created_at,
            });
        });

        debtTransactions.forEach(t => {
            flattenedRows.push({
                section: 'Debts & Credit',
                itemType: 'Transaction',
                name: `Txn #${t.id}`,
                category: t.type,
                amount: t.amount,
                status: t.mode,
                dateOrInfo: t.date,
            });
        });

        // 5. Loans
        loans.forEach(l => {
            flattenedRows.push({
                section: 'Loans & EMI',
                itemType: 'Loan',
                name: l.title,
                category: `${l.rate}% ${l.rate_period}`,
                amount: l.amount,
                status: l.status,
                dateOrInfo: l.loan_date,
            });
        });

        const totalTuitionFees = tuitionStudents.reduce((sum, s) => sum + (s.feeAmount || 0), 0);
        const totalTripBudgets = plans.reduce((sum, p) => sum + (p.total || 0), 0);
        const totalLoans = loans.reduce((sum, l) => sum + (l.amount || 0), 0);

        const summary: Record<string, string | number> = {
            'Total Active Students': tuitionStudents.length,
            'Total Tuition Monthly Fees': `₹${totalTuitionFees.toLocaleString()}`,
            'Total Plans & Trips': plans.length,
            'Total Plans Budget': `₹${totalTripBudgets.toLocaleString()}`,
            'Total Debt Contacts': debtPersons.length,
            'Total Loans Amount': `₹${totalLoans.toLocaleString()}`,
            'Total Unified Records': flattenedRows.length,
        };

        return { allData, flattenedRows, summary };
    },

    getColumns(): ExportColumn[] {
        return [
            { key: 'section', label: 'Section' },
            { key: 'itemType', label: 'Type' },
            { key: 'name', label: 'Title / Name' },
            { key: 'category', label: 'Category / Detail' },
            { key: 'amount', label: 'Amount (₹)', type: 'currency' },
            { key: 'status', label: 'Status' },
            { key: 'dateOrInfo', label: 'Date / Info' },
        ];
    },

    getSampleBackupFormat(): string {
        return `Section,Type,Title / Name,Category / Detail,Amount (₹),Status,Date / Info
Tuition Center,Student,Aman Kumar,Class 10,2000,Overdue,Next due 3 Oct
Tuition Center,Student,Ishaan Gupta,Class 12,12000,Paid,Fully paid
Plans & Trips,Group,Goa Trip,Group,25000,Active,2026-10-20
Plans & Trips,Expense,Hotel Booking,Paid by Rahul,8500,Spent,2026-10-18
Debts & Credit,Contact,Ramesh Patel,+91 98765 43210,1500,outgoing,2026-10-15`;
    },
};
