import { baseApi } from './BaseApi';
import { createGet, createPost, createPatch, createDelete } from './Helper';

export const debtsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDebtsDashboard: builder.query<any, void>({
            ...createGet('debts/dashboard'),
            providesTags: ['Debts'],
        }),
        getDebtPersons: builder.query<any, any>({
            ...createGet('debts/persons'),
            providesTags: ['Debts'],
        }),
        getDebtPersonDetail: builder.query<any, string>({
            query: (id: string) => ({
                url: `debts/persons/${id}`,
            }),
            providesTags: ['Debts'],
        }),
        createDebtPerson: builder.mutation<any, any>({
            ...createPost('debts/persons'),
            invalidatesTags: ['Debts', 'Insights', 'Subscription'],
        }),
        updateDebtPerson: builder.mutation<any, { id: string; body: any }>({
            query: ({ id, body }) => ({
                url: `debts/persons/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Debts'],
        }),
        deleteDebtPerson: builder.mutation<any, string>({
            query: (id: string) => ({
                url: `debts/persons/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Debts', 'Insights', 'Subscription'],
        }),
        getDebtTransactions: builder.query<any, any>({
            ...createGet('debts/transactions'),
            providesTags: ['Debts'],
        }),
        createDebtTransaction: builder.mutation<any, any>({
            ...createPost('debts/transactions'),
            invalidatesTags: ['Debts', 'Insights', 'Subscription'],
        }),
        deleteDebtTransaction: builder.mutation<any, string>({
            query: (id: string) => ({
                url: `debts/transactions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Debts', 'Insights', 'Subscription'],
        }),
    }),
});

export const {
    useGetDebtsDashboardQuery,
    useGetDebtPersonsQuery,
    useGetDebtPersonDetailQuery,
    useCreateDebtPersonMutation,
    useUpdateDebtPersonMutation,
    useDeleteDebtPersonMutation,
    useGetDebtTransactionsQuery,
    useCreateDebtTransactionMutation,
    useDeleteDebtTransactionMutation,
} = debtsApi;

