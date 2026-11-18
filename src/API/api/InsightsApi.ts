import { baseApi } from './BaseApi';
import { createGet } from './Helper';

export const insightsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInsightsOverview: builder.query<any, { section?: string } | void>({
            ...createGet('insights/overview'),
            providesTags: ['Insights'],
        }),
    }),
});

export const {
    useGetInsightsOverviewQuery,
} = insightsApi;

