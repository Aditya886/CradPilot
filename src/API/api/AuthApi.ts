import { baseApi } from './baseApi';

import {
    createGet,
    createPost,
} from './Helper';

const url = {
    login: 'auth/login',
    signup: 'auth/signup',
    getUser: 'auth/get-user',
}

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        login: builder.mutation(
            createPost(url.login)
        ),

        signUp: builder.mutation(
            createPost(url.signup)
        ),

        getUser: builder.query({
            ...createGet('/api/get-user'),

            providesTags: ['User'],
        }),

    }),
});

export const {
    useLoginMutation,
    useSignUpMutation,
    useGetUserQuery,
} = authApi;