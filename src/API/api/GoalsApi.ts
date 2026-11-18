import { baseApi } from './BaseApi';
import { createGet, createPost } from './Helper';

export const goalsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getGoals: builder.query<any, any>({
            ...createGet('goals'),
            providesTags: ['Goals'],
        }),
        getGoalDetail: builder.query<any, string>({
            query: (id: string) => ({
                url: `goals/${id}`,
            }),
            providesTags: ['Goals'],
        }),
        createGoal: builder.mutation<any, any>({
            ...createPost('goals'),
            invalidatesTags: ['Goals', 'Insights', 'Subscription'],
        }),
        updateGoal: builder.mutation<any, { id: string; body: any }>({
            query: ({ id, body }) => ({
                url: `goals/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Goals', 'Insights'],
        }),
        toggleGoalStatus: builder.mutation<any, { id: string; status: 'active' | 'done' }>({
            query: ({ id, status }) => ({
                url: `goals/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: ['Goals', 'Insights'],
        }),
        addContribution: builder.mutation<any, { id: string; amount: number; notes?: string }>({
            query: ({ id, amount, notes }) => ({
                url: `goals/${id}/contributions`,
                method: 'POST',
                body: { amount, notes },
            }),
            invalidatesTags: ['Goals', 'Insights'],
        }),
        deleteGoal: builder.mutation<any, string>({
            query: (id: string) => ({
                url: `goals/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Goals', 'Insights', 'Subscription'],
        }),
    }),
});

export const {
    useGetGoalsQuery,
    useGetGoalDetailQuery,
    useCreateGoalMutation,
    useUpdateGoalMutation,
    useToggleGoalStatusMutation,
    useAddContributionMutation,
    useDeleteGoalMutation,
} = goalsApi;

