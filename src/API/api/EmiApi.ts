import { baseApi } from './BaseApi';
import { createGet, createPost } from './Helper';

export const emiApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEmiLoans: builder.query<any, any>({
            ...createGet('emi/loans'),
            providesTags: ['Emi'],
        }),
        getEmiLoanDetail: builder.query<any, string>({
            query: (id: string) => ({
                url: `emi/loans/${id}`,
            }),
            providesTags: ['Emi'],
        }),
        createEmiLoan: builder.mutation<any, any>({
            ...createPost('emi/loans'),
            invalidatesTags: ['Emi', 'Insights', 'Subscription'],
        }),
        markEmiPaid: builder.mutation<any, { id: string }>({
            query: ({ id }) => ({
                url: `emi/loans/${id}/mark-paid`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Emi', 'Insights'],
        }),
        undoLastEmi: builder.mutation<any, { id: string }>({
            query: ({ id }) => ({
                url: `emi/loans/${id}/undo`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Emi', 'Insights'],
        }),
        forecloseLoan: builder.mutation<any, { id: string }>({
            query: ({ id }) => ({
                url: `emi/loans/${id}/foreclose`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Emi', 'Insights'],
        }),
        deleteEmiLoan: builder.mutation<any, string>({
            query: (id: string) => ({
                url: `emi/loans/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Emi', 'Insights', 'Subscription'],
        }),
    }),
});

export const {
    useGetEmiLoansQuery,
    useGetEmiLoanDetailQuery,
    useCreateEmiLoanMutation,
    useMarkEmiPaidMutation,
    useUndoLastEmiMutation,
    useForecloseLoanMutation,
    useDeleteEmiLoanMutation,
} = emiApi;

