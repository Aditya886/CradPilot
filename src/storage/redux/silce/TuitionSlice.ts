import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReduxTuitionStudent {
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

export interface ReduxTuitionBatch {
    id: string;
    title: string;
    timing: string;
    days: string;
    classRange: string;
    studentsCount: number;
    attendanceMarked?: boolean;
    isToday?: boolean;
}

interface TuitionState {
    students: ReduxTuitionStudent[];
    batches: ReduxTuitionBatch[];
    selectedBatchId: string | null;
    dashboardStats: any;
    isLoading: boolean;
}

const initialState: TuitionState = {
    students: [],
    batches: [],
    selectedBatchId: null,
    dashboardStats: null,
    isLoading: false,
};

const tuitionSlice = createSlice({
    name: 'tuition',
    initialState,
    reducers: {
        setTuitionStudents(state, action: PayloadAction<ReduxTuitionStudent[]>) {
            state.students = action.payload;
        },
        addTuitionStudent(state, action: PayloadAction<ReduxTuitionStudent>) {
            const index = state.students.findIndex(s => s.id === action.payload.id);
            if (index >= 0) {
                state.students[index] = action.payload;
            } else {
                state.students.unshift(action.payload);
            }
        },
        removeTuitionStudent(state, action: PayloadAction<string>) {
            state.students = state.students.filter(s => s.id !== action.payload);
        },
        setTuitionBatches(state, action: PayloadAction<ReduxTuitionBatch[]>) {
            state.batches = action.payload;
        },
        addTuitionBatch(state, action: PayloadAction<ReduxTuitionBatch>) {
            state.batches.unshift(action.payload);
        },
        setSelectedBatchId(state, action: PayloadAction<string | null>) {
            state.selectedBatchId = action.payload;
        },
        setTuitionDashboard(state, action: PayloadAction<any>) {
            state.dashboardStats = action.payload;
        },
        setTuitionLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setTuitionStudents,
    addTuitionStudent,
    removeTuitionStudent,
    setTuitionBatches,
    addTuitionBatch,
    setSelectedBatchId,
    setTuitionDashboard,
    setTuitionLoading,
} = tuitionSlice.actions;

export const tuitionReducer = tuitionSlice.reducer;

