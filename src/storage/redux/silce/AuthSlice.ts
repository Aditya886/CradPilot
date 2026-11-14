import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserType = 'athlete' | 'coach' | 'parent' | 'counsellor' | 'undefined';
export type AppPurpose = 'tution' | 'local' | 'finance';

type AppState = {
    tab: boolean;
    type: UserType;
    purpose: AppPurpose;
    isPremium: boolean;
    hasLaunched: boolean;
    currentUser: string | null;
    currentUserEmail: string | null;
    currentProfileName: string | null;
    currentProfileImage: string | null;
};

const initialState: AppState = {
    tab: false,
    type: 'athlete',
    purpose: 'local',
    isPremium: false,
    hasLaunched: false,
    currentUser: null,
    currentUserEmail: null,
    currentProfileName: null,
    currentProfileImage: null,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setTab(state, action: PayloadAction<boolean>) {
            state.tab = action.payload;
        },
        setUserType(state, action: PayloadAction<UserType>) {
            state.type = action.payload;
        },
        setAppPurpose(state, action: PayloadAction<AppPurpose>) {
            state.purpose = action.payload;
        },
        setIsPremium(state, action: PayloadAction<boolean>) {
            state.isPremium = action.payload;
        },
        setHasLaunched(state, action: PayloadAction<boolean>) {
            state.hasLaunched = action.payload;
        },
        setCurrentUser(state, action: PayloadAction<string | null>) {
            state.currentUser = action.payload;
        },
        setCurrentUserEmail(state, action: PayloadAction<string | null>) {
            state.currentUserEmail = action.payload;
        },
        setCurrentProfileName(state, action: PayloadAction<string | null>) {
            state.currentProfileName = action.payload;
        },
        setCurrentProfileImage(state, action: PayloadAction<string | null>) {
            state.currentProfileImage = action.payload;
        },
        resetNavigationState(state) {
            state.tab = false;
            state.type = 'athlete';
            state.purpose = 'local';
            state.isPremium = false;
            state.currentUser = null;
            state.currentUserEmail = null;
            state.currentProfileName = null;
            state.currentProfileImage = null;
        },
    },
});

export const { 
    setTab, 
    setUserType, 
    setAppPurpose,
    setIsPremium,
    setHasLaunched, 
    setCurrentUser, 
    setCurrentUserEmail,
    setCurrentProfileName, 
    setCurrentProfileImage, 
    resetNavigationState 
} = appSlice.actions;
export const appReducer = appSlice.reducer;

