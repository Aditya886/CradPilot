export const stringToNumber = (input: any): number => {
  if (typeof input !== 'string') {
    try {
      input = String(input);
    } catch {
      return 0;
    }
  }
  const cleaned = input.replace(/\D/g, '');
  return Number(cleaned || 0);
};

export const numberToPhoneCodeString = (input: number): string => {
  return `+${input}`;
};

export const numberToPhoneString = (input: number): string => {
  const raw = input.toString();
  return raw.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

export const numberToString = (value: number) => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return '';
};

export const formatINR = (num: number, includeDecimals = false): string => {
  if (isNaN(num) || num === null || num === undefined) return '₹0';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixedNum = absNum.toFixed(includeDecimals ? 2 : 0);
  const parts = fixedNum.split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherParts = parts[0].substring(0, parts[0].length - 3);
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + (parts[1] ? '.' + parts[1] : '');
  return (isNegative ? '-' : '') + '₹' + formatted;
};

export const calculateExpectedInterest = (
  amount: number,
  rate: number,
  ratePeriod: string,
  interestType: string,
  compoundFreq: string,
  repaymentMethod: string,
  term: number
): number => {
  const principal = amount;
  const interestRatePercent = rate;
  const months = repaymentMethod === 'Installments' ? (term || 12) : 12;

  let monthlyRate = interestRatePercent / 100;
  if (ratePeriod === 'Yearly') {
    monthlyRate = (interestRatePercent / 12) / 100;
  } else if (ratePeriod === 'Daily') {
    monthlyRate = (interestRatePercent * 30) / 100;
  }

  let calculatedInterest = 0;
  if (interestType === 'Simple') {
    calculatedInterest = principal * monthlyRate * months;
  } else if (interestType === 'Compound') {
    let compoundTimesPerMonth = 1;
    if (compoundFreq === 'Daily') compoundTimesPerMonth = 30;
    if (compoundFreq === 'Quarterly') compoundTimesPerMonth = 1 / 3;
    if (compoundFreq === 'Half-yr') compoundTimesPerMonth = 1 / 6;
    if (compoundFreq === 'Yearly') compoundTimesPerMonth = 1 / 12;

    const n = compoundTimesPerMonth;
    const t = months;
    const A = principal * Math.pow(1 + (monthlyRate / n), n * t);
    calculatedInterest = A - principal;
  } else if (interestType === 'Reducing') {
    if (repaymentMethod === 'Installments') {
      const mCount = months;
      if (monthlyRate === 0) {
        calculatedInterest = 0;
      } else {
        const compoundFactor = Math.pow(1 + monthlyRate, mCount);
        const installment = principal * monthlyRate * compoundFactor / (compoundFactor - 1);
        const totalPayable = installment * mCount;
        calculatedInterest = totalPayable - principal;
      }
    } else {
      // Flexible reducing balance
      let compoundTimesPerMonth = 1;
      if (compoundFreq === 'Daily') compoundTimesPerMonth = 30;
      if (compoundFreq === 'Quarterly') compoundTimesPerMonth = 1 / 3;
      if (compoundFreq === 'Half-yr') compoundTimesPerMonth = 1 / 6;
      if (compoundFreq === 'Yearly') compoundTimesPerMonth = 1 / 12;

      const n = compoundTimesPerMonth;
      const t = months;
      const A = principal * Math.pow(1 + (monthlyRate / n), n * t);
      calculatedInterest = A - principal;
    }
  }
  return Math.round(calculatedInterest);
};
