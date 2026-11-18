import { baseApi } from './BaseApi';
import { createPost } from './Helper';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<any, any>(
            createPost('auth/login')
        ),
        sendSignupOtp: builder.mutation<any, any>(
            createPost('auth/signup/send-otp')
        ),
        verifySignup: builder.mutation<any, any>(
            createPost('auth/signup/verify')
        ),
        sendForgotPasswordOtp: builder.mutation<any, any>(
            createPost('auth/forgot-password/send-otp')
        ),
        verifyResetPassword: builder.mutation<any, any>(
            createPost('auth/forgot-password/verify-reset')
        ),
    }),
});

export const {
    useLoginMutation,
    useSendSignupOtpMutation,
    useVerifySignupMutation,
    useSendForgotPasswordOtpMutation,
    useVerifyResetPasswordMutation,
} = authApi;
