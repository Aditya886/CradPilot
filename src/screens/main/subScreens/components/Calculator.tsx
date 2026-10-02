import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { CommonBg } from '../../../../ui/common/CommonBg'
import InsightHeader from './InsightHeader'
import CalculatorInput from './CalculatorInput'
import CalculatorGraph from './CalculatorGraph'
import TotalCard from './TotalCard'
import CalculatorDetails from './CalculatorDetails'

export default function Calculator() {
    const [principal, setPrincipal] = useState<string>('100000');
    const [rate, setRate] = useState<string>('12');
    const [ratePeriod, setRatePeriod] = useState<string>('Y');
    const [interestType, setInterestType] = useState<string>('Simple');
    const [compounding, setCompounding] = useState<string>('Monthly');
    const [duration, setDuration] = useState<string>('1');
    const [durationUnit, setDurationUnit] = useState<string>('Y');
    const [repayment, setRepayment] = useState<string>('Flaxible'); // Matching option spelling "Flaxible"
    const [repaymentMonths, setRepaymentMonths] = useState<string>('12');

    // Convert string inputs to floats safely
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const d = parseFloat(duration) || 0;

    // Convert duration to days for consistent breakdown calculations
    let durationInDays = 0;
    if (durationUnit === 'D') {
        durationInDays = d;
    } else if (durationUnit === 'M') {
        durationInDays = d * 30.4375; // Using average month length
    } else if (durationUnit === 'Y') {
        durationInDays = d * 365.25; // Using average year length
    }

    const durationDays = durationInDays > 0 ? durationInDays : 1;

    // Convert interest rate to annual decimal rate
    let annualRate = 0;
    if (ratePeriod === 'Y') {
        annualRate = r / 100;
    } else if (ratePeriod === 'M') {
        annualRate = (r * 12) / 100;
    } else if (ratePeriod === 'D') {
        annualRate = (r * 365.25) / 100;
    }

    const durationInYears = durationDays / 365.25;

    let totalInterest = 0;
    let totalPayable = 0;

    if (interestType === 'Simple') {
        let N = 0;
        if (ratePeriod === 'D') {
            N = durationDays;
        } else if (ratePeriod === 'M') {
            N = durationDays / 30.4375;
        } else if (ratePeriod === 'Y') {
            N = durationDays / 365.25;
        }
        totalInterest = p * (r / 100) * N;
        totalPayable = p + totalInterest;
    } else if (interestType === 'Compound') {
        let n = 12;
        if (compounding === 'Daily') n = 365;
        else if (compounding === 'Monthly') n = 12;
        else if (compounding === 'Qtr') n = 4;
        else if (compounding === 'Half') n = 2;
        else if (compounding === 'Yearly') n = 1;

        totalPayable = p * Math.pow(1 + annualRate / n, n * durationInYears);
        totalInterest = totalPayable - p;
    } else if (interestType === 'Reducing') {
        if (repayment === 'Instalments') {
            const mCount = parseFloat(repaymentMonths) || 12;

            // Interest rate is converted to a monthly rate since payments are monthly installments
            let monthlyRate = 0;
            if (ratePeriod === 'Y') {
                monthlyRate = (r / 12) / 100;
            } else if (ratePeriod === 'M') {
                monthlyRate = r / 100;
            } else if (ratePeriod === 'D') {
                monthlyRate = (r * 30.4375) / 100;
            }

            if (monthlyRate === 0) {
                totalPayable = p;
                totalInterest = 0;
            } else {
                const compoundFactor = Math.pow(1 + monthlyRate, mCount);
                const installment = p * monthlyRate * compoundFactor / (compoundFactor - 1);
                totalPayable = installment * mCount;
                totalInterest = totalPayable - p;
            }
        } else {
            // Flexible reducing balance behaves like compounding interest on outstanding amount
            let n = 12;
            if (compounding === 'Daily') n = 365;
            else if (compounding === 'Monthly') n = 12;
            else if (compounding === 'Qtr') n = 4;
            else if (compounding === 'Half') n = 2;
            else if (compounding === 'Yearly') n = 1;

            totalPayable = p * Math.pow(1 + annualRate / n, n * durationInYears);
            totalInterest = totalPayable - p;
        }
    }

    // Safety bounds
    totalInterest = Math.max(0, totalInterest);
    totalPayable = Math.max(0, totalPayable);

    // Calculate daily, monthly, yearly averages
    const finalDurationDays = (interestType === 'Reducing' && repayment === 'Instalments')
        ? (parseFloat(repaymentMonths) || 12) * 30.4375
        : durationDays;

    const interestPerDay = totalInterest / finalDurationDays;
    const interestPerMonth = interestPerDay * 30.4375;
    const interestPerYear = interestPerDay * 365.25;

    return (
        <CommonBg>
            <InsightHeader title={"Finances"} subtitle={"Calculator"} />
            <ScrollView>
                <TotalCard totalPayable={totalPayable} totalInterest={totalInterest} />
                <CalculatorInput
                    principal={principal}
                    setPrincipal={setPrincipal}
                    rate={rate}
                    setRate={setRate}
                    ratePeriod={ratePeriod}
                    setRatePeriod={setRatePeriod}
                    interestType={interestType}
                    setInterestType={setInterestType}
                    compounding={compounding}
                    setCompounding={setCompounding}
                    duration={duration}
                    setDuration={setDuration}
                    durationUnit={durationUnit}
                    setDurationUnit={setDurationUnit}
                    repayment={repayment}
                    setRepayment={setRepayment}
                    repaymentMonths={repaymentMonths}
                    setRepaymentMonths={setRepaymentMonths}
                />
                <CalculatorGraph principal={p} totalInterest={totalInterest} />
                <CalculatorDetails
                    interestPerDay={interestPerDay}
                    interestPerMonth={interestPerMonth}
                    interestPerYear={interestPerYear}
                    totalInterest={totalInterest}
                    totalPayable={totalPayable}
                />
            </ScrollView>
        </CommonBg>
    )
}

const styles = StyleSheet.create({})