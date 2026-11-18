import { baseApi } from './BaseApi';
import { createGet, createPost } from './Helper';

export const tuitionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTuitionDashboard: builder.query<any, void>({
            ...createGet('tuition/dashboard'),
            providesTags: ['Tuition'],
        }),
        getStudents: builder.query<any, any>({
            ...createGet('tuition/students'),
            providesTags: ['Tuition'],
        }),
        getStudentDetail: builder.query<any, string>({
            query: (id: string) => ({
                url: `tuition/students/${id}`,
            }),
            providesTags: ['Tuition'],
        }),
        createStudent: builder.mutation<any, any>({
            ...createPost('tuition/students'),
            invalidatesTags: ['Tuition', 'Insights', 'Subscription'],
        }),
        recordTuitionPayment: builder.mutation<any, { studentId: string; body: any }>({
            query: ({ studentId, body }) => ({
                url: `tuition/students/${studentId}/payments`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Tuition', 'Insights'],
        }),
        getPendingFees: builder.query<any, any>({
            ...createGet('tuition/pending-fees'),
            providesTags: ['Tuition'],
        }),
        getBatches: builder.query<any, any>({
            ...createGet('tuition/batches'),
            providesTags: ['Tuition'],
        }),
        createBatch: builder.mutation<any, any>({
            ...createPost('tuition/batches'),
            invalidatesTags: ['Tuition'],
        }),
        rescheduleBatch: builder.mutation<any, { batchId: string; body: any }>({
            query: ({ batchId, body }) => ({
                url: `tuition/batches/${batchId}/reschedule`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Tuition'],
        }),
        recordTeacherLeave: builder.mutation<any, { batchId: string; body: any }>({
            query: ({ batchId, body }) => ({
                url: `tuition/batches/${batchId}/teacher-leave`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Tuition'],
        }),
        getAttendance: builder.query<any, any>({
            ...createGet('tuition/attendance'),
            providesTags: ['Tuition'],
        }),
        batchMarkAttendance: builder.mutation<any, any>({
            ...createPost('tuition/attendance/batch-mark'),
            invalidatesTags: ['Tuition'],
        }),
    }),
});

export const {
    useGetTuitionDashboardQuery,
    useGetStudentsQuery,
    useGetStudentDetailQuery,
    useCreateStudentMutation,
    useRecordTuitionPaymentMutation,
    useGetPendingFeesQuery,
    useGetBatchesQuery,
    useCreateBatchMutation,
    useRescheduleBatchMutation,
    useRecordTeacherLeaveMutation,
    useGetAttendanceQuery,
    useBatchMarkAttendanceMutation,
} = tuitionApi;

