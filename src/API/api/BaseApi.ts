import {
    createApi,
    fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { AppURL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:5000",
    // AppURL,

    prepareHeaders: async (headers) => {
        const token = await AsyncStorage.getItem('token');

        if (token) {
            headers.set('Authorization', token);
        }

        return headers;
    },
});

export const baseApi = createApi({
    reducerPath: 'api',

    baseQuery: rawBaseQuery,

    tagTypes: ['User', 'Tips'],

    endpoints: () => ({}),
});