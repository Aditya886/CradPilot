import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../../API/api/BaseApi';
import { appReducer } from './silce/AuthSlice';
import { tuitionReducer } from './silce/TuitionSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
    reducer: {
        app: appReducer,
        tuition: tuitionReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;