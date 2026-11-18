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

type StorageListener = () => void;

class TuitionStorageService {
    private listeners: Set<StorageListener> = new Set();

    subscribe(listener: StorageListener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(cb => {
            try {
                cb();
            } catch (e) {
                console.error('[tuitionStorage] listener error:', e);
            }
        });
    }

    async getStudents(): Promise<TuitionStudent[]> {
        try {
            const data = await AsyncStorageUtils.getItem(STUDENTS_KEY);
            if (data && Array.isArray(data)) {
                return data;
            }
        } catch (e) {
            console.error('[tuitionStorage] getStudents error:', e);
        }
        return [];
    }

    async saveStudents(students: TuitionStudent[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(STUDENTS_KEY, students);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] saveStudents error:', e);
        }
    }

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
    }

    async getPendingFees(): Promise<TuitionPendingFee[]> {
        try {
            const data = await AsyncStorageUtils.getItem(PENDING_FEES_KEY);
            if (data && Array.isArray(data) && data.length > 0) {
                return data;
            }
        } catch (e) {
            console.error('[tuitionStorage] getPendingFees error:', e);
        }
        const students = await this.getStudents();
        return students
            .filter(s => s.feeStatus && s.feeStatus.toLowerCase() !== 'paid')
            .map(s => ({
                id: s.id,
                name: s.name,
                classGrade: s.classGrade,
                feeAmount: s.feeAmount,
                dueFormatted: s.dueInfo || 'Due soon',
                statusType: (s.feeStatus.toLowerCase().includes('overdue') ? 'overdue' : 'due_soon') as any,
                daysText: s.dueInfo || 'Due this month',
                category: s.feeStatus.toLowerCase().includes('overdue') ? 'overdue' : 'this_month',
            }));
    }

    async savePendingFees(fees: TuitionPendingFee[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(PENDING_FEES_KEY, fees);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] savePendingFees error:', e);
        }
    }

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
    }

    async saveAttendanceRecords(records: TuitionAttendanceRecord[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(ATTENDANCE_KEY, records);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] saveAttendanceRecords error:', e);
        }
    }

    async getBatches(): Promise<TuitionBatch[]> {
        try {
            const data = await AsyncStorageUtils.getItem(BATCHES_KEY);
            if (data && Array.isArray(data)) {
                return data;
            }
        } catch (e) {
            console.error('[tuitionStorage] getBatches error:', e);
        }
        return [];
    }

    async saveBatches(batches: TuitionBatch[]): Promise<void> {
        try {
            await AsyncStorageUtils.setItem(BATCHES_KEY, batches);
            this.notifyListeners();
        } catch (e) {
            console.error('[tuitionStorage] saveBatches error:', e);
        }
    }
}

export const tuitionStorage = new TuitionStorageService();
