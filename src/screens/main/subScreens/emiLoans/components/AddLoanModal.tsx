import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font14, font16, font20 } from '../../../../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../../../../utils/responsive';
import { ShowToast } from '../../../../../utils/CustomToast/ToastManager';
import { insert } from '../../../../../storage/local/sqlite';
import { useCreateEmiLoanMutation, extractApiErrorMessage } from '../../../../../API';
import { calculateEMI } from '../utils/emiCalculator';
import CalendarModal from '../../../../../ui/modals/CalendarModal';
import Svg, { Path, Rect } from 'react-native-svg';

const CloseIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6L18 18" stroke="#141414" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const CalendarIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="18" rx="2" stroke="#141414" strokeWidth="1.8" />
        <Path d="M16 2V6M8 2V6M3 10H21" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
);

interface AddLoanModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddLoanModal({ visible, onClose, onSuccess }: AddLoanModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(resHeight(30))).current;
    const [createEmiLoanApi, { isLoading: isCreating }] = useCreateEmiLoanMutation();

    const [loanName, setLoanName] = useState('');
    const [lender, setLender] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [rate, setRate] = useState('');
    const [tenure, setTenure] = useState('');
    const [startDate, setStartDate] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>('name');

    useEffect(() => {
        if (visible) {
            setLoanName('');
            setLender('');
            setLoanAmount('');
            setRate('');
            setTenure('');
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            setStartDate(`${dd}/${mm}/${yyyy}`);
            setFocusedField('name');

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: resHeight(25),
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    const handleAddLoan = async () => {
        const trimmedName = loanName.trim();
        const trimmedLender = lender.trim();
        const parsedAmount = parseFloat(loanAmount.replace(/,/g, ''));
        const parsedRate = parseFloat(rate.replace(/,/g, '')) || 0;
        const parsedTenure = parseInt(tenure.replace(/,/g, ''), 10);

        if (!trimmedName) {
            ShowToast('Please enter loan name', 'error');
            return;
        }

        if (!trimmedLender) {
            ShowToast('Please enter lender name', 'error');
            return;
        }

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            ShowToast('Please enter a valid loan amount', 'error');
            return;
        }

        if (isNaN(parsedTenure) || parsedTenure <= 0) {
            ShowToast('Please enter a valid tenure in months', 'error');
            return;
        }

        const payload = {
            name: trimmedName,
            lender: trimmedLender,
            amount: parsedAmount,
            rate: parsedRate,
            tenure: parsedTenure,
            startDate: startDate ? new Date(startDate.split('/').reverse().join('-')).toISOString() : new Date().toISOString(),
            paidEmis: 0,
        };

        const res: any = await createEmiLoanApi(payload);
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || 'Loan added successfully!', 'success');

            const calculatedEmi = calculateEMI(parsedAmount, parsedRate, parsedTenure);
            const now = new Date().toISOString();

            try {
                insert('emi_loans', {
                    title: trimmedName,
                    lender: trimmedLender,
                    amount: parsedAmount,
                    rate: parsedRate,
                    tenure: parsedTenure,
                    start_date: startDate || new Date().toLocaleDateString('en-GB'),
                    emi_amount: calculatedEmi,
                    paid_emis: 0,
                    status: 'active',
                    created_at: now,
                });
            } catch (err) { }

            handleClose();
            onSuccess();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to add loan', 'error');
            return;
        }
    };

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={handleClose}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.overlay}
                >
                    <TouchableWithoutFeedback onPress={handleClose}>
                        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                    </TouchableWithoutFeedback>

                    <Animated.View
                        style={[
                            styles.dialogCard,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <ScrollView
                            bounces={false}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <CustomText style={styles.headerTitle}>Add loan</CustomText>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleClose}
                                    style={styles.closeBtn}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <CloseIcon />
                                </TouchableOpacity>
                            </View>

                            {/* Loan name */}
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === 'name' && styles.focusedInput,
                                ]}
                                placeholder="Loan name e.g. Car loan"
                                placeholderTextColor="#8E8E93"
                                value={loanName}
                                onChangeText={setLoanName}
                                onFocus={() => setFocusedField('name')}
                                autoFocus
                            />

                            {/* Lender */}
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === 'lender' && styles.focusedInput,
                                ]}
                                placeholder="Lender e.g. HDFC Bank"
                                placeholderTextColor="#8E8E93"
                                value={lender}
                                onChangeText={setLender}
                                onFocus={() => setFocusedField('lender')}
                            />

                            {/* Loan amount */}
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedField === 'amount' && styles.focusedInput,
                                ]}
                                placeholder="Loan amount"
                                placeholderTextColor="#8E8E93"
                                keyboardType="numeric"
                                value={loanAmount}
                                onChangeText={setLoanAmount}
                                onFocus={() => setFocusedField('amount')}
                            />

                            {/* Side by side: Rate & Tenure */}
                            <View style={styles.rowInputs}>
                                <TextInput
                                    style={[
                                        styles.inputHalf,
                                        focusedField === 'rate' && styles.focusedInput,
                                    ]}
                                    placeholder="Rate % p.a."
                                    placeholderTextColor="#8E8E93"
                                    keyboardType="numeric"
                                    value={rate}
                                    onChangeText={setRate}
                                    onFocus={() => setFocusedField('rate')}
                                />

                                <TextInput
                                    style={[
                                        styles.inputHalf,
                                        focusedField === 'tenure' && styles.focusedInput,
                                    ]}
                                    placeholder="Tenure (months)"
                                    placeholderTextColor="#8E8E93"
                                    keyboardType="numeric"
                                    value={tenure}
                                    onChangeText={setTenure}
                                    onFocus={() => setFocusedField('tenure')}
                                />
                            </View>

                            {/* Start Date Picker Input */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setShowCalendar(true)}
                                style={styles.datePickerInput}
                            >
                                <CalendarIcon />
                                <CustomText style={styles.dateText}>
                                    {startDate || 'Select start date'}
                                </CustomText>
                                <CalendarIcon />
                            </TouchableOpacity>

                            {/* Submit Button */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={handleAddLoan}
                                style={styles.submitBtn}
                            >
                                <CustomText style={styles.submitBtnText}>Add loan</CustomText>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Calendar Modal */}
            <CalendarModal
                show={showCalendar}
                setShow={setShowCalendar}
                value={startDate}
                onSelectDate={(selected) => {
                    setStartDate(selected);
                    setShowCalendar(false);
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: resWidth(4),
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    dialogCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(5),
        paddingHorizontal: resWidth(5),
        paddingTop: resAvarage(3),
        paddingBottom: resAvarage(3),
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        maxHeight: resHeight(88),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: resAvarage(2.5),
    },
    headerTitle: {
        fontSize: font20,
        fontFamily: FontBold,
        color: '#141414',
    },
    closeBtn: {
        padding: 4,
    },
    input: {
        height: 52,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: font14,
        fontFamily: FontRegular,
        color: '#141414',
        marginBottom: 14,
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },
    inputHalf: {
        flex: 1,
        height: 52,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: font14,
        fontFamily: FontRegular,
        color: '#141414',
    },
    focusedInput: {
        borderColor: '#141414',
        backgroundColor: '#FFFFFF',
    },
    datePickerInput: {
        height: 52,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateText: {
        fontSize: font14,
        fontFamily: FontRegular,
        color: '#141414',
    },
    submitBtn: {
        height: 52,
        backgroundColor: '#0D0D0D',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtnText: {
        fontSize: font16,
        fontFamily: FontSemiBold,
        color: '#FFFFFF',
    },
});

