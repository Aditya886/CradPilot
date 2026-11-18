import {
    createApi,
    fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

let envAppURL: string | undefined;
try {
    const env = require('@env');
    envAppURL = env?.AppURL;
} catch (e) {
    envAppURL = undefined;
}

const NGROK_BASE_URL = 'https://153a-2409-40d6-101f-2455-1d12-f95-769b-25b3.ngrok-free.app/api/v1';

const getBaseUrl = (): string => {
    if (envAppURL && envAppURL.startsWith('http') && envAppURL.length > 8) {
        return envAppURL.endsWith('/api/v1') ? envAppURL : `${envAppURL}/api/v1`;
    }
    return NGROK_BASE_URL;
};

const rawBaseQuery = fetchBaseQuery({
    baseUrl: getBaseUrl(),

    prepareHeaders: async (headers) => {
        // Bypass ngrok free browser warning interstitial
        headers.set('ngrok-skip-browser-warning', 'true');

        let token = await AsyncStorage.getItem('token');
        if (!token) {
            const rawSession = await AsyncStorage.getItem('user_session');
            if (rawSession) {
                try {
                    const session = JSON.parse(rawSession);
                    token = session?.token;
                } catch (e) {}
            }
        }

        if (token) {
            headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
        }

        return headers;
    },
});

export const baseApi = createApi({
    reducerPath: 'api',

    baseQuery: rawBaseQuery,

    tagTypes: [
        'User',
        'Debts',
        'Finance',
        'Emi',
        'Goals',
        'Plans',
        'Tuition',
        'Insights',
        'Subscription',
    ],

    endpoints: () => ({}),
});
