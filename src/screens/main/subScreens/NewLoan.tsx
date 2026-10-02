import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { CommonBg } from '../../../ui/common/CommonBg'
import { resAvarage, resWidth } from '../../../utils/responsive'
import InsightHeader from './components/InsightHeader'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { font10, font12, font13, font14, font15, font16 } from '../../../utils/fontSizes'
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../utils/fontFamily'
import { goBack } from '../../../navigation/NavigationUtils'
import { formatINR } from '../../../utils/FormatUtil'
import CustomInput from '../../../ui/components/CustomInput'
import CustomButton from '../../../ui/components/CustomButton'
import ButtonSlider from '../../../ui/components/ButtonSlider'
import { PieChart } from 'react-native-gifted-charts'
import { insert, getWhere } from '../../../storage/local/sqlite'
import CalendarModal from '../../../ui/modals/CalendarModal'
import { syncNotifications } from '../../../services/localNotificationService'

// Svg components
import Svg, { Rect, Path } from 'react-native-svg';
const CalendarIcon = (props: any) => (
    <Svg viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
        <Path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
);

export default function NewLoan({ route }: any) {
    const prefilledBorrower = route?.params?.borrower;

    // Borrower Info
    const [name, setName] = useState(prefilledBorrower?.name || '');
    const [phone, setPhone] = useState(prefilledBorrower?.phone || '');
    const [address, setAddress] = useState(prefilledBorrower?.address || '');

    // Loan Info
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loanDate, setLoanDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [dueDate, setDueDate] = useState('');
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState<'loan' | 'due' | null>(null);

    // Interest Info
    const [rate, setRate] = useState('2');
    const [ratePeriod, setRatePeriod] = useState('Monthly'); // Daily, Monthly, Yearly
    const [interestType, setInterestType] = useState('Simple'); // Simple, Compound, Reducing
    const [compoundFreq, setCompoundFreq] = useState('Quarterly'); // Daily, Monthly, Quarterly, Half-yr, Yearly
    const [interestApplied, setInterestApplied] = useState('Original (fixed)'); // Original (fixed), Remaining (reducing)

    // Repayment Info
    const [repaymentMethod, setRepaymentMethod] = useState('Flexible'); // Flexible, Installments
    const [term, setTerm] = useState('12');

    const handleInterestTypeChange = (val: string) => {
        setInterestType(val);
        if (val === 'Reducing') {
            setInterestApplied('Remaining (reducing)');
        } else {
            setInterestApplied('Original (fixed)');
            setRepaymentMethod('Flexible');
        }
    };

    const calculateAutomaticDueDate = (dateStr: string, period: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length !== 3) return '';
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed month
        const year = parseInt(parts[2], 10);

        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) return '';

        if (period === 'Monthly') {
            date.setMonth(date.getMonth() + 1);
        } else if (period === 'Daily') {
            date.setDate(date.getDate() + 1);
        } else if (period === 'Yearly') {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }

        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    React.useEffect(() => {
        if (repaymentMethod === 'Installments' && loanDate) {
            const calculated = calculateAutomaticDueDate(loanDate, ratePeriod);
            setDueDate(calculated);
        } else {
            setDueDate('');
        }
    }, [loanDate, ratePeriod, repaymentMethod]);

    // Dynamic Math for Live Preview
    const previewValues = React.useMemo(() => {
        const principal = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
        const interestRatePercent = parseFloat(rate) || 0;
        const months = repaymentMethod === 'Installments' ? (parseInt(term, 10) || 1) : 12;

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
                // Flexible reducing balance behaves like compounding interest on outstanding amount
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

        const total = principal + calculatedInterest;
        const installment = total / months;
        const dailyRate = calculatedInterest / (months * 30);
        const monthlyRateValue = calculatedInterest / months;

        return {
            principal,
            interest: Math.round(calculatedInterest),
            total: Math.round(total),
            installment: Math.round(installment),
            dailyRate: Math.round(dailyRate),
            monthlyRateValue: Math.round(monthlyRateValue)
        };
    }, [amount, rate, ratePeriod, interestType, compoundFreq, repaymentMethod, term]);

    const handleCreateLoan = () => {
        if (!name.trim() || !phone.trim() || !amount.trim()) {
            return;
        }

        try {
            // Find or create borrower
            let borrower = getWhere('borrowers', 'phone = ?', [phone.trim()])[0];
            let borrowerId;
            if (!borrower) {
                insert('borrowers', {
                    name: name.trim(),
                    phone: phone.trim(),
                    address: address.trim() || null
                });
                borrower = getWhere('borrowers', 'phone = ?', [phone.trim()])[0];
            }
            borrowerId = borrower.id;

            const principalAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;

            insert('loans', {
                borrower_id: borrowerId,
                title: description.trim() || `${name}'s Loan`,
                amount: principalAmount,
                description: description.trim() || null,
                loan_date: loanDate,
                due_date: dueDate || null,
                rate: parseFloat(rate) || 0,
                rate_period: ratePeriod,
                interest_type: interestType,
                compound_freq: (interestType === 'Compound' || (interestType === 'Reducing' && repaymentMethod === 'Flexible')) ? compoundFreq : null,
                interest_applied: interestApplied,
                repayment_method: repaymentMethod,
                term: repaymentMethod === 'Installments' ? parseInt(term, 10) : null,
                status: 'Active'
            });

            // Sync scheduled notifications
            syncNotifications();

            goBack();
        } catch (error) {
            console.error('Error creating loan:', error);
        }
    };

    // Gifted PieChart data preparation
    const pieData = React.useMemo(() => {
        const data = [];
        if (previewValues.principal > 0) {
            data.push({ value: previewValues.principal, color: colors.black });
        }
        if (previewValues.interest > 0) {
            data.push({ value: previewValues.interest, color: '#CDFA27' });
        }
        if (data.length === 0) {
            data.push({ value: 1, color: 'rgba(20, 20, 20, 0.05)' });
        }
        return data;
    }, [previewValues]);

    return (
        <CommonBg style={{ flex: 1 }}>
            <InsightHeader title={"Finance"} subtitle={"New loan"} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Borrower Card */}
                <View style={styles.card}>
                    <CustomText style={styles.cardHeader}>BORROWER</CustomText>

                    <CustomInput
                        label="Name"
                        placeholder="Full name"
                        value={name}
                        onChangeText={setName}
                        containerWidth={resWidth(82)}
                    />

                    <CustomInput
                        label="Phone"
                        placeholder="10-digit number"
                        keyboardType="numeric"
                        value={phone}
                        onChangeText={setPhone}
                        containerWidth={resWidth(82)}
                    />

                    <CustomInput
                        label="Address (optional)"
                        placeholder="Street, city"
                        value={address}
                        onChangeText={setAddress}
                        containerWidth={resWidth(82)}
                    />
                </View>

                {/* Loan Card */}
                <View style={styles.card}>
                    <CustomText style={styles.cardHeader}>LOAN</CustomText>

                    <CustomInput
                        label="Principal amount"
                        placeholder="₹"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        containerWidth={resWidth(82)}
                    />

                    <View style={styles.formGroup}>
                        <CustomInput
                            label="Description (optional)"
                            placeholder="What is this loan for?"
                            value={description}
                            onChangeText={setDescription}
                            containerWidth={resWidth(82)}
                            bottomText={"Purpose of the loan — e.g. business capital, family emergency, vehicle repair."}
                        />

                    </View>

                    <View style={styles.row}>
                        <CustomInput
                            label="Loan date"
                            placeholder="dd/mm/yyyy"
                            value={loanDate}
                            onPress={() => {
                                setCalendarTarget('loan');
                                setShowCalendarModal(true);
                            }}
                            Sufix={CalendarIcon}
                            containerWidth={repaymentMethod === 'Flexible' ? resWidth(75) : resWidth(36)}
                        />

                        {repaymentMethod !== 'Flexible' && (
                            <CustomInput
                                label="Due date"
                                placeholder="dd/mm/yyyy"
                                value={dueDate}
                                onPress={() => {
                                    setCalendarTarget('due');
                                    setShowCalendarModal(true);
                                }}
                                Sufix={CalendarIcon}
                                containerWidth={resWidth(36)}
                            />
                        )}
                    </View>
                </View>

                {/* Interest Card */}
                <View style={styles.card}>
                    <CustomText style={styles.cardHeader}>INTEREST</CustomText>

                    <View style={styles.row}>
                        <CustomInput
                            label="Rate (%)"
                            placeholder="e.g. 2"
                            keyboardType="numeric"
                            value={rate}
                            onChangeText={setRate}
                            containerWidth={resWidth(33)}
                        />

                        <ButtonSlider
                            label="Rate period"
                            options={['Daily', 'Monthly', 'Yearly']}
                            value={ratePeriod}
                            onSelect={setRatePeriod}
                            sliderWidth={resWidth(42)}
                        />
                    </View>

                    <View style={{ gap: resAvarage(3) }} >
                        <ButtonSlider
                            label="Interest type"
                            options={['Simple', 'Compound', 'Reducing']}
                            value={interestType}
                            onSelect={handleInterestTypeChange}
                            sliderWidth={resWidth(82)}
                        />

                        {(interestType === 'Compound' || (interestType === 'Reducing' && repaymentMethod === 'Flexible')) && (
                            <ButtonSlider
                                label="Compounding frequency"
                                options={['Daily', 'Monthly', 'Quarterly', 'Half-yr', 'Yearly']}
                                value={compoundFreq}
                                onSelect={setCompoundFreq}
                                sliderWidth={resWidth(82)}
                            />
                        )}
                    </View>
                </View>

                {/* Repayment Card */}
                {interestType === 'Reducing' && (
                    <View style={styles.card}>
                        <CustomText style={styles.cardHeader}>REPAYMENT</CustomText>

                        <View style={styles.formGroup}>
                            <ButtonSlider
                                label="Method"
                                options={['Flexible', 'Installments']}
                                value={repaymentMethod}
                                onSelect={setRepaymentMethod}
                                sliderWidth={resWidth(82)}
                            />
                            <CustomText style={styles.helpText}>
                                Flexible allows irregular payments. Installments = fixed monthly amount.
                            </CustomText>
                        </View>

                        {repaymentMethod === 'Installments' && (
                            <CustomInput
                                label="Term (months)"
                                placeholder="e.g. 12"
                                keyboardType="numeric"
                                value={term}
                                onChangeText={setTerm}
                                containerWidth={resWidth(82)}
                            />
                        )}
                    </View>
                )}

                {/* Live Preview Card */}
                {previewValues.total > 0 && (
                    <View style={styles.card}>
                        <View style={[styles.row, { justifyContent: "space-between", alignItems: "flex-start" }]} >
                            <CustomText style={styles.cardHeader}>LIVE PREVIEW</CustomText>
                        </View>

                        <View style={styles.previewContainer}>
                            {/* Donut Chart using react-native-gifted-charts */}
                            <View style={styles.donutWrapper}>
                                <PieChart
                                    donut
                                    data={pieData}
                                    radius={resAvarage(9)}
                                    innerRadius={resAvarage(7)}
                                />
                                <View style={styles.donutTextBelow}>
                                    <CustomText style={[styles.cardHeader, { marginBottom: resAvarage(0) }]}>TOTAL</CustomText>
                                    <CustomText numberOfLines={1} adjustsFontSizeToFit style={styles.donutTotalText}>
                                        {formatINR(previewValues.total)}
                                    </CustomText>
                                </View>
                            </View>

                            {/* Legend Details */}
                            <View style={styles.legendWrapper}>
                                <View style={styles.legendRow}>
                                    <View style={styles.legendDotGroup}>
                                        <View style={[styles.legendDot, { backgroundColor: colors.black }]} />
                                        <CustomText style={styles.legendTitle}>Principal</CustomText>
                                    </View>
                                    <CustomText style={styles.legendVal}>{formatINR(previewValues.principal)}</CustomText>
                                </View>

                                <View style={styles.legendRow}>
                                    <View style={styles.legendDotGroup}>
                                        <View style={[styles.legendDot, { backgroundColor: '#CDFA27' }]} />
                                        <CustomText style={styles.legendTitle}>Interest (est.)</CustomText>
                                    </View>
                                    <CustomText style={styles.legendVal}>{formatINR(previewValues.interest)}</CustomText>
                                </View>

                                <CustomText style={styles.rateBreakdownText}>
                                    {`${formatINR(previewValues.dailyRate)}/day · ${formatINR(previewValues.monthlyRateValue)}/mo`}
                                </CustomText>

                                {repaymentMethod === 'Installments' && (
                                    <CustomText style={styles.installmentText}>
                                        {`Installment: ${formatINR(previewValues.installment)}/mo`}
                                    </CustomText>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Footer Action Buttons */}
                <View style={styles.footerButtons}>
                    <CustomButton
                        title="Cancel"
                        onPress={() => goBack()}
                        variant="secondary"
                        // backgroundColor="transparent"
                        // textColor={colors.black70}
                        style={[{ flex: 1 }]}
                        // buttonSize={{ paddingVertical: 0 }}
                        textStyle={styles.cancelBtnText}
                    />
                    <CustomButton
                        title="Create loan"
                        onPress={handleCreateLoan}
                        disabled={!name.trim() || !phone.trim() || !amount.trim()}
                        // variant="primary"
                        // backgroundColor={(!name.trim() || !phone.trim() || !amount.trim()) ? 'rgba(20, 20, 20, 0.35)' : colors.black}
                        style={[{ flex: 1 }]}
                        // buttonSize={{ paddingVertical: 0 }}
                        textStyle={styles.createBtnText}
                    />
                </View>
            </ScrollView>
            <CalendarModal
                show={showCalendarModal}
                setShow={setShowCalendarModal}
                value={calendarTarget === 'loan' ? loanDate : dueDate}
                title={calendarTarget === 'loan' ? 'Select Loan Date' : 'Select Due Date'}
                showClear={calendarTarget === 'due'}
                onSelectDate={(date) => {
                    if (calendarTarget === 'loan') {
                        setLoanDate(date);
                    } else if (calendarTarget === 'due') {
                        setDueDate(date);
                    }
                }}
            />
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    donutTextBelow: {
        flexDirection: 'column',
        alignItems: 'center',
        position: "absolute",
        // justifyContent: 'center',
    },
    scrollContent: {
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(8),
        gap: resAvarage(3.5),
    },
    card: {
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
    },
    cardHeader: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black80,
        letterSpacing: resAvarage(0.1),
        textTransform: 'uppercase',
        marginBottom: resAvarage(2.5),
    },
    formGroup: {
        gap: resAvarage(1.5),
    },
    helpText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black60,
        lineHeight: font12 * 1.4,
        paddingLeft: resAvarage(0.5),
    },
    row: {
        flexDirection: 'row',
        gap: resWidth(4),
        alignItems: 'flex-end',
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: resAvarage(1),
        gap: resWidth(4),
    },
    donutWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutTotalText: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.black,
        textAlign: 'center',
        maxWidth: resWidth(24),
    },
    donutLabel: {
        fontFamily: FontRegular,
        fontSize: font10,
        color: colors.black60,
        marginTop: resAvarage(0.2),
    },
    legendWrapper: {
        flex: 1,
        gap: resAvarage(1.8),
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    legendDotGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resWidth(2),
    },
    legendDot: {
        width: resAvarage(2.5),
        height: resAvarage(2.5),
        borderRadius: resAvarage(100),
    },
    legendTitle: {
        fontFamily: FontRegular,
        fontSize: font14,
        color: colors.black70,
    },
    legendVal: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.black,
    },
    rateBreakdownText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black60,
        marginTop: resAvarage(1),
    },
    installmentText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
        color: colors.black,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: resWidth(4),
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(1.5),
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.black70,
    },
    createBtn: {
        flex: 1,
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    createBtnDisabled: {
        backgroundColor: 'rgba(20, 20, 20, 0.35)',
    },
    createBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.white,
    },
})