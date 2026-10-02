import { OneSignal } from 'react-native-onesignal';

// Configurable placeholder OneSignal App ID
const ONE_SIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID';

export const initializeOneSignal = () => {
    try {
        console.log('Initializing OneSignal with App ID:', ONE_SIGNAL_APP_ID);
        OneSignal.initialize(ONE_SIGNAL_APP_ID);
    } catch (e) {
        console.error('OneSignal initialization error:', e);
    }
};

export const loginOneSignalUser = (userId: string | number) => {
    if (!userId) {
        return;
    }
    try {
        const idStr = String(userId).trim();
        console.log('Logging in OneSignal user:', idStr);
        OneSignal.login(idStr);
    } catch (e) {
        console.error('OneSignal login error:', e);
    }
};

export const logoutOneSignalUser = () => {
    try {
        console.log('Logging out OneSignal user');
        OneSignal.logout();
    } catch (e) {
        console.error('OneSignal logout error:', e);
    }
};
