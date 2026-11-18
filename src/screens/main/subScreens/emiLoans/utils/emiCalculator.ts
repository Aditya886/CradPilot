export interface AmortisationItem {
    emiNumber: number;
    dateStr: string;
    principal: number;
    interest: number;
    balance: number;
    isPaid: boolean;
}

export interface EmiLoanStats {
    monthlyEmi: number;
    totalPayable: number;
    totalInterest: number;
    paidSoFar: number;
    outstanding: number;
    remainingEmis: number;
    nextDueDate: string;
    progressRatio: number;
    schedule: AmortisationItem[];
}

/**
 * Calculates monthly EMI based on Reducing Balance Interest.
 * If rate is 0%, simple equal monthly installments.
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    if (tenureMonths <= 0) return 0;
    if (annualRate <= 0) {
        return Math.round(principal / tenureMonths);
    }
    const r = annualRate / 12 / 100;
    const factor = Math.pow(1 + r, tenureMonths);
    if (factor === 1) return Math.round(principal / tenureMonths);
    const emi = (principal * r * factor) / (factor - 1);
    return Math.round(emi);
}

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseDateDDMMYYYY(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parseInt(parts[2], 10);
        return new Date(y, m, d);
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Generates the full amortization schedule for the loan.
 */
export function generateAmortisationSchedule(
    principal: number,
    annualRate: number,
    tenureMonths: number,
    startDateStr: string,
    paidEmis: number
): AmortisationItem[] {
    const schedule: AmortisationItem[] = [];
    const emi = calculateEMI(principal, annualRate, tenureMonths);
    const r = annualRate > 0 ? annualRate / 12 / 100 : 0;
    const startDate = parseDateDDMMYYYY(startDateStr);

    let currentBalance = principal;

    for (let i = 1; i <= tenureMonths; i++) {
        // Date for EMI i (starts from startDate, each subsequent month)
        const emiDate = new Date(startDate.getFullYear(), startDate.getMonth() + (i - 1), startDate.getDate());
        const shortMonth = MONTH_NAMES_SHORT[emiDate.getMonth()];
        const shortYear = emiDate.getFullYear().toString().slice(-2);
        const dateStr = `${shortMonth} ${shortYear}`;

        let interest = 0;
        let principalPaid = 0;

        if (r > 0) {
            interest = Math.round(currentBalance * r);
            principalPaid = Math.min(currentBalance, Math.max(0, emi - interest));
        } else {
            interest = 0;
            principalPaid = Math.min(currentBalance, emi);
        }

        currentBalance = Math.max(0, currentBalance - principalPaid);
        if (i === tenureMonths) {
            currentBalance = 0;
        }

        schedule.push({
            emiNumber: i,
            dateStr,
            principal: principalPaid,
            interest,
            balance: currentBalance,
            isPaid: i <= paidEmis,
        });
    }

    return schedule;
}

/**
 * Calculates complete real-time stats for a given loan.
 */
export function computeLoanStats(
    amount: number,
    rate: number,
    tenure: number,
    startDateStr: string,
    paidEmis: number
): EmiLoanStats {
    const monthlyEmi = calculateEMI(amount, rate, tenure);
    const totalPayable = monthlyEmi * tenure;
    const totalInterest = Math.max(0, totalPayable - amount);
    const paidSoFar = Math.min(totalPayable, paidEmis * monthlyEmi);
    const remainingEmis = Math.max(0, tenure - paidEmis);

    const schedule = generateAmortisationSchedule(amount, rate, tenure, startDateStr, paidEmis);

    let outstanding = amount;
    if (paidEmis >= tenure) {
        outstanding = 0;
    } else if (paidEmis > 0 && paidEmis <= schedule.length) {
        outstanding = schedule[paidEmis - 1]?.balance ?? 0;
    }

    // Format next due date
    let nextDueDate = 'Fully repaid';
    if (paidEmis < tenure) {
        const startDate = parseDateDDMMYYYY(startDateStr);
        const nextDate = new Date(startDate.getFullYear(), startDate.getMonth() + paidEmis, startDate.getDate());
        const day = nextDate.getDate();
        const month = nextDate.getMonth() === 8 ? 'Sept' : MONTH_NAMES_SHORT[nextDate.getMonth()];
        const year = nextDate.getFullYear();
        nextDueDate = `${day} ${month} ${year}`;
    }

    const progressRatio = tenure > 0 ? Math.min(1, Math.max(0, paidEmis / tenure)) : 0;

    return {
        monthlyEmi,
        totalPayable,
        totalInterest,
        paidSoFar,
        outstanding,
        remainingEmis,
        nextDueDate,
        progressRatio,
        schedule,
    };
}

