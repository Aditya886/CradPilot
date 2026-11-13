import AsyncStorageUtils from '../utils/storage';

const STUDENTS_KEY = '@credpilot_tuition_students';
const ATTENDANCE_KEY = '@credpilot_tuition_attendance_records';
const PENDING_FEES_KEY = '@credpilot_tuition_pending_fees';
const BATCHES_KEY = '@credpilot_tuition_batches';

export interface TuitionStudent {
    id: string;
    name: string;
    classGrade: string;
    parentName: string;
    phone: string;
    subjects: string[];
    batchName: string;
    batchTiming: string;
    feeAmount: number;
    feePeriod: string;
    feeStatus: string;
    dueInfo: string;
    attendanceStatus: string;
    isActive: boolean;
}

export interface TuitionAttendanceRecord {
    id: string;
    studentId: string;
    name: string;
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Absent';
    classGrade: string;
    batchName: string;
    selectedSubjects: string[];
    phone?: string;
    parentName?: string;
}

export interface TuitionPendingFee {
    id: string;
    name: string;
    classGrade: string;
    feeAmount: number;
    dueFormatted: string;
    statusType: 'overdue' | 'due_soon' | 'paid';
    daysText: string;
    category: 'this_month' | 'last_month' | 'overdue';
}

export interface TuitionBatch {
    id: string;
    name: string;
    timing: string;
    days: string;
    subject: string;
    grade: string;
    studentsCount: number;
    students: { id: string; name: string; avatarUrl?: string }[];
    maxCapacity: number;
    isActive: boolean;
}

// Initial fallback seeds
export const DEFAULT_STUDENTS: TuitionStudent[] = [
    {
        id: '1',
        name: 'Aman Kumar',
        classGrade: 'Class 10',
        parentName: 'Rekha Kumar',
        phone: '99582 11870',
        subjects: ['Mathematics', 'Physics'],
        batchName: 'Evening Seniors',
        batchTiming: '5:00 PM – 7:00 PM',
        feeAmount: 2000,
        feePeriod: 'month',
        feeStatus: 'Overdue',
        dueInfo: 'Next due 3 Oct',
        attendanceStatus: 'Not marked',
        isActive: true,
    },
    {
        id: '2',
        name: 'Ishaan Gupta',
        classGrade: 'Class 12',
        parentName: 'Meera Gupta',
        phone: '88004 77211',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        batchName: 'Board Prep',
        batchTiming: '7:30 PM – 9:00 PM',
        feeAmount: 12000,
        feePeriod: 'semester',
        feeStatus: 'Paid',
        dueInfo: 'Fully paid',
        attendanceStatus: 'Not marked',
        isActive: true,
    },
    {
        id: '3',
        name: 'Kabir Singh',
        classGrade: 'Class 6',
        parentName: 'Harpreet Singh',
        phone: '93120 55643',
        subjects: ['Mathematics'],
        batchName: 'Morning Juniors',
        batchTiming: '7:00 AM – 8:30 AM',
        feeAmount: 1200,
        feePeriod: 'month',
        feeStatus: 'Due Soon',
        dueInfo: 'Next due 20 Oct',
        attendanceStatus: 'Not marked',
        isActive: true,
    },
    {
        id: '4',
        name: 'Sneha Iyer',
        classGrade: 'Class 11',
        parentName: 'Venkatesh Iyer',
        phone: '98201 44321',
        subjects: ['Mathematics', 'Chemistry'],
        batchName: 'Evening Seniors',
        batchTiming: '5:00 PM – 7:00 PM',
        feeAmount: 10000,
        feePeriod: 'semester',
        feeStatus: 'Overdue',
        dueInfo: 'Next due 15 Sept',
        attendanceStatus: 'Not marked',
        isActive: true,
    },
    {
        id: '5',
        name: 'Rahul Sharma',
        classGrade: 'Class 9',
        parentName: 'Rajesh Sharma',
        phone: '98112 33455',
        subjects: ['Science', 'Mathematics'],
        batchName: 'Morning Juniors',
        batchTiming: '7:00 AM – 8:30 AM',
        feeAmount: 1500,
        feePeriod: 'month',
        feeStatus: 'Due Soon',
        dueInfo: 'Next due 17 Oct',
        attendanceStatus: 'Not marked',
        isActive: true,
    },
    {
        id: '6',
        name: 'Priya Patel',
        classGrade: 'Class 10',
        parentName: 'Suresh Patel',
        phone: '98765 12340',
        subjects: ['English', 'Social Science'],
        batchName: 'Evening Seniors',
        batchTiming: '4:00 PM – 5:30 PM',
        feeAmount: 1800,
        feePeriod: 'month',
        feeStatus: 'Paid',
        dueInfo: 'Fully paid',
        attendanceStatus: 'Not marked',
        isActive: true,
    },
];

type TuitionChangeListener = () => void;
const listeners: Set<TuitionChangeListener> = new Set();

export const tuitionStorage = {
    subscribe(listener: TuitionChangeListener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    notifyListeners() {
        listeners.forEach(cb => {
            try {
                cb();
            } catch (e) {
                console.error('[tuitionStorage] Listener error:', e);
            }
        });
    },

    async getStudents(): Promise<TuitionStudent[]> {
        try {
            const data = await AsyncStorageUtils.getItem(STUDENTS_KEY);
            if (data && Array.isArray(data) && data.length > 0) {
                return data;
            }
        } catch (e) {
            console.error('[tuitionStorage] getStudents error:', e);
        }
        return DEFAULT_STUDENTS;
    },

    async saveStudents(students: TuitionStudent[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(STUDENTS_KEY, students);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] saveStudents error:', e);
        }
    },

    async addOrUpdateStudent(student: TuitionStudent): Promise<void> {
        const current = await this.getStudents();
        const existingIndex = current.findIndex(s => s.id === student.id || s.name.toLowerCase() === student.name.toLowerCase());
        let updated: TuitionStudent[];
        if (existingIndex >= 0) {
            updated = [...current];
            updated[existingIndex] = { ...updated[existingIndex], ...student };
        } else {
            updated = [student, ...current];
        }
        await this.saveStudents(updated);
    },

    async getPendingFees(): Promise<TuitionPendingFee[]> {
        try {
            const data = await AsyncStorageUtils.getItem(PENDING_FEES_KEY);
            if (data && Array.isArray(data) && data.length > 0) {
                return data;
            }
        } catch (e) {
            console.error('[tuitionStorage] getPendingFees error:', e);
        }
        // Generate from students with overdue / due soon
        const students = await this.getStudents();
        return students.map(s => ({
            id: s.id,
            name: s.name,
            classGrade: s.classGrade,
            feeAmount: s.feeAmount,
            dueFormatted: s.dueInfo || 'Due soon',
            statusType: (s.feeStatus.toLowerCase().includes('overdue') ? 'overdue' : s.feeStatus.toLowerCase().includes('paid') ? 'paid' : 'due_soon') as any,
            daysText: s.dueInfo || 'Due this month',
            category: s.feeStatus.toLowerCase().includes('overdue') ? 'overdue' : 'this_month',
        }));
    },

    async savePendingFees(fees: TuitionPendingFee[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(PENDING_FEES_KEY, fees);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] savePendingFees error:', e);
        }
    },

    async getAttendanceRecords(): Promise<TuitionAttendanceRecord[]> {
        try {
            const data = await AsyncStorageUtils.getItem(ATTENDANCE_KEY);
            if (data && Array.isArray(data)) {
                return data;
            }
        } catch (e) {
            console.error('[tuitionStorage] getAttendanceRecords error:', e);
        }
        return [];
    },

    async saveAttendanceRecords(records: TuitionAttendanceRecord[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(ATTENDANCE_KEY, records);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] saveAttendanceRecords error:', e);
        }
    },

    async getBatches(): Promise<TuitionBatch[]> {
        try {
            const data = await AsyncStorageUtils.getItem(BATCHES_KEY);
            if (data && Array.isArray(data) && data.length > 0) {
                return data;
            }
        } catch (e) {
            console.error('[tuitionStorage] getBatches error:', e);
        }
        return [];
    },

    async saveBatches(batches: TuitionBatch[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(BATCHES_KEY, batches);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] saveBatches error:', e);
        }
    },
};
