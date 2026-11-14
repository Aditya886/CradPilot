import { Platform, Alert, AppState, AppStateStatus } from 'react-native';
import SpInAppUpdates, {
  IAUUpdateKind,
  IAUAvailabilityStatus,
  StartUpdateOptions,
  NeedsUpdateResponse,
} from 'sp-react-native-in-app-updates';
import NetInfo from '@react-native-community/netinfo';

// Initialize in-app updates manager (isDebug set to false in production)
export const inAppUpdates = new SpInAppUpdates(__DEV__);

let isChecking = false;

/**
 * Checks for app updates and triggers an immediate update if available.
 * 
 * Since CredPilot is primarily used offline, this function:
 * 1. Checks for internet connectivity first to avoid errors while offline.
 * 2. Uses IAUUpdateKind.IMMEDIATE so users are required to update when online.
 * 3. Gracefully handles network and store errors without interrupting offline usage.
 * 
 * @param manual If true, alerts the user when they are offline or already on the latest version.
 */
export const checkForAppUpdates = async (manual = false): Promise<boolean> => {
  if (isChecking) {
    return false;
  }

  try {
    isChecking = true;

    // Check internet connectivity
    const netInfo = await NetInfo.fetch();
    const isOnline = Boolean(netInfo.isConnected && netInfo.isInternetReachable !== false);

    if (!isOnline) {
      if (manual) {
        Alert.alert(
          'Offline Mode',
          'Internet connection is required to check for app updates. Please connect to the internet and try again.'
        );
      }
      return false;
    }

    // Check if an update is available on Play Store or App Store
    const result: NeedsUpdateResponse = await inAppUpdates.checkNeedsUpdate();

    // Check if an immediate update is required or was already in progress (Android)
    const isUpdateAvailable = Boolean(result.shouldUpdate);
    const isAndroidImmediateResume =
      Platform.OS === 'android' &&
      (result.other as any)?.updateAvailability === IAUAvailabilityStatus.DEVELOPER_TRIGGERED;

    if (isUpdateAvailable || isAndroidImmediateResume) {
      if (Platform.OS === 'android') {
        await inAppUpdates.startUpdate({
          updateType: IAUUpdateKind.IMMEDIATE,
        });
      } else {
        await inAppUpdates.startUpdate({
          title: 'Update Required',
          message:
            'A new version of CredPilot is available. Please update the app to continue.',
          buttonUpgradeText: 'Update Now',
          forceUpgrade: true,
        });
      }
      return true;
    } else if (manual) {
      Alert.alert(
        'Up to Date',
        'You are already using the latest version of CredPilot.'
      );
    }

    return false;
  } catch (error: any) {
    // Only log in development or debug, don't interrupt the offline app experience
    if (__DEV__) {
      console.log('[InAppUpdate] Check/update error:', error);
    }
    if (manual) {
      Alert.alert(
        'Update Check Failed',
        'Unable to check for updates at this time. Please try again later.'
      );
    }
    return false;
  } finally {
    isChecking = false;
  }
};

/**
 * Sets up listeners to automatically check for immediate updates:
 * - When the app comes to foreground / becomes active
 * - When an offline user connects back to the internet
 */
export const initInAppUpdates = (): (() => void) => {
  // Initial check on app start
  checkForAppUpdates(false);

  // AppState listener (resumes immediate update if interrupted)
  const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
    if (nextState === 'active') {
      checkForAppUpdates(false);
    }
  });

  // NetInfo listener (checks for updates when an offline user connects to internet)
  let wasOffline = false;
  const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
    if (!isOnline) {
      wasOffline = true;
    } else if (wasOffline) {
      wasOffline = false;
      checkForAppUpdates(false);
    }
  });

  return () => {
    appStateSub.remove();
    netInfoUnsubscribe();
  };
};

export { IAUUpdateKind };
