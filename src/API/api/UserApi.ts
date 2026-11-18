import { baseApi } from './BaseApi';
import { createGet, createPatch, createPost, createDelete } from './Helper';

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<any, void>({
            ...createGet('user/profile'),
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<any, any>({
            ...createPatch('user/profile'),
            invalidatesTags: ['User'],
        }),
        updatePurpose: builder.mutation<any, { purpose: string }>({
            ...createPatch('user/purpose'),
            invalidatesTags: ['User'],
        }),
        changePassword: builder.mutation<any, { currentPassword: string; newPassword: string }>({
            ...createPatch('user/password'),
        }),
        registerOneSignalDevice: builder.mutation<any, { playerId: string }>({
            ...createPost('user/onesignal/device'),
        }),
        deleteAccount: builder.mutation<any, void>({
            ...createDelete('user/account'),
            invalidatesTags: ['User'],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useUpdatePurposeMutation,
    useChangePasswordMutation,
    useRegisterOneSignalDeviceMutation,
    useDeleteAccountMutation,
} = userApi;

