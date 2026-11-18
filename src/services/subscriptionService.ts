import { query, masterQuery } from '../storage/local/sqlite';
import AsyncStorageUtils from '../utils/storage';
import { store } from '../storage/redux/store';
import { setIsPremium, setAppPurpose, AppPurpose } from '../storage/redux/silce/AuthSlice';
import { subscriptionApi } from '../API/api/SubscriptionApi';
import { userApi } from '../API/api/UserApi';

export interface SubscriptionModalOptions {
    visible: boolean;
    title?: string;
    subtitle?: string;
    reason?: 'storage_limit' | 'delete_locked' | 'export_locked' | 'mode_locked' | 'manage';
}

type SubscriptionListener = (options: SubscriptionModalOptions) => void;
const modalListeners: Set<SubscriptionListener> = new Set();

class SubscriptionService {
    private premiumCached: boolean = false;
    private purposeCached: AppPurpose = 'local';

    init(isPremium: boolean, purpose: AppPurpose) {
        this.premiumCached = isPremium;
        this.purposeCached = purpose;
    }

    subscribe(listener: SubscriptionListener) {
        modalListeners.add(listener);
        return () => {
            modalListeners.delete(listener);
        };
    }

    showUpgradeModal(options: Omit<SubscriptionModalOptions, 'visible'> = {}) {
        const payload: SubscriptionModalOptions = {
            visible: true,
            title: options.title || 'Upgrade to CredPilot Pro',
            subtitle: options.subtitle || 'Unlock unlimited entries, record deletion & full offline backup.',
            reason: options.reason || 'manage',
        };
        modalListeners.forEach(listener => {
            try {
                listener(payload);
            } catch (e) {
                console.error('[SubscriptionService] listener error:', e);
            }
        });
    }

    isPremium(): boolean {
        // Redux state takes precedence if initialized, otherwise local cache
        const reduxState = store.getState()?.app;
        if (typeof reduxState?.isPremium === 'boolean') {
            return reduxState.isPremium;
        }
        return this.premiumCached;
    }

    getPurpose(): AppPurpose {
        const reduxState = store.getState()?.app;
        if (reduxState?.purpose) {
            return reduxState.purpose;
        }
        return this.purposeCached;
    }

    async setPremium(isPremium: boolean): Promise<void> {
        this.premiumCached = isPremium;
        store.dispatch(setIsPremium(isPremium));

        try {
            // Update backend subscription state
            if (isPremium) {
                store.dispatch(subscriptionApi.endpoints.upgradeSubscription.initiate({ planId: 'pro_monthly' }));
            } else {
                store.dispatch(subscriptionApi.endpoints.cancelSubscription.initiate());
            }
        } catch (apiErr) {
            console.log('[SubscriptionService] backend sync note:', apiErr);
        }

        try {
            // Update AsyncStorage session
            const session = await AsyncStorageUtils.getItem('user_session') || {};
            session.isPremium = isPremium;
            await AsyncStorageUtils.setItem('user_session', session);

            // Update masterDb
            if (session.username) {
                masterQuery('UPDATE users SET is_premium = ? WHERE username = ?', [
                    isPremium ? 1 : 0,
                    session.username.toLowerCase(),
                ]);
            }
        } catch (e) {
            console.error('[SubscriptionService] setPremium error:', e);
        }
    }

    async setPurpose(purpose: AppPurpose): Promise<void> {
        this.purposeCached = purpose;
        store.dispatch(setAppPurpose(purpose));

        try {
            // Update backend user purpose
            store.dispatch(userApi.endpoints.updatePurpose.initiate({ purpose }));
        } catch (apiErr) {
            console.log('[SubscriptionService] backend purpose sync note:', apiErr);
        }

        try {
            const session = await AsyncStorageUtils.getItem('user_session') || {};
            session.appPurpose = purpose;
            await AsyncStorageUtils.setItem('user_session', session);

            if (session.username) {
                masterQuery('UPDATE users SET app_purpose = ? WHERE username = ?', [
                    purpose,
                    session.username.toLowerCase(),
                ]);
            }
        } catch (e) {
            console.error('[SubscriptionService] setPurpose error:', e);
        }
    }

    getTotalEntriesCount(): number {
        let count = 0;
        try {
            const dp = query('SELECT COUNT(*) as c FROM debt_persons');
            if (dp?.[0]?.c) count += Number(dp[0].c);

            const dt = query('SELECT COUNT(*) as c FROM debt_transactions');
            if (dt?.[0]?.c) count += Number(dt[0].c);

            const loans = query('SELECT COUNT(*) as c FROM loans');
            if (loans?.[0]?.c) count += Number(loans[0].c);

            const borrowers = query('SELECT COUNT(*) as c FROM borrowers');
            if (borrowers?.[0]?.c) count += Number(borrowers[0].c);

            const plans = query('SELECT COUNT(*) as c FROM plans');
            if (plans?.[0]?.c) count += Number(plans[0].c);
        } catch (e) {
            // Table might not exist yet
        }
        return count;
    }

    canAddEntry(): { allowed: boolean; count: number; max: number } {
        if (this.isPremium()) {
            return { allowed: true, count: this.getTotalEntriesCount(), max: Infinity };
        }
        const count = this.getTotalEntriesCount();
        const max = 15;
        const allowed = count < max;

        if (!allowed) {
            this.showUpgradeModal({
                title: '15-Entry Limit Reached',
                subtitle: `Free accounts are limited to ${max} total entries. You currently have ${count} records. Upgrade to Pro for unlimited storage!`,
                reason: 'storage_limit',
            });
        }

        return { allowed, count, max };
    }

    canDelete(): boolean {
        if (this.isPremium()) {
            return true;
        }

        this.showUpgradeModal({
            title: 'Delete Feature Locked',
            subtitle: 'Deleting entries is disabled on the Free tier. Upgrade to CredPilot Pro to delete and manage all records freely!',
            reason: 'delete_locked',
        });
        return false;
    }

    canUseExportImport(): boolean {
        if (this.isPremium()) {
            return true;
        }

        this.showUpgradeModal({
            title: 'Export & Import Locked',
            subtitle: 'Offline Excel (.xlsx) and PDF backup & restore are available exclusively for CredPilot Pro members.',
            reason: 'export_locked',
        });
        return false;
    }

    isPurposeLocked(purposeToCheck: AppPurpose): boolean {
        if (this.isPremium()) {
            return false;
        }
        return this.getPurpose() !== purposeToCheck;
    }
}

export const subscriptionService = new SubscriptionService();

