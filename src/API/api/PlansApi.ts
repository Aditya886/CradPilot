import { baseApi } from './BaseApi';
import { createGet, createPost } from './Helper';

export const plansApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlans: builder.query<any, any>({
            ...createGet('plans'),
            providesTags: ['Plans'],
        }),
        getPlanDetail: builder.query<any, string>({
            query: (id: string) => ({
                url: `plans/${id}`,
            }),
            providesTags: ['Plans'],
        }),
        createPlan: builder.mutation<any, any>({
            ...createPost('plans'),
            invalidatesTags: ['Plans', 'Insights', 'Subscription'],
        }),
        deletePlan: builder.mutation<any, string>({
            query: (id: string) => ({
                url: `plans/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Plans', 'Insights', 'Subscription'],
        }),
        addPlanMember: builder.mutation<any, { planId: string; name: string; phone?: string }>({
            query: ({ planId, ...body }) => ({
                url: `plans/${planId}/members`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Plans'],
        }),
        deletePlanMember: builder.mutation<any, { planId: string; memberId: string }>({
            query: ({ planId, memberId }) => ({
                url: `plans/${planId}/members/${memberId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Plans'],
        }),
        addPlanSpend: builder.mutation<any, { planId: string; body: any }>({
            query: ({ planId, body }) => ({
                url: `plans/${planId}/spends`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Plans', 'Insights'],
        }),
        deletePlanSpend: builder.mutation<any, { planId: string; spendId: string }>({
            query: ({ planId, spendId }) => ({
                url: `plans/${planId}/spends/${spendId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Plans', 'Insights'],
        }),
    }),
});

export const {
    useGetPlansQuery,
    useGetPlanDetailQuery,
    useCreatePlanMutation,
    useDeletePlanMutation,
    useAddPlanMemberMutation,
    useDeletePlanMemberMutation,
    useAddPlanSpendMutation,
    useDeletePlanSpendMutation,
} = plansApi;

