import { baseApi } from './BaseApi';
import { createGet, createPost } from './Helper';

export const financeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFinanceDashboard: builder.query<any, void>({
            ...createGet('finance/dashboard'),
            providesTags: ['Finance'],
        }),
        getBorrowers: builder.query<any, any>({
            ...createGet('finance/borrowers'),
            providesTags: ['Finance'],
        }),
        getBorrowerDetail: builder.query<any, string>({
            query: (id: string) => ({
                url: `finance/borrowers/${id}`,
            }),
            providesTags: ['Finance'],
        }),
        createBorrower: builder.mutation<any, any>({
            ...createPost('finance/borrowers'),
            invalidatesTags: ['Finance', 'Insights', 'Subscription'],
        }),
        updateBorrower: builder.mutation<any, { id: string; body: any }>({
            query: ({ id, body }) => ({
                url: `finance/borrowers/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Finance'],
        }),
        deleteBorrower: builder.mutation<any, string>({
            query: (id: string) => ({
                url: `finance/borrowers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Finance', 'Insights', 'Subscription'],
        }),
        getLoans: builder.query<any, any>({
            ...createGet('finance/loans'),
            providesTags: ['Finance'],
        }),
        getLoanDetail: builder.query<any, string>({
            query: (id: string) => ({
                url: `finance/loans/${id}`,
            }),
            providesTags: ['Finance'],
        }),
        createLoan: builder.mutation<any, any>({
            ...createPost('finance/loans'),
            invalidatesTags: ['Finance', 'Insights', 'Subscription'],
        }),
        deleteLoan: builder.mutation<any, string>({
            query: (id: string) => ({
                url: `finance/loans/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Finance', 'Insights', 'Subscription'],
        }),
        recordLoanPayment: builder.mutation<any, { loanId: string; body: any }>({
            query: ({ loanId, body }) => ({
                url: `finance/loans/${loanId}/payments`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Finance', 'Insights'],
        }),
        deleteLoanPayment: builder.mutation<any, { loanId: string; paymentId: string }>({
            query: ({ loanId, paymentId }) => ({
                url: `finance/loans/${loanId}/payments/${paymentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Finance', 'Insights'],
        }),
    }),
});

export const {
    useGetFinanceDashboardQuery,
    useGetBorrowersQuery,
    useGetBorrowerDetailQuery,
    useCreateBorrowerMutation,
    useUpdateBorrowerMutation,
    useDeleteBorrowerMutation,
    useGetLoansQuery,
    useGetLoanDetailQuery,
    useCreateLoanMutation,
    useDeleteLoanMutation,
    useRecordLoanPaymentMutation,
    useDeleteLoanPaymentMutation,
} = financeApi;

