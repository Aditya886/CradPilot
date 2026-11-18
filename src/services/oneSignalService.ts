import { OneSignal, LogLevel } from 'react-native-onesignal';
import { Platform } from 'react-native';

// Fallback OneSignal App ID
// Can also be configured via .env (ONESIGNAL_APP_ID)
let ENV_ONESIGNAL_ID: string | undefined;
try {
    const env = require('@env');
    ENV_ONESIGNAL_ID = env?.ONESIGNAL_APP_ID;
} catch (e) {
    ENV_ONESIGNAL_ID = undefined;
}

export const ONESIGNAL_APP_ID =
    ENV_ONESIGNAL_ID && ENV_ONESIGNAL_ID !== 'your_onesignal_app_id_here'
        ? ENV_ONESIGNAL_ID
        : 'e1cf0989-b003-455b-8012-e564883495d4';

let isInitialized = false;

/**
 * Initializes OneSignal SDK, requests notification permissions,
 * and sets up foreground and click listeners.
 */
export const initializeOneSignal = () => {
    if (isInitialized) {
        console.log('[OneSignal] Already initialized.');
        return;
    }

    try {
        console.log('[OneSignal] Initializing OneSignal with App ID:', ONESIGNAL_APP_ID);

        // Optional: verbose logging for dev
        if (__DEV__) {
            OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        }

        // Initialize OneSignal
        OneSignal.initialize(ONESIGNAL_APP_ID);

        // Request Push Notification Permission
        OneSignal.Notifications.requestPermission(true).then((granted) => {
            console.log('[OneSignal] Notification permission granted:', granted);
        }).catch((err) => {
            console.warn('[OneSignal] Notification permission request error:', err);
        });

        // Foreground Notification Display Listener
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
            console.log('[OneSignal] Notification received in foreground:', event.getNotification().title);
            // In v5, event.getNotification().display() can be called or let default behavior display it
        });

        // Notification Click Listener
        OneSignal.Notifications.addEventListener('click', (event) => {
            console.log('[OneSignal] Notification clicked:', event.notification.title, event.notification.additionalData);
        });

        isInitialized = true;
        console.log('[OneSignal] Initialized successfully');
    } catch (e) {
        console.error('[OneSignal] Initialization error:', e);
    }
};

/**
 * Identifies the user in OneSignal with their user ID / email and sets tags
 */
export const loginOneSignalUser = (userId: string | number, email?: string) => {
    if (!userId) {
        return;
    }
    try {
        const idStr = String(userId).trim();
        console.log('[OneSignal] Logging in user:', idStr);
        OneSignal.login(idStr);

        if (email && email.includes('@')) {
            OneSignal.User.addEmail(email.trim().toLowerCase());
        }

        // Add standard tags
        OneSignal.User.addTag('platform', Platform.OS);
        OneSignal.User.addTag('app_version', '1.0.1');
    } catch (e) {
        console.error('[OneSignal] Login user error:', e);
    }
};

/**
 * Dissociates the current user from OneSignal upon logout
 */
export const logoutOneSignalUser = () => {
    try {
        console.log('[OneSignal] Logging out user');
        OneSignal.logout();
    } catch (e) {
        console.error('[OneSignal] Logout user error:', e);
    }
};

/**
 * Adds or updates user tags (e.g. purpose: 'tuition', 'finance', 'local')
 */
export const setOneSignalTags = (tags: Record<string, string>) => {
    try {
        OneSignal.User.addTags(tags);
    } catch (e) {
        console.error('[OneSignal] Add tags error:', e);
    }
};
