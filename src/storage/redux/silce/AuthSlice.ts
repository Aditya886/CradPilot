import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserType = 'athlete' | 'coach' | 'parent' | 'counsellor' | 'undefined';

type AppState = {
    tab: boolean;
    type: UserType;
    hasLaunched: boolean;
    currentUser: string | null;
    currentProfileName: string | null;
    currentProfileImage: string | null;
};

const initialState: AppState = {
    tab: false,
    type: 'athlete',
    hasLaunched: false,
    currentUser: null,
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
        setHasLaunched(state, action: PayloadAction<boolean>) {
            state.hasLaunched = action.payload;
        },
        setCurrentUser(state, action: PayloadAction<string | null>) {
            state.currentUser = action.payload;
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
            state.currentUser = null;
            state.currentProfileName = null;
            state.currentProfileImage = null;
        },
    },
});

export const { 
    setTab, 
    setUserType, 
    setHasLaunched, 
    setCurrentUser, 
    setCurrentProfileName, 
    setCurrentProfileImage, 
    resetNavigationState 
} = appSlice.actions;
export const appReducer = appSlice.reducer;

