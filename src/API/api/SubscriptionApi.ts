import { baseApi } from './BaseApi';
import { createGet, createPost } from './Helper';

export const subscriptionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubscriptionStatus: builder.query<any, void>({
            ...createGet('subscription/status'),
            providesTags: ['Subscription'],
        }),
        upgradeSubscription: builder.mutation<any, { planId?: string; receiptId?: string } | void>({
            ...createPost('subscription/upgrade'),
            invalidatesTags: ['Subscription', 'User'],
        }),
        cancelSubscription: builder.mutation<any, void>({
            ...createPost('subscription/cancel'),
            invalidatesTags: ['Subscription', 'User'],
        }),
    }),
});

export const {
    useGetSubscriptionStatusQuery,
    useUpgradeSubscriptionMutation,
    useCancelSubscriptionMutation,
} = subscriptionApi;

