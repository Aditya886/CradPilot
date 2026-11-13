import { masterQuery } from '../storage/local/sqlite';
import AsyncStorageUtils from '../utils/storage';

const MASTER_PIN_KEY = '@credpilot_security_password';

export const securityService = {
    /**
     * Get the active username from AsyncStorage session or master database
     */
    async getCurrentUsername(): Promise<string | null> {
        try {
            const session = await AsyncStorageUtils.getItem('user_session');
            if (session && session.username) {
                return session.username.trim().toLowerCase();
            }
        } catch (e) {
            console.error('[securityService] getCurrentUsername error:', e);
        }
        return null;
    },

    /**
     * Verify the entered password against the current user in SQLite masterDb or stored security password
     */
    async verifyPassword(passwordAttempt: string): Promise<{ success: boolean; message: string }> {
        const trimmed = (passwordAttempt || '').trim();
        if (!trimmed) {
            return { success: false, message: 'Please enter your password' };
        }

        try {
            const currentUsername = await this.getCurrentUsername();

            // 1. If we have a current user, verify directly against the users table
            if (currentUsername) {
                const users = masterQuery(
                    'SELECT password, username FROM users WHERE LOWER(username) = ? LIMIT 1',
                    [currentUsername]
                );

                if (users && users.length > 0) {
                    if (users[0].password === trimmed) {
                        return { success: true, message: 'Password verified successfully' };
                    }
                    return { success: false, message: 'Incorrect password. Access denied.' };
                }
            }

            // 2. If no active username or user not found, check any existing user in masterDb
            const anyUsers = masterQuery('SELECT password, username FROM users ORDER BY id DESC LIMIT 1');
            if (anyUsers && anyUsers.length > 0) {
                if (anyUsers[0].password === trimmed) {
                    return { success: true, message: 'Password verified successfully' };
                }
                return { success: false, message: 'Incorrect password. Access denied.' };
            }

            // 3. Fallback: check stored local master PIN in AsyncStorage
            const storedPin = await AsyncStorageUtils.getItem(MASTER_PIN_KEY);
            if (storedPin) {
                if (storedPin === trimmed) {
                    return { success: true, message: 'Password verified successfully' };
                }
                return { success: false, message: 'Incorrect password. Access denied.' };
            }

            // 4. Default master fallback if no accounts have been configured yet
            if (trimmed === '1234' || trimmed === 'admin') {
                await AsyncStorageUtils.setItem(MASTER_PIN_KEY, trimmed);
                return { success: true, message: 'Default security password accepted' };
            }

            // If no password set, set this as the security password
            if (trimmed.length >= 4) {
                await AsyncStorageUtils.setItem(MASTER_PIN_KEY, trimmed);
                return { success: true, message: 'Security password saved & verified' };
            }

            return { success: false, message: 'Incorrect password. Minimum 4 characters required.' };
        } catch (e) {
            console.error('[securityService] verifyPassword error:', e);
            return { success: false, message: 'Verification error occurred' };
        }
    },

    /**
     * Update or set a security password
     */
    async setSecurityPassword(newPassword: string): Promise<boolean> {
        try {
            const currentUsername = await this.getCurrentUsername();
            if (currentUsername) {
                masterQuery('UPDATE users SET password = ? WHERE LOWER(username) = ?', [
                    newPassword,
                    currentUsername,
                ]);
            }
            await AsyncStorageUtils.setItem(MASTER_PIN_KEY, newPassword);
            return true;
        } catch (e) {
            console.error('[securityService] setSecurityPassword error:', e);
            return false;
        }
    },
};
