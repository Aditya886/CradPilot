import { query } from '../storage/local/sqlite';

let notifee: any = null;
let TriggerType: any = { TIMESTAMP: 0 };
let AndroidImportance: any = { HIGH: 4 };

try {
    const notifeeModule = require('@notifee/react-native');
    notifee = notifeeModule.default || notifeeModule;
    if (notifeeModule.TriggerType) TriggerType = notifeeModule.TriggerType;
    if (notifeeModule.AndroidImportance) AndroidImportance = notifeeModule.AndroidImportance;
} catch (e) {
    console.warn('[Notifee] Native module not available in current native build. Rebuild native app to enable notifications.');
}

// Helper to parse DD/MM/YYYY to Date object
const parseDateString = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-based month
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    return null;
};

// Helper to get a random time between 10:00 AM (10:00) and 8:00 PM (20:00) on a given day
const getRandomTimeForDate = (baseDate: Date): Date => {
    const targetDate = new Date(baseDate.getTime());
    // Random hour between 10 and 19 (10, 11, ..., 19)
    const randomHour = Math.floor(Math.random() * 10) + 10;
    // Random minute between 0 and 59
    const randomMinute = Math.floor(Math.random() * 60);

    targetDate.setHours(randomHour, randomMinute, 0, 0);
    return targetDate;
};

// Initialize Notifee channel and request permissions
export const initLocalNotifications = async () => {
    if (!notifee) {
        console.warn('[Notifee] Skipping initLocalNotifications: native module not linked.');
        return;
    }
    try {
        console.log('[Notifee] Requesting permissions and creating channel');
        await notifee.requestPermission();

        await notifee.createChannel({
            id: 'credpilot-alerts',
            name: 'Financial Alerts',
            importance: AndroidImportance.HIGH,
        });
    } catch (e) {
        console.error('[Notifee] Error during initialization:', e);
    }
};

// Cancel all scheduled notifications
export const cancelAllLocalNotifications = async () => {
    if (!notifee) return;
    try {
        console.log('[Notifee] Cancelling all scheduled notifications');
        await notifee.cancelAllNotifications();
    } catch (e) {
        console.error('[Notifee] Error cancelling notifications:', e);
    }
};

// Main function to sync database with scheduled local notifications
export const syncNotifications = async () => {
    if (!notifee) return;
    try {
        console.log('[Notifee] Starting notifications sync...');
        // 1. Clear existing notifications to start fresh and avoid duplicates
        await cancelAllLocalNotifications();

        // 2. Fetch Active Loans
        const activeLoans = query(`
            SELECT l.*, b.name as borrower_name 
            FROM loans l
            JOIN borrowers b ON l.borrower_id = b.id
            WHERE l.status = 'Active'
        `) || [];

        console.log(`[Notifee] Syncing ${activeLoans.length} active loans`);

        for (const loan of activeLoans) {
            if (loan.due_date) {
                const dueDateObj = parseDateString(loan.due_date);
                if (dueDateObj) {
                    // Scenario A: Today is the due date
                    const todayAlertTime = getRandomTimeForDate(dueDateObj);
                    if (todayAlertTime.getTime() > Date.now()) {
                        const trigger = {
                            type: TriggerType.TIMESTAMP,
                            timestamp: todayAlertTime.getTime(),
                        };
                        await notifee.createTriggerNotification(
                            {
                                id: `loan_due_today_${loan.id}`,
                                title: 'Loan Due Today 🔔',
                                body: `The loan "${loan.title}" of ₹${loan.amount} from ${loan.borrower_name} is due today.`,
                                android: {
                                    channelId: 'credpilot-alerts',
                                    importance: AndroidImportance.HIGH,
                                },
                            },
                            trigger
                        );
                        console.log(`[Notifee] Scheduled due today alert for loan ${loan.id} at ${todayAlertTime}`);
                    }

                    // Scenario B: One day before due date
                    const dayBeforeObj = new Date(dueDateObj.getTime() - 24 * 60 * 60 * 1000);
                    const dayBeforeAlertTime = getRandomTimeForDate(dayBeforeObj);
                    if (dayBeforeAlertTime.getTime() > Date.now()) {
                        const trigger = {
                            type: TriggerType.TIMESTAMP,
                            timestamp: dayBeforeAlertTime.getTime(),
                        };
                        await notifee.createTriggerNotification(
                            {
                                id: `loan_due_tomorrow_${loan.id}`,
                                title: 'Loan Due Tomorrow 🔔',
                                body: `Reminder: The loan "${loan.title}" of ₹${loan.amount} from ${loan.borrower_name} is due tomorrow.`,
                                android: {
                                    channelId: 'credpilot-alerts',
                                    importance: AndroidImportance.HIGH,
                                },
                            },
                            trigger
                        );
                        console.log(`[Notifee] Scheduled due tomorrow alert for loan ${loan.id} at ${dayBeforeAlertTime}`);
                    }
                }
            }
        }

        // 3. Fetch Debt Persons and Transactions
        const persons = query('SELECT * FROM debt_persons') || [];
        const txns = query('SELECT * FROM debt_transactions ORDER BY id DESC') || [];

        console.log(`[Notifee] Syncing debts for ${persons.length} contacts`);

        for (const person of persons) {
            const personTxns = txns.filter((t: any) => t.person_id === person.id);

            // Compute balance to see if debt is active
            let balance = 0;
            personTxns.forEach((t: any) => {
                if (t.type === 'outgoing') {
                    balance += t.amount;
                } else if (t.type === 'incoming') {
                    balance -= t.amount;
                } else if (t.type === 'done') {
                    if (balance > 0) {
                        balance = Math.max(0, balance - t.amount);
                    } else if (balance < 0) {
                        balance = Math.min(0, balance + t.amount);
                    }
                }
            });

            // Only schedule reminders for active debts
            if (balance !== 0) {
                // Find all valid non-settled transactions (incoming or outgoing)
                const activeTxns = personTxns.filter((t: any) => t.type === 'incoming' || t.type === 'outgoing');

                for (const txn of activeTxns) {
                    const txnDateObj = parseDateString(txn.date);
                    if (txnDateObj) {
                        // Intervals: 30, 60, 80, 120, then every 30 days up to 360 days
                        const offsets = [30, 60, 80, 120, 150, 180, 210, 240, 270, 300, 330, 360];

                        for (const days of offsets) {
                            const reminderDate = new Date(txnDateObj.getTime() + days * 24 * 60 * 60 * 1000);
                            const alertTime = getRandomTimeForDate(reminderDate);

                            if (alertTime.getTime() > Date.now()) {
                                const trigger = {
                                    type: TriggerType.TIMESTAMP,
                                    timestamp: alertTime.getTime(),
                                };

                                const msg = txn.type === 'outgoing'
                                    ? `It has been ${days} days since you lent ₹${txn.amount} to ${person.name}.`
                                    : `It has been ${days} days since you borrowed ₹${txn.amount} from ${person.name}.`;

                                await notifee.createTriggerNotification(
                                    {
                                        id: `debt_${txn.id}_day_${days}`,
                                        title: 'Debt Reminder 🔔',
                                        body: msg,
                                        android: {
                                            channelId: 'credpilot-alerts',
                                            importance: AndroidImportance.HIGH,
                                        },
                                    },
                                    trigger
                                );
                                console.log(`[Notifee] Scheduled debt ${txn.id} reminder for day ${days} at ${alertTime}`);
                            }
                        }
                    }
                }
            }
        }

        console.log('[Notifee] Sync completed successfully.');
    } catch (e) {
        console.error('[Notifee] Sync failed:', e);
    }
};
